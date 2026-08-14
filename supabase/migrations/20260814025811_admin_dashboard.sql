-- Folio: painel administrativo, fila de privacidade e presença em tempo real.

CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  CONSTRAINT user_roles_role_check CHECK (role IN ('admin'))
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.user_roles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.user_roles TO authenticated;

DROP POLICY IF EXISTS user_roles_select_own ON public.user_roles;
CREATE POLICY user_roles_select_own ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = (SELECT auth.uid())
      AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;

ALTER TABLE public.privacy_requests
  ADD COLUMN IF NOT EXISTS assigned_admin_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS admin_response text,
  ADD COLUMN IF NOT EXISTS resolution_status text,
  ADD COLUMN IF NOT EXISTS responded_at timestamptz,
  ADD COLUMN IF NOT EXISTS response_delivery_status text NOT NULL DEFAULT 'NOT_SENT',
  ADD COLUMN IF NOT EXISTS response_delivery_error_code text;

ALTER TABLE public.privacy_requests
  DROP CONSTRAINT IF EXISTS privacy_requests_admin_response_check,
  ADD CONSTRAINT privacy_requests_admin_response_check
    CHECK (admin_response IS NULL OR char_length(admin_response) BETWEEN 8 AND 4000),
  DROP CONSTRAINT IF EXISTS privacy_requests_resolution_status_check,
  ADD CONSTRAINT privacy_requests_resolution_status_check
    CHECK (resolution_status IS NULL OR resolution_status IN ('COMPLETED', 'REJECTED')),
  DROP CONSTRAINT IF EXISTS privacy_requests_delivery_status_check,
  ADD CONSTRAINT privacy_requests_delivery_status_check
    CHECK (response_delivery_status IN ('NOT_SENT', 'PENDING', 'SENT', 'FAILED'));

CREATE INDEX IF NOT EXISTS idx_privacy_requests_admin_queue
  ON public.privacy_requests (status, created_at DESC);

DROP POLICY IF EXISTS privacy_requests_admin_select ON public.privacy_requests;
CREATE POLICY privacy_requests_admin_select ON public.privacy_requests
  FOR SELECT TO authenticated
  USING ((SELECT private.is_admin()));

CREATE OR REPLACE FUNCTION public.admin_dashboard_metrics()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT (SELECT private.is_admin()) THEN
    RAISE EXCEPTION 'Acesso negado.' USING ERRCODE = '42501';
  END IF;

  SELECT jsonb_build_object(
    'total_clients', (SELECT count(*) FROM auth.users WHERE deleted_at IS NULL),
    'active_session_clients', (
      SELECT count(DISTINCT user_id)
      FROM auth.sessions
      WHERE not_after IS NULL OR not_after > now()
    ),
    'open_requests', (
      SELECT count(*) FROM public.privacy_requests WHERE status = 'OPEN'
    ),
    'processing_requests', (
      SELECT count(*) FROM public.privacy_requests WHERE status = 'PROCESSING'
    )
  ) INTO result;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_privacy_requests(p_status text DEFAULT NULL)
RETURNS TABLE (
  request_id uuid,
  customer_name text,
  request_type text,
  request_status text,
  request_message text,
  request_created_at timestamptz,
  assigned_to_current_admin boolean,
  response_message text,
  response_resolution text,
  delivery_status text,
  delivery_error_code text,
  response_sent_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT (SELECT private.is_admin()) THEN
    RAISE EXCEPTION 'Acesso negado.' USING ERRCODE = '42501';
  END IF;

  IF p_status IS NOT NULL AND p_status NOT IN ('OPEN', 'PROCESSING', 'COMPLETED', 'REJECTED') THEN
    RAISE EXCEPTION 'Status inválido.' USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  SELECT
    request.id,
    COALESCE(NULLIF(trim(profile.name), ''), 'Cliente'),
    request.type,
    request.status,
    request.message,
    request.created_at,
    request.assigned_admin_id = (SELECT auth.uid()),
    request.admin_response,
    request.resolution_status,
    request.response_delivery_status,
    request.response_delivery_error_code,
    request.responded_at
  FROM public.privacy_requests AS request
  LEFT JOIN public.profiles AS profile ON profile.user_id = request.user_id
  WHERE p_status IS NULL OR request.status = p_status
  ORDER BY request.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_start_privacy_request(p_request_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT (SELECT private.is_admin()) THEN
    RAISE EXCEPTION 'Acesso negado.' USING ERRCODE = '42501';
  END IF;

  UPDATE public.privacy_requests
  SET status = 'PROCESSING',
      assigned_admin_id = COALESCE(assigned_admin_id, (SELECT auth.uid()))
  WHERE id = p_request_id
    AND status IN ('OPEN', 'PROCESSING');

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_prepare_privacy_response(
  p_request_id uuid,
  p_resolution text,
  p_response text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  request_row public.privacy_requests%ROWTYPE;
  recipient_email text;
  normalized_response text := trim(p_response);
BEGIN
  IF NOT (SELECT private.is_admin()) THEN
    RAISE EXCEPTION 'Acesso negado.' USING ERRCODE = '42501';
  END IF;

  IF p_resolution NOT IN ('COMPLETED', 'REJECTED') THEN
    RAISE EXCEPTION 'Resolução inválida.' USING ERRCODE = '22023';
  END IF;

  IF char_length(normalized_response) NOT BETWEEN 8 AND 4000 THEN
    RAISE EXCEPTION 'A resposta deve ter entre 8 e 4000 caracteres.' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO request_row
  FROM public.privacy_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Solicitação não encontrada.' USING ERRCODE = 'P0002';
  END IF;

  IF request_row.response_delivery_status = 'SENT' THEN
    RETURN jsonb_build_object('already_sent', true);
  END IF;

  IF request_row.admin_response IS NOT NULL
     AND (request_row.admin_response <> normalized_response OR request_row.resolution_status <> p_resolution) THEN
    RAISE EXCEPTION 'Uma resposta já foi preparada. Reenvie a mesma resposta.' USING ERRCODE = '22023';
  END IF;

  SELECT email INTO recipient_email
  FROM auth.users
  WHERE id = request_row.user_id
    AND deleted_at IS NULL;

  IF recipient_email IS NULL THEN
    RAISE EXCEPTION 'A conta não possui e-mail disponível.' USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.privacy_requests
  SET status = 'PROCESSING',
      assigned_admin_id = COALESCE(assigned_admin_id, (SELECT auth.uid())),
      admin_response = normalized_response,
      resolution_status = p_resolution,
      response_delivery_status = 'PENDING',
      response_delivery_error_code = NULL
  WHERE id = p_request_id;

  RETURN jsonb_build_object(
    'already_sent', false,
    'recipient_email', recipient_email,
    'response', normalized_response,
    'resolution', p_resolution
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_finish_privacy_response(
  p_request_id uuid,
  p_sent boolean,
  p_error_code text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT (SELECT private.is_admin()) THEN
    RAISE EXCEPTION 'Acesso negado.' USING ERRCODE = '42501';
  END IF;

  IF p_sent THEN
    UPDATE public.privacy_requests
    SET status = resolution_status,
        completed_at = now(),
        responded_at = now(),
        response_delivery_status = 'SENT',
        response_delivery_error_code = NULL
    WHERE id = p_request_id
      AND response_delivery_status IN ('PENDING', 'FAILED')
      AND resolution_status IN ('COMPLETED', 'REJECTED');
  ELSE
    UPDATE public.privacy_requests
    SET status = 'PROCESSING',
        response_delivery_status = 'FAILED',
        response_delivery_error_code = left(COALESCE(NULLIF(trim(p_error_code), ''), 'EMAIL_SEND_FAILED'), 80)
    WHERE id = p_request_id
      AND response_delivery_status = 'PENDING';
  END IF;

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_dashboard_metrics() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_privacy_requests(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_start_privacy_request(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_prepare_privacy_response(uuid, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_finish_privacy_response(uuid, boolean, text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.admin_dashboard_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_privacy_requests(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_start_privacy_request(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_prepare_privacy_response(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_finish_privacy_response(uuid, boolean, text) TO authenticated;

DROP POLICY IF EXISTS folio_presence_track ON realtime.messages;
CREATE POLICY folio_presence_track ON realtime.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT realtime.topic()) = 'folio:presence'
    AND realtime.messages.extension = 'presence'
    AND (SELECT auth.uid()) IS NOT NULL
  );

DROP POLICY IF EXISTS folio_presence_admin_read ON realtime.messages;
CREATE POLICY folio_presence_admin_read ON realtime.messages
  FOR SELECT TO authenticated
  USING (
    (SELECT realtime.topic()) = 'folio:presence'
    AND realtime.messages.extension = 'presence'
    AND (SELECT private.is_admin())
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'privacy_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.privacy_requests;
  END IF;
END;
$$;

-- Bootstrap manual do primeiro administrador (execute com um UUID real):
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('00000000-0000-0000-0000-000000000000', 'admin')
-- ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
