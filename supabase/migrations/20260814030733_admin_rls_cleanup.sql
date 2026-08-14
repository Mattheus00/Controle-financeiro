-- Consolida a leitura do cliente/admin em uma única policy e evita reavaliar auth.uid() por linha.

DROP POLICY IF EXISTS privacy_requests_select_own ON public.privacy_requests;
DROP POLICY IF EXISTS privacy_requests_admin_select ON public.privacy_requests;

CREATE POLICY privacy_requests_select_authorized ON public.privacy_requests
  FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR (SELECT private.is_admin())
  );

DROP POLICY IF EXISTS privacy_requests_insert_own ON public.privacy_requests;
CREATE POLICY privacy_requests_insert_own ON public.privacy_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND notes_internal IS NULL
    AND status = 'OPEN'
  );
