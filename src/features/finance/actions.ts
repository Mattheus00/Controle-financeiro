"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/auth";
import { fail } from "@/lib/errors";
import { parseBRLToCents } from "@/lib/money";
import { monthStartISO } from "@/lib/date";
import { transactionSchema, quickExpenseSchema } from "@/validations/transaction";
import { resourceIdSchema } from "@/validations/privacy";
import { billSchema, recurringSchema } from "@/validations/bill";
import {
  accountSchema,
  budgetSchema,
  categorySchema,
  creditCardSchema,
  goalContributionSchema,
  goalSchema,
  profileSchema,
  subscriptionSchema,
} from "@/validations/misc";
import { transactionService } from "@/services/transaction-service";
import { billService } from "@/services/bill-service";
import { recurringService } from "@/services/recurring-service";
import {
  accountService,
  budgetService,
  cardService,
  categoryService,
  goalService,
  profileService,
  subscriptionService,
} from "@/services/catalog-service";

function revalidateFinance() {
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/bills");
  revalidatePath("/cards");
  revalidatePath("/subscriptions");
  revalidatePath("/budgets");
  revalidatePath("/goals");
  revalidatePath("/reports");
  revalidatePath("/calendar");
}

function centsFromForm(formData: FormData, key = "amount") {
  const raw = String(formData.get(key) ?? "");
  return parseBRLToCents(raw);
}

export async function createTransactionAction(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const cents = centsFromForm(formData);
  if (!cents) return fail("VALIDATION_ERROR", "Informe um valor válido.");
  const parsed = transactionSchema.safeParse({
    type: formData.get("type") || "expense",
    description: formData.get("description"),
    amount_cents: cents,
    date: formData.get("date"),
    category_id: emptyToNull(formData.get("category_id")),
    account_id: emptyToNull(formData.get("account_id")),
    credit_card_id: emptyToNull(formData.get("credit_card_id")),
    destination_account_id: emptyToNull(formData.get("destination_account_id")),
    payment_method: emptyToNull(formData.get("payment_method")) ?? "pix",
    merchant: emptyToNull(formData.get("merchant")),
    notes: emptyToNull(formData.get("notes")),
    icon: emptyToNull(formData.get("icon")),
    installment_total: Number(formData.get("installment_total") || 1),
  });
  if (!parsed.success) return fail("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Revise os dados.");
  const result = await transactionService.create(supabase, userId, parsed.data);
  if (result.success) revalidateFinance();
  return result;
}

export async function createQuickExpenseAction(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const cents = centsFromForm(formData);
  if (!cents) return fail("VALIDATION_ERROR", "Informe um valor válido.");
  const parsed = quickExpenseSchema.safeParse({
    amount_cents: cents,
    merchant: String(formData.get("merchant") ?? ""),
    category_id: emptyToNull(formData.get("category_id")),
    payment_method: formData.get("payment_method") || "pix",
    date: formData.get("date"),
    description: String(formData.get("description") ?? formData.get("merchant") ?? "Gasto"),
    account_id: emptyToNull(formData.get("account_id")),
    credit_card_id: emptyToNull(formData.get("credit_card_id")),
  });
  if (!parsed.success) return fail("VALIDATION_ERROR", "Revise os dados do gasto.");
  const result = await transactionService.create(supabase, userId, {
    type: "expense",
    description: parsed.data.description || parsed.data.merchant || "Gasto",
    amount_cents: parsed.data.amount_cents,
    date: parsed.data.date,
    merchant: parsed.data.merchant,
    category_id: parsed.data.category_id,
    payment_method: parsed.data.payment_method,
    account_id: parsed.data.account_id,
    credit_card_id: parsed.data.credit_card_id,
  });
  if (result.success) revalidateFinance();
  return result;
}

export async function deleteTransactionAction(id: string) {
  const parsed = resourceIdSchema.safeParse(id);
  if (!parsed.success) return fail("VALIDATION_ERROR", "Transação inválida.");
  const { supabase, userId } = await requireUser();
  const result = await transactionService.remove(supabase, userId, parsed.data);
  if (result.success) revalidateFinance();
  return result;
}

export async function createBillAction(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const cents = centsFromForm(formData);
  if (!cents) return fail("VALIDATION_ERROR", "Informe um valor válido.");
  const parsed = billSchema.safeParse({
    name: formData.get("name"),
    amount_cents: cents,
    due_date: formData.get("due_date"),
    category_id: emptyToNull(formData.get("category_id")),
    icon: emptyToNull(formData.get("icon")),
  });
  if (!parsed.success) return fail("VALIDATION_ERROR", "Revise os dados da conta.");
  const result = await billService.create(supabase, userId, parsed.data);
  if (result.success) revalidateFinance();
  return result;
}

export async function markBillPaidAction(id: string, createExpense: boolean) {
  const parsed = resourceIdSchema.safeParse(id);
  if (!parsed.success) return fail("VALIDATION_ERROR", "Conta inválida.");
  const { supabase, userId } = await requireUser();
  const result = await billService.markPaid(supabase, userId, parsed.data, createExpense);
  if (result.success) revalidateFinance();
  return result;
}

export async function createRecurringAction(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const cents = centsFromForm(formData);
  if (!cents) return fail("VALIDATION_ERROR", "Informe um valor válido.");
  const parsed = recurringSchema.safeParse({
    type: formData.get("type") || "expense",
    description: formData.get("description"),
    amount_cents: cents,
    frequency: formData.get("frequency") || "monthly",
    interval_count: Number(formData.get("interval_count") || 1),
    start_date: formData.get("start_date"),
    day_of_month: formData.get("day_of_month") ? Number(formData.get("day_of_month")) : null,
    category_id: emptyToNull(formData.get("category_id")),
    generate_as: "bill",
  });
  if (!parsed.success) return fail("VALIDATION_ERROR", "Revise a recorrência.");
  const result = await recurringService.create(supabase, userId, parsed.data);
  if (result.success) {
    await recurringService.generateUpcoming(supabase, userId);
    revalidateFinance();
  }
  return result;
}

export async function createAccountAction(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const parsed = accountSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type") || "checking",
    initial_balance_cents: centsFromForm(formData, "initial_balance") ?? 0,
  });
  if (!parsed.success) return fail("VALIDATION_ERROR", "Revise os dados da conta.");
  const result = await accountService.create(supabase, userId, parsed.data);
  if (result.success) revalidateFinance();
  return result;
}

export async function createCardAction(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const parsed = creditCardSchema.safeParse({
    name: formData.get("name"),
    brand: formData.get("brand") || undefined,
    last_four: formData.get("last_four") || undefined,
    limit_cents: centsFromForm(formData, "limit") ?? undefined,
    closing_day: Number(formData.get("closing_day")),
    due_day: Number(formData.get("due_day")),
  });
  if (!parsed.success) return fail("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Revise o cartão.");
  const result = await cardService.create(supabase, userId, parsed.data);
  if (result.success) revalidateFinance();
  return result;
}

export async function createCategoryAction(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    icon: formData.get("icon") || "CircleDot",
    color: formData.get("color") || "#84CC16",
    type: formData.get("type") || "expense",
  });
  if (!parsed.success) return fail("VALIDATION_ERROR", "Revise a categoria.");
  const result = await categoryService.create(supabase, userId, parsed.data);
  if (result.success) revalidateFinance();
  return result;
}

export async function upsertBudgetAction(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const cents = centsFromForm(formData);
  if (!cents) return fail("VALIDATION_ERROR", "Informe um limite válido.");
  const parsed = budgetSchema.safeParse({
    category_id: formData.get("category_id"),
    amount_cents: cents,
    month: formData.get("month") || monthStartISO(),
  });
  if (!parsed.success) return fail("VALIDATION_ERROR", "Revise o orçamento.");
  const result = await budgetService.upsert(supabase, userId, parsed.data);
  if (result.success) revalidateFinance();
  return result;
}

export async function createGoalAction(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const cents = centsFromForm(formData, "target");
  if (!cents) return fail("VALIDATION_ERROR", "Informe a meta.");
  const parsed = goalSchema.safeParse({
    name: formData.get("name"),
    target_cents: cents,
    deadline: String(formData.get("deadline") || "") || undefined,
    icon: formData.get("icon") || "PiggyBank",
  });
  if (!parsed.success) return fail("VALIDATION_ERROR", "Revise a meta.");
  const result = await goalService.create(supabase, userId, parsed.data);
  if (result.success) revalidateFinance();
  return result;
}

export async function contributeGoalAction(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const cents = centsFromForm(formData);
  if (!cents) return fail("VALIDATION_ERROR", "Informe um valor.");
  const parsed = goalContributionSchema.safeParse({
    goal_id: formData.get("goal_id"),
    amount_cents: cents,
  });
  if (!parsed.success) return fail("VALIDATION_ERROR", "Revise a contribuição.");
  const result = await goalService.contribute(supabase, userId, parsed.data);
  if (result.success) revalidateFinance();
  return result;
}

export async function createSubscriptionAction(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const cents = centsFromForm(formData);
  if (!cents) return fail("VALIDATION_ERROR", "Informe um valor.");
  const parsed = subscriptionSchema.safeParse({
    name: formData.get("name"),
    amount_cents: cents,
    billing_day: Number(formData.get("billing_day")),
    category_id: emptyToNull(formData.get("category_id")),
    icon: formData.get("icon") || "RefreshCw",
  });
  if (!parsed.success) return fail("VALIDATION_ERROR", "Revise a assinatura.");
  const result = await subscriptionService.create(supabase, userId, parsed.data);
  if (result.success) revalidateFinance();
  return result;
}

export async function cancelSubscriptionAction(id: string) {
  const parsed = resourceIdSchema.safeParse(id);
  if (!parsed.success) return fail("VALIDATION_ERROR", "Assinatura inválida.");
  const { supabase, userId } = await requireUser();
  const result = await subscriptionService.cancel(supabase, userId, parsed.data);
  if (result.success) revalidateFinance();
  return result;
}

export async function updateProfileAction(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    timezone: formData.get("timezone") || "America/Sao_Paulo",
    currency: formData.get("currency") || "BRL",
  });
  if (!parsed.success) return fail("VALIDATION_ERROR", "Revise o perfil.");
  const result = await profileService.update(supabase, userId, parsed.data);
  if (result.success) {
    revalidatePath("/settings");
    revalidatePath("/settings/edit");
    revalidatePath("/settings/preferences");
  }
  return result;
}

function emptyToNull(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length ? text : null;
}
