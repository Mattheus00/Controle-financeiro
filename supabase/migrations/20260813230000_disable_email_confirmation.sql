-- Confirmação de e-mail desligada temporariamente: contas novas já entram confirmadas.

CREATE OR REPLACE FUNCTION private.auto_confirm_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth
AS $$
BEGIN
  IF NEW.email IS NOT NULL AND NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_confirm_email ON auth.users;
CREATE TRIGGER trg_auto_confirm_email
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION private.auto_confirm_email();

REVOKE ALL ON FUNCTION private.auto_confirm_email() FROM PUBLIC, anon, authenticated;

UPDATE auth.users
SET
  email_confirmed_at = now(),
  updated_at = now()
WHERE email_confirmed_at IS NULL
  AND email IS NOT NULL;
