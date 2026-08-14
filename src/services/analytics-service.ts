import { monthStartISO, previousMonthStartISO, rangeForPeriod, todayISO } from "@/lib/date";
import { percentChange } from "@/lib/money";
import type { ChartPeriod, Insight } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

type Tx = {
  amount_cents: number;
  type: string;
  date: string;
  merchant: string | null;
  description: string;
  category_id: string | null;
  categories: { name: string; slug: string; color: string; icon: string } | null;
};

function inRange(date: string, from: string, to: string) {
  return date >= from && date <= to;
}

export const analyticsService = {
  async dashboard(supabase: Client, userId: string, period: ChartPeriod = "30d") {
    const today = todayISO();
    const thisMonth = monthStartISO();
    const lastMonth = previousMonthStartISO();
    const { from, to } = rangeForPeriod(period);
    const lastMonthEnd = thisMonth;

    const [{ data: accounts }, { data: transactions }, { data: bills }, { data: subscriptions }] =
      await Promise.all([
        supabase.from("accounts").select("initial_balance_cents").eq("user_id", userId).eq("is_archived", false),
        supabase
          .from("transactions")
          .select("amount_cents, type, date, merchant, description, category_id, categories(name, slug, color, icon)")
          .eq("user_id", userId)
          .or("installment_total.is.null,parent_transaction_id.not.is.null")
          .gte("date", from < lastMonth ? from : lastMonth)
          .lte("date", to),
        supabase
          .from("bills")
          .select("amount_cents, due_date, status")
          .eq("user_id", userId)
          .in("status", ["pending", "overdue"])
          .gte("due_date", today),
        supabase
          .from("subscriptions")
          .select("amount_cents")
          .eq("user_id", userId)
          .eq("is_active", true),
      ]);

    const txs = (transactions ?? []) as unknown as Tx[];
    const opening = (accounts ?? []).reduce((sum, account) => sum + account.initial_balance_cents, 0);

    const monthTx = txs.filter((row) => row.date >= thisMonth && row.date <= today);
    const prevTx = txs.filter((row) => row.date >= lastMonth && row.date < lastMonthEnd);
    const periodTx = txs.filter((row) => inRange(row.date, from, to));

    const sumBy = (rows: Tx[], type: string) =>
      rows.filter((row) => row.type === type).reduce((sum, row) => sum + row.amount_cents, 0);

    const incomeMonth = sumBy(monthTx, "income");
    const expenseMonth = sumBy(monthTx, "expense");
    const incomePrev = sumBy(prevTx, "income");
    const expensePrev = sumBy(prevTx, "expense");
    const incomeAll = sumBy(txs, "income");
    const expenseAll = sumBy(txs, "expense");

    const currentBalance = opening + incomeAll - expenseAll;
    const lastBalance = opening + incomePrev - expensePrev + (incomeAll - incomeMonth) - (expenseAll - expenseMonth);
    const upcomingBills = (bills ?? []).reduce((sum, bill) => sum + bill.amount_cents, 0);
    const subscriptionsMonth = (subscriptions ?? []).reduce((sum, item) => sum + item.amount_cents, 0);

    const categoryMap = new Map<
      string,
      { name: string; slug: string; color: string; icon: string; amount: number }
    >();
    for (const row of monthTx.filter((item) => item.type === "expense")) {
      const key = row.categories?.slug ?? "outros";
      const current = categoryMap.get(key) ?? {
        name: row.categories?.name ?? "Outros",
        slug: key,
        color: row.categories?.color ?? "#94A3B8",
        icon: row.categories?.icon ?? "CircleDot",
        amount: 0,
      };
      current.amount += row.amount_cents;
      categoryMap.set(key, current);
    }

    const chart = buildChart(periodTx, from, to);
    const recent = [...periodTx]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 8)
      .map((row) => ({
        date: row.date,
        type: row.type,
        amount_cents: row.amount_cents,
        merchant: row.merchant || row.description,
        categorySlug: row.categories?.slug ?? null,
        categoryName: row.categories?.name ?? null,
      }));

    return {
      currentBalance,
      balanceChange: percentChange(currentBalance, lastBalance),
      incomeMonth,
      expenseMonth,
      upcomingBills,
      subscriptionsMonth,
      subscriptionsYear: subscriptionsMonth * 12,
      incomeChange: percentChange(incomeMonth, incomePrev),
      expenseChange: percentChange(expenseMonth, expensePrev),
      categories: [...categoryMap.values()].sort((a, b) => b.amount - a.amount),
      recent,
      chart,
      period,
      forecast: {
        currentBalance,
        expectedIncome: incomeMonth,
        expectedExpenses: upcomingBills,
        projected: currentBalance - upcomingBills,
      },
      expensePrev,
    };
  },

  insights(input: {
    expenseMonth: number;
    expensePrev: number;
    incomeMonth: number;
    subscriptionsMonth: number;
    categories: Array<{ slug: string; name: string; amount: number }>;
    uberCents: number;
  }): Insight[] {
    const insights: Insight[] = [];
    const food = input.categories.find((item) => item.slug === "alimentacao");
    const foodPrevRatio = input.expensePrev > 0 ? input.expenseMonth / input.expensePrev : null;

    if (food && input.expensePrev > 0 && foodPrevRatio && foodPrevRatio > 1.08) {
      const pct = Math.round((foodPrevRatio - 1) * 100);
      insights.push({
        id: "food-up",
        message: `Você gastou ${pct}% mais com ${food.name.toLowerCase()} este mês.`,
      });
    }

    if (food && input.expensePrev > 0 && foodPrevRatio && foodPrevRatio < 0.92) {
      const pct = Math.round((1 - foodPrevRatio) * 100);
      insights.push({
        id: "food-down",
        message: `Seu gasto com alimentação caiu ${pct}%.`,
      });
    }

    if (input.subscriptionsMonth > 0) {
      insights.push({
        id: "subs",
        message: `Suas assinaturas representam ${formatInsightMoney(input.subscriptionsMonth)} por mês.`,
      });
    }

    if (input.uberCents > 0) {
      insights.push({
        id: "uber",
        message: `Você gastou ${formatInsightMoney(input.uberCents)} com Uber nos últimos 30 dias.`,
      });
    }

    if (input.incomeMonth > 0) {
      const committed = Math.round((input.expenseMonth / input.incomeMonth) * 100);
      if (committed > 0) {
        insights.push({
          id: "committed",
          message: `Você já comprometeu ${committed}% da renda prevista deste mês.`,
        });
      }
    }

    return insights.slice(0, 4);
  },
};

function formatInsightMoney(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function buildChart(rows: Tx[], from: string, to: string) {
  const map = new Map<string, { date: string; income: number; expense: number }>();
  const cursor = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    map.set(key, { date: key, income: 0, expense: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  for (const row of rows) {
    const bucket = map.get(row.date);
    if (!bucket) continue;
    if (row.type === "income") bucket.income += row.amount_cents;
    if (row.type === "expense") bucket.expense += row.amount_cents;
  }
  return [...map.values()];
}
