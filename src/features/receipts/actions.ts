"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/auth";
import { fail } from "@/lib/errors";
import { receiptService } from "@/services/receipt-service";
import { parseBRLToCents } from "@/lib/money";

export async function processReceiptAction(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return fail("UPLOAD_INVALID", "Escolha uma foto, imagem ou PDF.");
  }
  return receiptService.processUpload(supabase, userId, file);
}

export async function confirmReceiptAction(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const cents = parseBRLToCents(String(formData.get("amount") ?? ""));
  if (!cents) return fail("VALIDATION_ERROR", "Informe o valor do gasto.");

  const result = await receiptService.confirm(supabase, userId, {
    scanId: String(formData.get("scanId")),
    amount_cents: cents,
    date: String(formData.get("date")),
    description: String(formData.get("description") || formData.get("merchant") || "Gasto"),
    merchant: String(formData.get("merchant") || ""),
    category_id: String(formData.get("category_id") || "") || null,
    payment_method: String(formData.get("payment_method") || "pix"),
    account_id: String(formData.get("account_id") || "") || null,
    credit_card_id: String(formData.get("credit_card_id") || "") || null,
  });

  if (result.success) {
    revalidatePath("/dashboard");
    revalidatePath("/transactions");
  }
  return result;
}
