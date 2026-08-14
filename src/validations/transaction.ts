import { z } from "zod";

export const paymentMethodSchema = z.enum([
  "pix",
  "cash",
  "debit",
  "credit",
  "boleto",
  "transfer",
  "other",
]);

export const transactionTypeSchema = z.enum(["income", "expense", "transfer"]);

export const transactionSchema = z
  .object({
    type: transactionTypeSchema,
    description: z.string().min(2, "Descreva o lançamento.").max(120),
    amount_cents: z.number().int().positive("Informe um valor maior que zero."),
    date: z.string().min(10),
    category_id: z.string().uuid().nullable().optional(),
    account_id: z.string().uuid().nullable().optional(),
    credit_card_id: z.string().uuid().nullable().optional(),
    destination_account_id: z.string().uuid().nullable().optional(),
    payment_method: paymentMethodSchema.nullable().optional(),
    merchant: z.string().max(120).nullable().optional(),
    notes: z.string().max(500).nullable().optional(),
    tags: z.array(z.string().max(24)).optional(),
    icon: z.string().max(40).nullable().optional(),
    installment_total: z.number().int().min(1).max(48).optional(),
    is_recurring: z.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type === "transfer" && !value.destination_account_id) {
      ctx.addIssue({
        code: "custom",
        path: ["destination_account_id"],
        message: "Escolha a conta de destino.",
      });
    }
    if (value.payment_method === "credit" && !value.credit_card_id) {
      ctx.addIssue({
        code: "custom",
        path: ["credit_card_id"],
        message: "Escolha o cartão desta compra.",
      });
    }
  });

export const transactionFilterSchema = z.object({
  q: z.string().optional(),
  type: transactionTypeSchema.optional(),
  category_id: z.string().uuid().optional(),
  account_id: z.string().uuid().optional(),
  credit_card_id: z.string().uuid().optional(),
  payment_method: paymentMethodSchema.optional(),
  merchant: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  min_cents: z.coerce.number().optional(),
  max_cents: z.coerce.number().optional(),
});

export const quickExpenseSchema = z
  .object({
    amount_cents: z.number().int().positive(),
    merchant: z.string().max(120).optional(),
    category_id: z.string().uuid().nullable().optional(),
    payment_method: paymentMethodSchema.optional(),
    date: z.string().min(10),
    description: z.string().max(120).optional(),
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

export type TransactionInput = z.infer<typeof transactionSchema>;
export type TransactionFilter = z.infer<typeof transactionFilterSchema>;
export type QuickExpenseInput = z.infer<typeof quickExpenseSchema>;
