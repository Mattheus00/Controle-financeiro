"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/auth";
import { fail } from "@/lib/errors";
import { enforceRateLimit } from "@/lib/privacy/rate-limit";
import { privacyService } from "@/services/privacy-service";
import { writeAuditEvent } from "@/lib/privacy/audit";
import {
  deleteAccountSchema,
  deleteHistorySchema,
  deleteReceiptsSchema,
  exportRequestSchema,
  marketingConsentSchema,
  privacyRequestSchema,
} from "@/validations/privacy";

async function reauth(password: string) {
  const { supabase, userId } = await requireUser();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email;
  if (!email) return { error: fail("AUTH_FAILED", "Não foi possível confirmar sua identidade."), supabase, userId };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: fail("AUTH_FAILED", "Senha incorreta."), supabase, userId };
  return { error: null, supabase, userId, email };
}

export async function requestDataExportAction(formData: FormData) {
  const parsed = exportRequestSchema.safeParse({ password: formData.get("password") });
  if (!parsed.success) return fail("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Dados inválidos.");

  const auth = await reauth(parsed.data.password);
  if (auth.error) return auth.error;

  const limited = await enforceRateLimit(auth.supabase, "export", auth.userId);
  if (limited) return limited;

  return privacyService.exportOwnData(auth.supabase, auth.userId, auth.email ?? null);
}

export async function deleteReceiptsAction(formData: FormData) {
  const parsed = deleteReceiptsSchema.safeParse({ password: formData.get("password") });
  if (!parsed.success) return fail("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Dados inválidos.");
  const auth = await reauth(parsed.data.password);
  if (auth.error) return auth.error;
  const result = await privacyService.deleteReceipts(auth.supabase, auth.userId);
  if (result.success) revalidatePath("/settings");
  return result;
}

export async function deleteHistoryAction(formData: FormData) {
  const parsed = deleteHistorySchema.safeParse({
    password: formData.get("password"),
    confirmation: formData.get("confirmation"),
  });
  if (!parsed.success) return fail("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Dados inválidos.");
  const auth = await reauth(parsed.data.password);
  if (auth.error) return auth.error;
  const result = await privacyService.deleteHistory(auth.supabase, auth.userId);
  if (result.success) {
    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/transactions");
  }
  return result;
}

export async function deleteAccountAction(formData: FormData) {
  const parsed = deleteAccountSchema.safeParse({
    password: formData.get("password"),
    confirmation: formData.get("confirmation"),
  });
  if (!parsed.success) return fail("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Dados inválidos.");
  const auth = await reauth(parsed.data.password);
  if (auth.error) return auth.error;
  const limited = await enforceRateLimit(auth.supabase, "deleteAccount", auth.userId);
  if (limited) return limited;
  const result = await privacyService.deleteAccount(auth.supabase, auth.userId);
  if (!result.success) return result;
  redirect("/login");
}

export async function createPrivacyRequestAction(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const limited = await enforceRateLimit(supabase, "privacyRequest", userId);
  if (limited) return limited;
  const parsed = privacyRequestSchema.safeParse({
    type: formData.get("type"),
    message: formData.get("message"),
  });
  if (!parsed.success) return fail("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Revise a solicitação.");
  const result = await privacyService.createPrivacyRequest(supabase, userId, parsed.data);
  if (result.success) revalidatePath("/settings");
  return result;
}

export async function updateMarketingConsentAction(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const parsed = marketingConsentSchema.safeParse({
    granted: formData.get("granted") === "true",
  });
  if (!parsed.success) return fail("VALIDATION_ERROR", "Preferência inválida.");
  const result = await privacyService.setMarketingConsent(supabase, userId, parsed.data.granted);
  if (result.success) revalidatePath("/settings");
  return result;
}

export async function recordPasswordChangeAction() {
  const { supabase } = await requireUser();
  await writeAuditEvent(supabase, "PASSWORD_CHANGED", {});
}
