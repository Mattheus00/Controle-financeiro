import { todayISO } from "@/lib/date";
import { fail, ok, type ActionResult } from "@/lib/errors";
import type { BillInput } from "@/validations/bill";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/types/database";
import { transactionService } from "@/services/transaction-service";

type Client = SupabaseClient<Database>;
export type BillRow = Tables<"bills">;

function effectiveStatus(bill: Pick<BillRow, "status" | "due_date">, today: string) {
  if (bill.status === "pending" && bill.due_date < today) return "overdue";
  return bill.status;
}

export const billService = {
  effectiveStatus,

  async list(supabase: Client, userId: string) {
    const today = todayISO();
    const { data, error } = await supabase
      .from("bills")
      .select("*")
      .eq("user_id", userId)
      .neq("status", "cancelled")
      .order("due_date", { ascending: true });

    if (error) return fail("BILL_LIST_FAILED", "Não foi possível carregar as contas.");

    const rows = (data ?? []).map((bill) => ({
      ...bill,
      status: effectiveStatus(bill, today),
    }));
    return ok(rows);
  },

  async create(supabase: Client, userId: string, input: BillInput): Promise<ActionResult<BillRow>> {
    const { data, error } = await supabase
      .from("bills")
      .insert({
        user_id: userId,
        name: input.name,
        amount_cents: input.amount_cents,
        due_date: input.due_date,
        category_id: input.category_id ?? null,
        account_id: input.account_id ?? null,
        credit_card_id: input.credit_card_id ?? null,
        icon: input.icon ?? null,
        notes: input.notes ?? null,
      })
      .select()
      .single();

    if (error || !data) return fail("BILL_CREATE_FAILED", "Não foi possível criar a conta.");
    return ok(data);
  },

  async markPaid(
    supabase: Client,
    userId: string,
    id: string,
    createExpense: boolean,
  ): Promise<ActionResult<BillRow>> {
    const { data: bill, error } = await supabase
      .from("bills")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !bill) return fail("BILL_NOT_FOUND", "Conta não encontrada.");

    let paidTransactionId = bill.paid_transaction_id;
    if (createExpense) {
      const created = await transactionService.create(supabase, userId, {
        type: "expense",
        description: bill.name,
        amount_cents: bill.amount_cents,
        date: todayISO(),
        category_id: bill.category_id,
        account_id: bill.account_id,
        credit_card_id: bill.credit_card_id,
        merchant: bill.name,
        icon: bill.icon,
      });
      if (!created.success) return created;
      paidTransactionId = created.data.id;
    }

    const { data, error: updateError } = await supabase
      .from("bills")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        paid_transaction_id: paidTransactionId,
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError || !data) return fail("BILL_UPDATE_FAILED", "Não foi possível marcar a conta como paga.");
    return ok(data);
  },

  async cancel(supabase: Client, userId: string, id: string) {
    const { error } = await supabase
      .from("bills")
      .update({ status: "cancelled" })
      .eq("id", id)
      .eq("user_id", userId);
    if (error) return fail("BILL_UPDATE_FAILED", "Não foi possível cancelar a conta.");
    return ok({ id });
  },
};
