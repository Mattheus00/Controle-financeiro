"use server";

import { revalidatePath } from "next/cache";
import { getAdminContext } from "@/lib/supabase/auth";
import { fail, ok, toUserError } from "@/lib/errors";
import { adminService } from "@/services/admin-service";
import { sendPrivacyResponse } from "@/lib/email/send-privacy-response";
import { adminRequestIdSchema, adminResponseSchema } from "@/validations/admin";

export async function startPrivacyRequestAction(formData: FormData) {
  const context = await getAdminContext();
  if (!context.isAdmin) return fail("FORBIDDEN", "Acesso negado.");

  const parsed = adminRequestIdSchema.safeParse({ requestId: formData.get("requestId") });
  if (!parsed.success) return fail("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Solicitação inválida.");

  try {
    const updated = await adminService.startRequest(context.supabase, parsed.data.requestId);
    if (!updated) return fail("NOT_FOUND", "Solicitação não encontrada ou já encerrada.");
    revalidatePath("/admin");
    return ok({ updated: true });
  } catch (error) {
    return toUserError(error, fail("ADMIN_UPDATE_FAILED", "Não foi possível iniciar o atendimento."));
  }
}

export async function respondPrivacyRequestAction(formData: FormData) {
  const context = await getAdminContext();
  if (!context.isAdmin) return fail("FORBIDDEN", "Acesso negado.");

  const parsed = adminResponseSchema.safeParse({
    requestId: formData.get("requestId"),
    resolution: formData.get("resolution"),
    response: formData.get("response"),
  });
  if (!parsed.success) return fail("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Revise a resposta.");

  try {
    const prepared = await adminService.prepareResponse(context.supabase, parsed.data);
    if (prepared.already_sent) return ok({ sent: true });

    const delivery = await sendPrivacyResponse({
      to: prepared.recipient_email,
      requestId: parsed.data.requestId,
      response: prepared.response,
      resolution: prepared.resolution,
    });

    if (!delivery.sent) {
      await adminService.finishResponse(context.supabase, parsed.data.requestId, false, delivery.errorCode);
      revalidatePath("/admin");
      return fail("EMAIL_SEND_FAILED", "A resposta foi salva, mas o e-mail não foi enviado. Tente novamente.");
    }

    const finished = await adminService.finishResponse(context.supabase, parsed.data.requestId, true);
    if (!finished) return fail("ADMIN_UPDATE_FAILED", "E-mail enviado, mas não foi possível concluir a solicitação.");

    revalidatePath("/admin");
    return ok({ sent: true });
  } catch (error) {
    return toUserError(error, fail("ADMIN_RESPONSE_FAILED", "Não foi possível enviar a resposta."));
  }
}
