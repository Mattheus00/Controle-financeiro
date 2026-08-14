-- Índices de apoio para as chaves estrangeiras administrativas.

CREATE INDEX IF NOT EXISTS idx_privacy_requests_assigned_admin_id
  ON public.privacy_requests (assigned_admin_id)
  WHERE assigned_admin_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_roles_created_by
  ON public.user_roles (created_by)
  WHERE created_by IS NOT NULL;
