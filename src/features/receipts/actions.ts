"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/auth";
import { fail } from "@/lib/errors";
import { receiptService } from "@/services/receipt-service";
import { parseBRLToCents } from "@/lib/money";
import { MAX_UPLOAD_BYTES } from "@/lib/config";
import { receiptConfirmSchema } from "@/validations/privacy";

export async function processReceiptAction(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
    return fail("UPLOAD_INVALID", "Arquivo inválido. Use JPEG, PNG, WEBP ou PDF de até 10 MB.");
  }
  return receiptService.processUpload(supabase, userId, file);
}

export async function confirmReceiptAction(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const cents = parseBRLToCents(String(formData.get("amount") ?? ""));
  if (!cents) return fail("VALIDATION_ERROR", "Informe o valor do gasto.");

  const parsed = receiptConfirmSchema.safeParse({
    scanId: formData.get("scanId"),
    date: formData.get("date"),
    description: String(formData.get("description") || formData.get("merchant") || "Gasto"),
    merchant: String(formData.get("merchant") || "") || null,
    category_id: String(formData.get("category_id") || "") || null,
    payment_method: formData.get("payment_method") || "pix",
    account_id: String(formData.get("account_id") || "") || null,
    credit_card_id: String(formData.get("credit_card_id") || "") || null,
    installment_total: Number(formData.get("installment_total") || 1),
  });
  if (!parsed.success) return fail("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Revise os dados.");

  const result = await receiptService.confirm(supabase, userId, {
    scanId: parsed.data.scanId,
    amount_cents: cents,
    date: parsed.data.date,
    description: parsed.data.description,
    merchant: parsed.data.merchant,
    category_id: parsed.data.category_id,
    payment_method: parsed.data.payment_method,
    account_id: parsed.data.account_id,
    credit_card_id: parsed.data.credit_card_id,
    installment_total: parsed.data.installment_total,
  });

  if (result.success) {
    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/cards");
  }
  return result;
}
