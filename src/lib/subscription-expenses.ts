import { addMonthsISO } from "@/lib/date";
import { compactMerchantName } from "@/features/merchants/utils/normalizeMerchantName";

export type SubscriptionExpenseInput = {
  amount_cents: number;
  billing_day: number;
  name: string;
  merchant: string | null;
  created_at: string;
  category_id: string | null;
  categories: { name: string; slug: string; color: string; icon: string } | null;
};

export type RecordedExpense = {
  amount_cents: number;
  type: string;
  date: string;
  merchant: string | null;
  description: string;
};

export const DEFAULT_SUBSCRIPTION_CATEGORY = {
  name: "Assinaturas",
  slug: "assinaturas",
  color: "#6366F1",
  icon: "RefreshCw",
};

export function billingDateForMonth(yearMonth: string, billingDay: number): string {
  const day = String(Math.min(28, Math.max(1, billingDay))).padStart(2, "0");
  return `${yearMonth}-${day}`;
}

function nextYearMonth(yearMonth: string): string {
  return addMonthsISO(`${yearMonth}-01`, 1).slice(0, 7);
}

export function upcomingSubscriptionTotal(
  subscriptions: SubscriptionExpenseInput[],
  recorded: RecordedExpense[],
  today: string,
  horizonISO: string,
) {
  let total = 0;
  for (const subscription of subscriptions) {
    const thisMonthDate = billingDateForMonth(today.slice(0, 7), subscription.billing_day);
    if (thisMonthDate > today) continue;
    const nextDate = billingDateForMonth(nextYearMonth(today.slice(0, 7)), subscription.billing_day);
    if (nextDate > today && nextDate <= horizonISO && !subscriptionAlreadyRecorded(recorded, subscription, nextDate)) {
      total += subscription.amount_cents;
    }
  }
  return total;
}

export function subscriptionChargeDates(
  input: { billing_day: number; created_at: string },
  from: string,
  to: string,
): string[] {
  const createdMonth = input.created_at.slice(0, 7);
  const fromMonth = from.slice(0, 7);
  let month = createdMonth > fromMonth ? createdMonth : fromMonth;
  const endMonth = to.slice(0, 7);
  const dates: string[] = [];

  while (month <= endMonth) {
    let date = billingDateForMonth(month, input.billing_day);
    if (date > to) {
      if (month === to.slice(0, 7)) date = to;
      else {
        month = nextYearMonth(month);
        continue;
      }
    }
    if (date >= from && date <= to) dates.push(date);
    month = nextYearMonth(month);
  }

  return dates;
}

function namesOverlap(left: string, right: string) {
  const a = compactMerchantName(left);
  const b = compactMerchantName(right);
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

export function subscriptionAlreadyRecorded(
  expenses: RecordedExpense[],
  subscription: Pick<SubscriptionExpenseInput, "amount_cents" | "name" | "merchant">,
  chargeDate: string,
) {
  const month = chargeDate.slice(0, 7);
  const label = subscription.merchant || subscription.name;
  return expenses.some((row) => {
    if (row.type !== "expense") return false;
    if (row.amount_cents !== subscription.amount_cents) return false;
    if (!row.date.startsWith(month)) return false;
    return namesOverlap(label, row.merchant || "") || namesOverlap(label, row.description);
  });
}

export function projectedSubscriptionExpenses(
  subscriptions: SubscriptionExpenseInput[],
  recorded: RecordedExpense[],
  from: string,
  to: string,
) {
  const projected: Array<{
    date: string;
    amount_cents: number;
    name: string;
    category: { name: string; slug: string; color: string; icon: string };
  }> = [];

  for (const subscription of subscriptions) {
    const category = subscription.categories ?? DEFAULT_SUBSCRIPTION_CATEGORY;
    for (const date of subscriptionChargeDates(subscription, from, to)) {
      if (subscriptionAlreadyRecorded(recorded, subscription, date)) continue;
      projected.push({
        date,
        amount_cents: subscription.amount_cents,
        name: subscription.merchant || subscription.name,
        category,
      });
    }
  }

  return projected;
}
