import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(2).max(60),
  type: z.enum(["checking", "savings", "cash", "wallet", "investment", "other"]),
  initial_balance_cents: z.number().int().default(0),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const creditCardSchema = z.object({
  name: z.string().min(2).max(60),
  brand: z.string().max(30).optional(),
  last_four: z.string().regex(/^\d{4}$/, "Informe os 4 últimos dígitos.").optional(),
  limit_cents: z.number().int().positive().optional(),
  closing_day: z.number().int().min(1).max(28),
  due_day: z.number().int().min(1).max(28),
  color: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(40),
  icon: z.string().min(2).max(40),
  color: z.string().min(4).max(20),
  type: z.enum(["expense", "income", "both"]),
});

export const budgetSchema = z.object({
  category_id: z.string().uuid(),
  amount_cents: z.number().int().positive(),
  month: z.string().min(10),
});

export const goalSchema = z.object({
  name: z.string().min(2).max(80),
  target_cents: z.number().int().positive(),
  deadline: z.string().optional(),
  icon: z.string().optional(),
});

export const goalContributionSchema = z.object({
  goal_id: z.string().uuid(),
  amount_cents: z.number().int().positive(),
  notes: z.string().max(200).optional(),
});

export const subscriptionSchema = z.object({
  name: z.string().min(2).max(80),
  amount_cents: z.number().int().positive(),
  billing_day: z.number().int().min(1).max(28),
  category_id: z.string().uuid().nullable().optional(),
  credit_card_id: z.string().uuid().nullable().optional(),
  icon: z.string().optional(),
  merchant: z.string().optional(),
});

export const profileSchema = z.object({
  name: z.string().min(2).max(80),
  timezone: z.string().min(3),
  currency: z.string().min(3).max(3),
});
