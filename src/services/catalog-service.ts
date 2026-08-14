import { fail, ok } from "@/lib/errors";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { z } from "zod";
import type { accountSchema, categorySchema, creditCardSchema, budgetSchema, goalSchema, goalContributionSchema, subscriptionSchema, profileSchema } from "@/validations/misc";

type Client = SupabaseClient<Database>;
type AccountInput = z.infer<typeof accountSchema>;
type CardInput = z.infer<typeof creditCardSchema>;
type CategoryInput = z.infer<typeof categorySchema>;
type BudgetInput = z.infer<typeof budgetSchema>;
type GoalInput = z.infer<typeof goalSchema>;
type ContributionInput = z.infer<typeof goalContributionSchema>;
type SubscriptionInput = z.infer<typeof subscriptionSchema>;
type ProfileInput = z.infer<typeof profileSchema>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const accountService = {
  async list(supabase: Client, userId: string) {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", userId)
      .eq("is_archived", false)
      .order("created_at");
    if (error) return fail("ACCOUNT_LIST_FAILED", "Não foi possível carregar as contas.");
    return ok(data ?? []);
  },
  async create(supabase: Client, userId: string, input: AccountInput) {
    const { data, error } = await supabase
      .from("accounts")
      .insert({ ...input, user_id: userId })
      .select()
      .single();
    if (error || !data) return fail("ACCOUNT_CREATE_FAILED", "Não foi possível criar a conta.");
    return ok(data);
  },
};

export const cardService = {
  async list(supabase: Client, userId: string) {
    const [{ data: cards, error }, { data: txs }] = await Promise.all([
      supabase.from("credit_cards").select("*").eq("user_id", userId).eq("is_active", true).order("name"),
      supabase
        .from("transactions")
        .select("credit_card_id, amount_cents, date")
        .eq("user_id", userId)
        .eq("type", "expense")
        .not("credit_card_id", "is", null)
        .or("installment_total.is.null,parent_transaction_id.not.is.null"),
    ]);
    if (error) return fail("CARD_LIST_FAILED", "Não foi possível carregar os cartões.");

    const invoiceByCard = new Map<string, number>();
    for (const tx of txs ?? []) {
      if (!tx.credit_card_id) continue;
      invoiceByCard.set(tx.credit_card_id, (invoiceByCard.get(tx.credit_card_id) ?? 0) + tx.amount_cents);
    }

    return ok(
      (cards ?? []).map((card) => {
        const invoice = invoiceByCard.get(card.id) ?? 0;
        const available = card.limit_cents != null ? Math.max(0, card.limit_cents - invoice) : null;
        return { ...card, invoice_cents: invoice, available_cents: available };
      }),
    );
  },
  async create(supabase: Client, userId: string, input: CardInput) {
    const { data, error } = await supabase
      .from("credit_cards")
      .insert({ ...input, user_id: userId })
      .select()
      .single();
    if (error || !data) return fail("CARD_CREATE_FAILED", "Não foi possível criar o cartão.");
    return ok(data);
  },
};

export const categoryService = {
  async list(supabase: Client, userId: string) {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .order("name");
    if (error) return fail("CATEGORY_LIST_FAILED", "Não foi possível carregar as categorias.");
    return ok(data ?? []);
  },
  async create(supabase: Client, userId: string, input: CategoryInput) {
    const { data, error } = await supabase
      .from("categories")
      .insert({ ...input, user_id: userId, slug: slugify(input.name) })
      .select()
      .single();
    if (error || !data) return fail("CATEGORY_CREATE_FAILED", "Não foi possível criar a categoria.");
    return ok(data);
  },
};

export const budgetService = {
  async list(supabase: Client, userId: string, month: string) {
    const [{ data: budgets, error }, { data: txs }] = await Promise.all([
      supabase
        .from("budgets")
        .select("*")
        .eq("user_id", userId)
        .eq("month", month),
      supabase
        .from("transactions")
        .select("category_id, amount_cents")
        .eq("user_id", userId)
        .eq("type", "expense")
        .gte("date", month)
        .or("installment_total.is.null,parent_transaction_id.not.is.null"),
    ]);
    if (error) return fail("BUDGET_LIST_FAILED", "Não foi possível carregar o orçamento.");

    const spent = new Map<string, number>();
    for (const tx of txs ?? []) {
      if (!tx.category_id) continue;
      spent.set(tx.category_id, (spent.get(tx.category_id) ?? 0) + tx.amount_cents);
    }

    return ok(
      (budgets ?? []).map((budget) => ({
        ...budget,
        spent_cents: spent.get(budget.category_id) ?? 0,
      })),
    );
  },
  async upsert(supabase: Client, userId: string, input: BudgetInput) {
    const { data, error } = await supabase
      .from("budgets")
      .upsert({ ...input, user_id: userId }, { onConflict: "user_id,category_id,month" })
      .select()
      .single();
    if (error || !data) return fail("BUDGET_SAVE_FAILED", "Não foi possível salvar o orçamento.");
    return ok(data);
  },
};

export const goalService = {
  async list(supabase: Client, userId: string) {
    const { data, error } = await supabase
      .from("financial_goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) return fail("GOAL_LIST_FAILED", "Não foi possível carregar as metas.");
    return ok(data ?? []);
  },
  async create(supabase: Client, userId: string, input: GoalInput) {
    const { data, error } = await supabase
      .from("financial_goals")
      .insert({ ...input, user_id: userId, deadline: input.deadline || null })
      .select()
      .single();
    if (error || !data) return fail("GOAL_CREATE_FAILED", "Não foi possível criar a meta.");
    return ok(data);
  },
  async contribute(supabase: Client, userId: string, input: ContributionInput) {
    const { data: goal } = await supabase
      .from("financial_goals")
      .select("*")
      .eq("id", input.goal_id)
      .eq("user_id", userId)
      .single();
    if (!goal) return fail("GOAL_NOT_FOUND", "Meta não encontrada.");

    const { error } = await supabase.from("financial_goal_contributions").insert({
      user_id: userId,
      goal_id: input.goal_id,
      amount_cents: input.amount_cents,
      notes: input.notes ?? null,
    });
    if (error) return fail("CONTRIBUTION_FAILED", "Não foi possível guardar este valor.");

    const { data, error: updateError } = await supabase
      .from("financial_goals")
      .update({ current_cents: goal.current_cents + input.amount_cents })
      .eq("id", input.goal_id)
      .eq("user_id", userId)
      .select()
      .single();
    if (updateError || !data) return fail("GOAL_UPDATE_FAILED", "Não foi possível atualizar a meta.");
    return ok(data);
  },
};

export const subscriptionService = {
  async list(supabase: Client, userId: string) {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("name");
    if (error) return fail("SUBSCRIPTION_LIST_FAILED", "Não foi possível carregar as assinaturas.");
    const items = data ?? [];
    const monthly = items.reduce((sum, item) => sum + item.amount_cents, 0);
    return ok({ items, monthly, yearly: monthly * 12 });
  },
  async create(supabase: Client, userId: string, input: SubscriptionInput) {
    const { data, error } = await supabase
      .from("subscriptions")
      .insert({ ...input, user_id: userId })
      .select()
      .single();
    if (error || !data) return fail("SUBSCRIPTION_CREATE_FAILED", "Não foi possível criar a assinatura.");
    return ok(data);
  },
  async cancel(supabase: Client, userId: string, id: string) {
    const { data, error } = await supabase
      .from("subscriptions")
      .update({ is_active: false })
      .eq("id", id)
      .eq("user_id", userId)
      .eq("is_active", true)
      .select("id, recurring_transaction_id")
      .maybeSingle();
    if (error || !data) return fail("SUBSCRIPTION_CANCEL_FAILED", "Não foi possível cancelar a assinatura.");
    if (data.recurring_transaction_id) {
      await supabase
        .from("recurring_transactions")
        .update({ is_active: false })
        .eq("id", data.recurring_transaction_id)
        .eq("user_id", userId);
    }
    return ok({ id: data.id });
  },
};

export const profileService = {
  async get(supabase: Client, userId: string) {
    const [{ data: profile }, { data: preferences }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).single(),
      supabase.from("user_preferences").select("*").eq("user_id", userId).maybeSingle(),
    ]);
    return ok({ profile, preferences });
  },
  async update(supabase: Client, userId: string, input: ProfileInput) {
    const { data, error } = await supabase
      .from("profiles")
      .update(input)
      .eq("user_id", userId)
      .select()
      .single();
    if (error || !data) return fail("PROFILE_UPDATE_FAILED", "Não foi possível salvar o perfil.");
    return ok(data);
  },
};
