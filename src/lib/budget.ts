import type { BudgetTone } from "@/types";

export function budgetTone(spentCents: number, limitCents: number): BudgetTone {
  if (limitCents <= 0) return "exceeded";
  const ratio = spentCents / limitCents;
  if (ratio >= 1) return "exceeded";
  if (ratio >= 0.9) return "near";
  if (ratio >= 0.7) return "attention";
  return "normal";
}

export function budgetPercent(spentCents: number, limitCents: number): number {
  if (limitCents <= 0) return 100;
  return Math.round((spentCents / limitCents) * 100);
}
