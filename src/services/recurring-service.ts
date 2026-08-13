import { nextOccurrence, todayISO } from "@/lib/date";
import { fail, ok } from "@/lib/errors";
import type { RecurringInput } from "@/validations/bill";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export const recurringService = {
  async list(supabase: Client, userId: string) {
    const { data, error } = await supabase
      .from("recurring_transactions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("next_occurrence");
    if (error) return fail("RECURRING_LIST_FAILED", "Não foi possível carregar as recorrências.");
    return ok(data ?? []);
  },

  async create(supabase: Client, userId: string, input: RecurringInput) {
    const { data, error } = await supabase
      .from("recurring_transactions")
      .insert({
        user_id: userId,
        type: input.type,
        description: input.description,
        amount_cents: input.amount_cents,
        frequency: input.frequency,
        interval_count: input.interval_count,
        start_date: input.start_date,
        next_occurrence: input.start_date,
        day_of_month: input.day_of_month ?? null,
        category_id: input.category_id ?? null,
        account_id: input.account_id ?? null,
        merchant: input.merchant ?? null,
        icon: input.icon ?? null,
        generate_as: input.generate_as,
      })
      .select()
      .single();
    if (error || !data) return fail("RECURRING_CREATE_FAILED", "Não foi possível criar a recorrência.");
    return ok(data);
  },

  async generateUpcoming(supabase: Client, userId: string, horizonDays = 45) {
    const today = todayISO();
    const horizon = new Date(`${today}T12:00:00`);
    horizon.setDate(horizon.getDate() + horizonDays);
    const horizonISO = horizon.toISOString().slice(0, 10);

    const { data: recurrences } = await supabase
      .from("recurring_transactions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .lte("next_occurrence", horizonISO);

    for (const item of recurrences ?? []) {
      let next = item.next_occurrence;
      while (next <= horizonISO) {
        if (item.end_date && next > item.end_date) break;

        if (item.generate_as === "bill") {
          const { data: existing } = await supabase
            .from("bills")
            .select("id")
            .eq("user_id", userId)
            .eq("recurring_transaction_id", item.id)
            .eq("due_date", next)
            .maybeSingle();

          if (!existing) {
            await supabase.from("bills").insert({
              user_id: userId,
              name: item.description,
              amount_cents: item.amount_cents,
              due_date: next,
              category_id: item.category_id,
              account_id: item.account_id,
              credit_card_id: item.credit_card_id,
              icon: item.icon,
              recurring_transaction_id: item.id,
            });
          }
        }

        next = nextOccurrence(
          next,
          item.frequency as "weekly" | "monthly" | "quarterly" | "semiannual" | "yearly" | "custom",
          item.interval_count,
        );
      }

      await supabase
        .from("recurring_transactions")
        .update({ next_occurrence: next })
        .eq("id", item.id)
        .eq("user_id", userId);
    }
  },
};
