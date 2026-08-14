import { z } from "zod";
import { DELETE_ACCOUNT_CONFIRMATION } from "@/lib/privacy/config";

export const privacyRequestSchema = z.object({
  type: z.enum(["ACCESS", "CORRECTION", "EXPORT", "DELETION", "INFORMATION", "REVOCATION"]),
  message: z.string().trim().min(8).max(2000),
});

export const exportRequestSchema = z.object({
  password: z.string().min(8, "Confirme sua senha para exportar os dados."),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(8, "Confirme sua senha para excluir a conta."),
  confirmation: z.literal(DELETE_ACCOUNT_CONFIRMATION, {
    errorMap: () => ({ message: `Digite ${DELETE_ACCOUNT_CONFIRMATION} para confirmar.` }),
  }),
});

export const deleteHistorySchema = z.object({
  password: z.string().min(8, "Confirme sua senha."),
  confirmation: z.literal("EXCLUIR HISTORICO", {
    errorMap: () => ({ message: "Digite EXCLUIR HISTORICO para confirmar." }),
  }),
});

export const deleteReceiptsSchema = z.object({
  password: z.string().min(8, "Confirme sua senha."),
});

export const receiptUploadSchema = z.object({
  mime: z.enum(["image/jpeg", "image/png", "image/webp", "application/pdf"]),
  size: z.number().int().positive().max(10 * 1024 * 1024),
});

export const receiptConfirmSchema = z
  .object({
    scanId: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    description: z.string().min(2).max(120),
    merchant: z.string().max(120).nullable().optional(),
    category_id: z.string().uuid().nullable().optional(),
    payment_method: z.enum(["pix", "cash", "debit", "credit", "boleto", "transfer", "other"]).optional(),
    account_id: z.string().uuid().nullable().optional(),
    credit_card_id: z.string().uuid().nullable().optional(),
    installment_total: z.coerce.number().int().min(1).max(48).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.payment_method === "credit" && !value.credit_card_id) {
      ctx.addIssue({
        code: "custom",
        path: ["credit_card_id"],
        message: "Escolha o cartão desta compra.",
      });
    }
  });

export const resourceIdSchema = z.string().uuid("Registro inválido.");

export const marketingConsentSchema = z.object({
  granted: z.boolean(),
});

export const signupLegalSchema = z.object({
  accepted_privacy: z.literal(true, {
    errorMap: () => ({ message: "Leia e aceite a Política de Privacidade." }),
  }),
  accepted_terms: z.literal(true, {
    errorMap: () => ({ message: "Leia e aceite os Termos de Uso." }),
  }),
});
