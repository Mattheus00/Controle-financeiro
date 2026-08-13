const BRL_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBRL(cents: number): string {
  return BRL_FORMATTER.format(cents / 100);
}

export function formatCompactBRL(cents: number): string {
  return BRL_FORMATTER.format(cents / 100);
}

export function reaisToCents(reais: number): number {
  return Math.round(reais * 100);
}

export function centsToReais(cents: number): number {
  return cents / 100;
}

export function parseBRLToCents(input: string): number | null {
  const cleaned = input.replace(/\s/g, "").replace("R$", "").trim();
  if (!cleaned) return null;

  const hasComma = cleaned.includes(",");
  const hasDot = cleaned.includes(".");

  let normalized = cleaned;
  if (hasComma && hasDot) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (hasComma) {
    normalized = cleaned.replace(",", ".");
  } else if (hasDot && /^\d+\.\d{1,2}$/.test(cleaned)) {
    normalized = cleaned;
  } else {
    normalized = cleaned.replace(/\./g, "");
  }

  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return null;
  return reaisToCents(value);
}

export function splitInstallments(totalCents: number, count: number): number[] {
  if (count < 1) throw new Error("INSTALLMENT_COUNT_INVALID");
  if (totalCents <= 0) throw new Error("INSTALLMENT_AMOUNT_INVALID");

  const base = Math.floor(totalCents / count);
  const remainder = totalCents - base * count;

  return Array.from({ length: count }, (_, index) =>
    index === 0 ? base + remainder : base,
  );
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) {
    if (current === 0) return 0;
    return null;
  }
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(999, value));
}
