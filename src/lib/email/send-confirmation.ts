import { createHash, randomBytes } from "crypto";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { buildSignupConfirmationEmail } from "@/lib/email/confirmation-email";

const DEFAULT_FROM = "Folio <onboarding@resend.dev>";

function appOrigin() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

function confirmSecret() {
  return process.env.EMAIL_CONFIRM_SECRET?.trim() ?? "";
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function newToken() {
  return randomBytes(32).toString("base64url");
}

async function sendWithResend(to: string, confirmUrl: string, idempotencyKey: string) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.error("RESEND_API_KEY ausente; e-mail de confirmação não enviado.");
    return false;
  }

  const resend = new Resend(apiKey);
  const { subject, text, html } = buildSignupConfirmationEmail(confirmUrl);
  const { error } = await resend.emails.send(
    {
      from: process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM,
      to: [to],
      subject,
      text,
      html,
    },
    { idempotencyKey },
  );

  if (error) {
    console.error("Falha ao enviar confirmação via Resend:", error.message);
    return false;
  }
  return true;
}

export async function sendSignupConfirmationForUser(userId: string, email: string) {
  const secret = confirmSecret();
  if (!secret) {
    console.error("EMAIL_CONFIRM_SECRET ausente; e-mail de confirmação não enviado.");
    return false;
  }

  const token = newToken();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("issue_email_confirmation", {
    p_user_id: userId,
    p_token_hash: hashToken(token),
    p_secret: secret,
  });

  if (error || data !== true) {
    console.error("Não foi possível emitir o token de confirmação.", error?.message);
    return false;
  }

  const confirmUrl = `${appOrigin()}/auth/confirm-email?token=${encodeURIComponent(token)}`;
  return sendWithResend(email, confirmUrl, `signup-confirm/${userId}/${hashToken(token).slice(0, 16)}`);
}

export async function resendSignupConfirmationForEmail(email: string) {
  const secret = confirmSecret();
  if (!secret) return false;

  const token = newToken();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("issue_email_confirmation_for_email", {
    p_email: email,
    p_token_hash: hashToken(token),
    p_secret: secret,
  });

  if (error || data !== true) return true;

  const confirmUrl = `${appOrigin()}/auth/confirm-email?token=${encodeURIComponent(token)}`;
  await sendWithResend(email, confirmUrl, `signup-confirm-resend/${hashToken(token).slice(0, 16)}`);
  return true;
}
