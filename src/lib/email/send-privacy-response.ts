import { Resend } from "resend";
import type { AdminResolution } from "@/validations/admin";
import { buildPrivacyResponseEmail } from "@/lib/email/privacy-response-email";

const DEFAULT_FROM = "Folio <onboarding@resend.dev>";

export async function sendPrivacyResponse({
  to,
  requestId,
  response,
  resolution,
}: {
  to: string;
  requestId: string;
  response: string;
  resolution: AdminResolution;
}): Promise<{ sent: true } | { sent: false; errorCode: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return { sent: false, errorCode: "RESEND_NOT_CONFIGURED" };

  const email = buildPrivacyResponseEmail({ response, resolution });
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send(
    {
      from: process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM,
      to: [to],
      ...email,
    },
    { idempotencyKey: `privacy-response/${requestId}` },
  );

  if (error) {
    console.error("Falha ao enviar resposta de privacidade:", error.message);
    return { sent: false, errorCode: "RESEND_SEND_FAILED" };
  }

  return { sent: true };
}
