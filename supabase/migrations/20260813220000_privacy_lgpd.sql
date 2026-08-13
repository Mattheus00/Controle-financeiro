-- Folio: controles de privacidade (LGPD). Não apaga dados existentes.
-- Tabelas novas, RLS, funções SECURITY DEFINER, bucket de exportação.

CREATE TABLE IF NOT EXISTS public.user_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  consent_type text NOT NULL,
  policy_version text NOT NULL,
  granted boolean NOT NULL,
  granted_at timestamptz,
  revoked_at timestamptz,
  source text NOT NULL DEFAULT 'app',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_consents_type_check CHECK (
    consent_type IN ('privacy_policy', 'terms_of_use', 'marketing_email')
  ),
  CONSTRAINT user_consents_source_check CHECK (source IN ('signup', 'app', 'privacy_center'))
);

CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON public.user_consents (user_id);

CREATE TABLE IF NOT EXISTS public.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  event_type text NOT NULL,
  metadata_minimal jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT audit_events_type_check CHECK (
    event_type IN (
      'ACCOUNT_EXPORT_REQUESTED',
      'ACCOUNT_DELETION_REQUESTED',
      'ACCOUNT_DELETED',
      'EMAIL_CHANGED',
      'PASSWORD_CHANGED',
      'PRIVACY_SETTING_CHANGED',
      'PRIVACY_REQUEST_CREATED',
      'RECEIPTS_DELETED',
      'HISTORY_DELETED'
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_audit_events_user_id ON public.audit_events (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON public.audit_events (created_at DESC);

CREATE TABLE IF NOT EXISTS public.privacy_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'OPEN',
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  notes_internal text,
  message text,
  CONSTRAINT privacy_requests_type_check CHECK (
    type IN ('ACCESS', 'CORRECTION', 'EXPORT', 'DELETION', 'INFORMATION', 'REVOCATION')
  ),
  CONSTRAINT privacy_requests_status_check CHECK (
    status IN ('OPEN', 'PROCESSING', 'COMPLETED', 'REJECTED')
  )
);

CREATE INDEX IF NOT EXISTS idx_privacy_requests_user_id ON public.privacy_requests (user_id);

CREATE TABLE IF NOT EXISTS public.data_export_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'PROCESSING',
  storage_path text,
  error_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  expires_at timestamptz,
  CONSTRAINT data_export_jobs_status_check CHECK (
    status IN ('PROCESSING', 'READY', 'FAILED', 'EXPIRED')
  )
);

CREATE INDEX IF NOT EXISTS idx_data_export_jobs_user_id ON public.data_export_jobs (user_id);

CREATE TABLE IF NOT EXISTS public.security_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  detected_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  severity text NOT NULL DEFAULT 'medium',
  affected_systems text[] NOT NULL DEFAULT '{}',
  estimated_users integer,
  status text NOT NULL DEFAULT 'open',
  internal_summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT security_incidents_severity_check CHECK (
    severity IN ('low', 'medium', 'high', 'critical')
  ),
  CONSTRAINT security_incidents_status_check CHECK (
    status IN ('open', 'investigating', 'contained', 'resolved')
  )
);

CREATE TABLE IF NOT EXISTS private.rate_limits (
  key text PRIMARY KEY,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  count integer NOT NULL DEFAULT 0
);

ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_consents_select_own ON public.user_consents;
DROP POLICY IF EXISTS user_consents_insert_own ON public.user_consents;
DROP POLICY IF EXISTS user_consents_update_own ON public.user_consents;
CREATE POLICY user_consents_select_own ON public.user_consents FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY user_consents_insert_own ON public.user_consents FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY user_consents_update_own ON public.user_consents FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS audit_events_select_own ON public.audit_events;
CREATE POLICY audit_events_select_own ON public.audit_events FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS privacy_requests_select_own ON public.privacy_requests;
DROP POLICY IF EXISTS privacy_requests_insert_own ON public.privacy_requests;
CREATE POLICY privacy_requests_select_own ON public.privacy_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY privacy_requests_insert_own ON public.privacy_requests FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND notes_internal IS NULL
    AND status = 'OPEN'
  );

REVOKE ALL ON public.privacy_requests FROM anon, authenticated;
GRANT SELECT (id, user_id, type, status, created_at, completed_at, message)
  ON public.privacy_requests TO authenticated;
GRANT INSERT (id, user_id, type, status, message)
  ON public.privacy_requests TO authenticated;

DROP POLICY IF EXISTS data_export_jobs_select_own ON public.data_export_jobs;
DROP POLICY IF EXISTS data_export_jobs_insert_own ON public.data_export_jobs;
DROP POLICY IF EXISTS data_export_jobs_update_own ON public.data_export_jobs;
CREATE POLICY data_export_jobs_select_own ON public.data_export_jobs FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY data_export_jobs_insert_own ON public.data_export_jobs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY data_export_jobs_update_own ON public.data_export_jobs FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

REVOKE ALL ON public.security_incidents FROM PUBLIC;
REVOKE ALL ON public.security_incidents FROM anon, authenticated;
GRANT ALL ON public.security_incidents TO postgres, service_role;

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key text,
  p_max integer,
  p_window_seconds integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  started timestamptz;
  current_count integer;
BEGIN
  IF p_key IS NULL OR length(p_key) < 8 OR length(p_key) > 128 OR p_key !~ '^[a-z0-9:_-]+$' THEN
    RETURN false;
  END IF;
  IF p_max < 1 OR p_window_seconds < 1 THEN
    RETURN false;
  END IF;

  INSERT INTO private.rate_limits (key, window_started_at, count)
  VALUES (p_key, now(), 1)
  ON CONFLICT (key) DO UPDATE
    SET
      window_started_at = CASE
        WHEN private.rate_limits.window_started_at < now() - make_interval(secs => p_window_seconds)
          THEN now()
        ELSE private.rate_limits.window_started_at
      END,
      count = CASE
        WHEN private.rate_limits.window_started_at < now() - make_interval(secs => p_window_seconds)
          THEN 1
        ELSE private.rate_limits.count + 1
      END
  RETURNING window_started_at, count INTO started, current_count;

  RETURN current_count <= p_max;
END;
$$;

REVOKE ALL ON FUNCTION public.check_rate_limit(text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, integer, integer) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.write_audit_event(
  p_event_type text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  cleaned jsonb;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  cleaned := COALESCE(p_metadata, '{}'::jsonb)
    - 'password' - 'token' - 'jwt' - 'authorization' - 'api_key'
    - 'secret' - 'cookie' - 'cvv' - 'card_number' - 'extracted';

  INSERT INTO public.audit_events (user_id, event_type, metadata_minimal)
  VALUES (uid, p_event_type, cleaned);
END;
$$;

REVOKE ALL ON FUNCTION public.write_audit_event(text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.write_audit_event(text, jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  DELETE FROM storage.objects
  WHERE bucket_id IN ('receipts', 'privacy-exports')
    AND split_part(name, '/', 1) = uid::text;

  DELETE FROM auth.users WHERE id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;

CREATE OR REPLACE FUNCTION public.purge_expired_exports()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  removed integer := 0;
BEGIN
  DELETE FROM storage.objects obj
  USING public.data_export_jobs jobs
  WHERE obj.bucket_id = 'privacy-exports'
    AND obj.name = jobs.storage_path
    AND jobs.expires_at IS NOT NULL
    AND jobs.expires_at < now();

  GET DIAGNOSTICS removed = ROW_COUNT;

  UPDATE public.data_export_jobs
  SET status = 'EXPIRED'
  WHERE expires_at < now()
    AND status = 'READY';

  RETURN removed;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_expired_exports() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purge_expired_exports() TO authenticated, service_role;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'privacy-exports',
  'privacy-exports',
  false,
  52428800,
  ARRAY['application/zip']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS privacy_exports_select_own ON storage.objects;
DROP POLICY IF EXISTS privacy_exports_insert_own ON storage.objects;
DROP POLICY IF EXISTS privacy_exports_update_own ON storage.objects;
DROP POLICY IF EXISTS privacy_exports_delete_own ON storage.objects;

CREATE POLICY privacy_exports_select_own ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'privacy-exports' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY privacy_exports_insert_own ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'privacy-exports' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY privacy_exports_update_own ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'privacy-exports' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'privacy-exports' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY privacy_exports_delete_own ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'privacy-exports' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE OR REPLACE FUNCTION private.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  display_name text;
  privacy_version text;
  terms_version text;
BEGIN
  display_name := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'name', ''),
    split_part(NEW.email, '@', 1),
    'Você'
  );

  INSERT INTO public.profiles (user_id, name, currency, timezone)
  VALUES (NEW.id, display_name, 'BRL', 'America/Sao_Paulo');

  INSERT INTO public.user_preferences (user_id, theme, locale)
  VALUES (NEW.id, 'light', 'pt-BR');

  INSERT INTO public.accounts (user_id, name, type, icon, color)
  VALUES (NEW.id, 'Carteira', 'wallet', 'Wallet', '#A3E635');

  INSERT INTO public.categories (user_id, name, slug, icon, color, type, is_default)
  VALUES
    (NEW.id, 'Alimentação', 'alimentacao', 'Utensils', '#84CC16', 'expense', true),
    (NEW.id, 'Mercado', 'mercado', 'ShoppingCart', '#65A30D', 'expense', true),
    (NEW.id, 'Moradia', 'moradia', 'House', '#15803D', 'expense', true),
    (NEW.id, 'Transporte', 'transporte', 'Car', '#0EA5E9', 'expense', true),
    (NEW.id, 'Combustível', 'combustivel', 'Fuel', '#F97316', 'expense', true),
    (NEW.id, 'Saúde', 'saude', 'HeartPulse', '#EF4444', 'expense', true),
    (NEW.id, 'Academia', 'academia', 'Dumbbell', '#A855F7', 'expense', true),
    (NEW.id, 'Lazer', 'lazer', 'Gamepad2', '#EC4899', 'expense', true),
    (NEW.id, 'Assinaturas', 'assinaturas', 'RefreshCw', '#6366F1', 'expense', true),
    (NEW.id, 'Educação', 'educacao', 'GraduationCap', '#2563EB', 'expense', true),
    (NEW.id, 'Compras', 'compras', 'ShoppingBag', '#F59E0B', 'expense', true),
    (NEW.id, 'Viagens', 'viagens', 'Plane', '#14B8A6', 'expense', true),
    (NEW.id, 'Investimentos', 'investimentos', 'TrendingUp', '#22C55E', 'both', true),
    (NEW.id, 'Impostos', 'impostos', 'Landmark', '#78716C', 'expense', true),
    (NEW.id, 'Presentes', 'presentes', 'Gift', '#F43F5E', 'expense', true),
    (NEW.id, 'Pets', 'pets', 'PawPrint', '#D97706', 'expense', true),
    (NEW.id, 'Trabalho', 'trabalho', 'Briefcase', '#475569', 'both', true),
    (NEW.id, 'Salário', 'salario', 'Banknote', '#16A34A', 'income', true),
    (NEW.id, 'Outros', 'outros', 'CircleDot', '#94A3B8', 'both', true);

  privacy_version := NULLIF(NEW.raw_user_meta_data->>'accepted_privacy_version', '');
  terms_version := NULLIF(NEW.raw_user_meta_data->>'accepted_terms_version', '');

  IF privacy_version IS NOT NULL THEN
    INSERT INTO public.user_consents (user_id, consent_type, policy_version, granted, granted_at, source)
    VALUES (NEW.id, 'privacy_policy', privacy_version, true, now(), 'signup');
  END IF;

  IF terms_version IS NOT NULL THEN
    INSERT INTO public.user_consents (user_id, consent_type, policy_version, granted, granted_at, source)
    VALUES (NEW.id, 'terms_of_use', terms_version, true, now(), 'signup');
  END IF;

  RETURN NEW;
END;
$$;
