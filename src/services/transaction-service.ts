import { addMonthsISO } from "@/lib/date";
import { splitInstallments } from "@/lib/money";
import { fail, ok, type ActionResult } from "@/lib/errors";
import type { TransactionFilter, TransactionInput } from "@/validations/transaction";
import { sanitizeIlikeTerm } from "@/lib/privacy/safe-path";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/types/database";

type Client = SupabaseClient<Database>;
export type TransactionRow = Tables<"transactions">;

function isReportable(row: Pick<TransactionRow, "parent_transaction_id" | "installment_total">) {
  return row.installment_total == null || row.parent_transaction_id != null;
}

export const transactionService = {
  isReportable,

  async list(supabase: Client, userId: string, filters: TransactionFilter = {}) {
    let query = supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .or("installment_total.is.null,parent_transaction_id.not.is.null")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(200);

    if (filters.q) {
      const term = sanitizeIlikeTerm(filters.q);
      if (term) {
        query = query.or(
          `description.ilike.%${term}%,merchant.ilike.%${term}%,notes.ilike.%${term}%`,
        );
      }
    }
    if (filters.type) query = query.eq("type", filters.type);
    if (filters.category_id) query = query.eq("category_id", filters.category_id);
    if (filters.account_id) query = query.eq("account_id", filters.account_id);
    if (filters.credit_card_id) query = query.eq("credit_card_id", filters.credit_card_id);
    if (filters.payment_method) query = query.eq("payment_method", filters.payment_method);
    if (filters.merchant) query = query.ilike("merchant", `%${filters.merchant}%`);
    if (filters.from) query = query.gte("date", filters.from);
    if (filters.to) query = query.lte("date", filters.to);
    if (filters.min_cents) query = query.gte("amount_cents", filters.min_cents);
    if (filters.max_cents) query = query.lte("amount_cents", filters.max_cents);

    const { data, error } = await query;
    if (error) return fail("TRANSACTION_LIST_FAILED", "Não foi possível carregar as transações.");
    return ok(data ?? []);
  },

  async create(
    supabase: Client,
    userId: string,
    input: TransactionInput,
  ): Promise<ActionResult<TransactionRow>> {
    const installments = input.installment_total && input.installment_total > 1
      ? input.installment_total
      : 1;

    if (installments === 1) {
      const { data, error } = await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          type: input.type,
          description: input.description,
          amount_cents: input.amount_cents,
          date: input.date,
          category_id: input.category_id ?? null,
          account_id: input.account_id ?? null,
          credit_card_id: input.credit_card_id ?? null,
          destination_account_id: input.destination_account_id ?? null,
          payment_method: input.payment_method ?? null,
          merchant: input.merchant ?? null,
          notes: input.notes ?? null,
          tags: input.tags ?? [],
          icon: input.icon ?? null,
          is_recurring: input.is_recurring ?? false,
        })
        .select()
        .single();

      if (error || !data) {
        return fail("TRANSACTION_CREATE_FAILED", "Não foi possível registrar a transação.");
      }
      return ok(data);
    }

    const parts = splitInstallments(input.amount_cents, installments);
    const { data: parent, error: parentError } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        type: input.type,
        description: input.description,
        amount_cents: input.amount_cents,
        date: input.date,
        category_id: input.category_id ?? null,
        account_id: input.account_id ?? null,
        credit_card_id: input.credit_card_id ?? null,
        payment_method: input.payment_method ?? "credit",
        merchant: input.merchant ?? null,
        notes: input.notes ?? null,
        tags: input.tags ?? [],
        icon: input.icon ?? null,
        installment_total: installments,
        installment_number: 0,
      })
      .select()
      .single();

    if (parentError || !parent) {
      return fail("TRANSACTION_CREATE_FAILED", "Não foi possível registrar a compra parcelada.");
    }

    const children = parts.map((amount, index) => ({
      user_id: userId,
      type: input.type,
      description: `${input.description} (${index + 1}/${installments})`,
      amount_cents: amount,
      date: addMonthsISO(input.date, index),
      category_id: input.category_id ?? null,
      account_id: input.account_id ?? null,
      credit_card_id: input.credit_card_id ?? null,
      payment_method: input.payment_method ?? "credit",
      merchant: input.merchant ?? null,
      parent_transaction_id: parent.id,
      installment_number: index + 1,
      installment_total: installments,
      icon: input.icon ?? null,
      tags: input.tags ?? [],
    }));

    const { data: createdChildren, error: childrenError } = await supabase
      .from("transactions")
      .insert(children)
      .select();

    if (childrenError || !createdChildren) {
      return fail("INSTALLMENT_CREATE_FAILED", "Não foi possível gerar as parcelas.");
    }

    await supabase.from("transaction_installments").insert(
      createdChildren.map((child, index) => ({
        user_id: userId,
        parent_transaction_id: parent.id,
        transaction_id: child.id,
        number: index + 1,
        total: installments,
        amount_cents: child.amount_cents,
        due_date: child.date,
        status: "pending",
      })),
    );

    return ok(createdChildren[0] ?? parent);
  },

  async update(
    supabase: Client,
    userId: string,
    id: string,
    input: Partial<TransactionInput>,
  ): Promise<ActionResult<TransactionRow>> {
    const { data, error } = await supabase
      .from("transactions")
      .update({
        description: input.description,
        amount_cents: input.amount_cents,
        date: input.date,
        category_id: input.category_id,
        account_id: input.account_id,
        credit_card_id: input.credit_card_id,
        payment_method: input.payment_method,
        merchant: input.merchant,
        notes: input.notes,
        tags: input.tags,
        icon: input.icon,
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error || !data) return fail("TRANSACTION_NOT_FOUND", "Transação não encontrada.");
    return ok(data);
  },

  async remove(supabase: Client, userId: string, id: string): Promise<ActionResult<{ id: string }>> {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) return fail("TRANSACTION_DELETE_FAILED", "Não foi possível excluir a transação.");
    return ok({ id });
  },
};
