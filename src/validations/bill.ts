import { z } from "zod";

export const billSchema = z.object({
  name: z.string().min(2).max(80),
  amount_cents: z.number().int().positive(),
  due_date: z.string().min(10),
  category_id: z.string().uuid().nullable().optional(),
  account_id: z.string().uuid().nullable().optional(),
  credit_card_id: z.string().uuid().nullable().optional(),
  icon: z.string().max(40).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export const recurringSchema = z.object({
  type: z.enum(["income", "expense"]),
  description: z.string().min(2).max(80),
  amount_cents: z.number().int().positive(),
  frequency: z.enum(["weekly", "monthly", "quarterly", "semiannual", "yearly", "custom"]),
  interval_count: z.number().int().min(1).max(24).default(1),
  start_date: z.string().min(10),
  day_of_month: z.number().int().min(1).max(28).nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  account_id: z.string().uuid().nullable().optional(),
  merchant: z.string().max(80).nullable().optional(),
  icon: z.string().max(40).nullable().optional(),
  generate_as: z.enum(["bill", "transaction"]).default("bill"),
});

export type BillInput = z.infer<typeof billSchema>;
export type RecurringInput = z.infer<typeof recurringSchema>;
