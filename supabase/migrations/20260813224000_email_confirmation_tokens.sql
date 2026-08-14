-- Tokens de confirmação de e-mail enviados pelo Resend (não pelo SMTP padrão).
-- A tabela fica no schema private para não ir à API.

CREATE TABLE IF NOT EXISTS private.app_secrets (
  name text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON private.app_secrets FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS private.email_confirm_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT email_confirm_tokens_hash_check CHECK (token_hash ~ '^[a-f0-9]{64}$')
);

CREATE INDEX IF NOT EXISTS idx_email_confirm_tokens_user_id
  ON private.email_confirm_tokens (user_id);

CREATE INDEX IF NOT EXISTS idx_email_confirm_tokens_expires_at
  ON private.email_confirm_tokens (expires_at);

REVOKE ALL ON private.email_confirm_tokens FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.assert_email_confirm_secret(p_secret text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private
AS $$
DECLARE
  expected text;
BEGIN
  IF p_secret IS NULL OR length(p_secret) < 32 THEN
    RETURN false;
  END IF;
  SELECT value INTO expected
  FROM private.app_secrets
  WHERE name = 'email_confirm_secret';
  RETURN expected IS NOT NULL AND expected = p_secret;
END;
$$;

REVOKE ALL ON FUNCTION private.assert_email_confirm_secret(text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.issue_email_confirmation(
  p_user_id uuid,
  p_token_hash text,
  p_secret text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, auth, extensions
AS $$
DECLARE
  confirmed_at timestamptz;
BEGIN
  IF NOT private.assert_email_confirm_secret(p_secret) THEN
    RETURN false;
  END IF;
  IF p_user_id IS NULL OR p_token_hash IS NULL OR p_token_hash !~ '^[a-f0-9]{64}$' THEN
    RETURN false;
  END IF;

  SELECT email_confirmed_at INTO confirmed_at
  FROM auth.users
  WHERE id = p_user_id;

  IF NOT FOUND OR confirmed_at IS NOT NULL THEN
    RETURN false;
  END IF;

  UPDATE private.email_confirm_tokens
  SET used_at = now()
  WHERE user_id = p_user_id
    AND used_at IS NULL;

  INSERT INTO private.email_confirm_tokens (user_id, token_hash, expires_at)
  VALUES (p_user_id, p_token_hash, now() + interval '24 hours');

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.issue_email_confirmation_for_email(
  p_email text,
  p_token_hash text,
  p_secret text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, auth, extensions
AS $$
DECLARE
  target_id uuid;
BEGIN
  IF NOT private.assert_email_confirm_secret(p_secret) THEN
    RETURN false;
  END IF;
  IF p_email IS NULL OR length(p_email) < 3 OR length(p_email) > 320 THEN
    RETURN false;
  END IF;

  SELECT id INTO target_id
  FROM auth.users
  WHERE lower(email) = lower(trim(p_email))
    AND email_confirmed_at IS NULL
  LIMIT 1;

  IF target_id IS NULL THEN
    RETURN false;
  END IF;

  RETURN public.issue_email_confirmation(target_id, p_token_hash, p_secret);
END;
$$;

CREATE OR REPLACE FUNCTION public.confirm_email_with_token(p_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, auth, extensions
AS $$
DECLARE
  rec private.email_confirm_tokens%ROWTYPE;
  hashed text;
BEGIN
  IF p_token IS NULL OR length(p_token) < 20 OR length(p_token) > 128 THEN
    RETURN false;
  END IF;

  hashed := encode(extensions.digest(convert_to(p_token, 'UTF8'), 'sha256'), 'hex');

  SELECT * INTO rec
  FROM private.email_confirm_tokens
  WHERE token_hash = hashed
    AND used_at IS NULL
    AND expires_at > now()
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  UPDATE auth.users
  SET
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
  WHERE id = rec.user_id;

  UPDATE private.email_confirm_tokens
  SET used_at = now()
  WHERE id = rec.id;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.issue_email_confirmation(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.issue_email_confirmation_for_email(text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.confirm_email_with_token(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.issue_email_confirmation(uuid, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.issue_email_confirmation_for_email(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_email_with_token(text) TO anon, authenticated;
