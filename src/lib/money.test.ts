import { describe, expect, it } from "vitest";
import { parseBRLToCents, splitInstallments, percentChange, formatBRL } from "@/lib/money";
import { budgetPercent, budgetTone } from "@/lib/budget";
import { matchMerchantIcon } from "@/lib/icons";
import { nextOccurrence } from "@/lib/date";
import { normalizeExtraction } from "@/services/receipt-processor";
import { transactionSchema } from "@/validations/transaction";

describe("money", () => {
  it("converts Brazilian currency strings to cents", () => {
    expect(parseBRLToCents("R$ 1.250,50")).toBe(125050);
    expect(parseBRLToCents("48,90")).toBe(4890);
    expect(parseBRLToCents("10")).toBe(1000);
  });

  it("splits installments without duplicating the total", () => {
    const parts = splitInstallments(120000, 6);
    expect(parts).toHaveLength(6);
    expect(parts.reduce((sum, value) => sum + value, 0)).toBe(120000);
    expect(parts.slice(1).every((value) => value === 20000)).toBe(true);
  });

  it("formats BRL", () => {
    expect(formatBRL(18642)).toContain("186,42");
  });

  it("calculates percent change", () => {
    expect(percentChange(118, 100)).toBe(18);
    expect(percentChange(0, 0)).toBe(0);
  });
});

describe("budget", () => {
  it("classifies budget tones", () => {
    expect(budgetTone(62000, 80000)).toBe("attention");
    expect(budgetTone(50000, 80000)).toBe("normal");
    expect(budgetTone(73000, 80000)).toBe("near");
    expect(budgetTone(81000, 80000)).toBe("exceeded");
    expect(budgetPercent(62000, 80000)).toBe(78);
  });
});

describe("icons", () => {
  it("matches merchant rules", () => {
    expect(matchMerchantIcon("Uber *trip", [{ pattern: "uber", icon: "Car" }])).toBe("Car");
    expect(matchMerchantIcon("Netflix", [{ pattern: "netflix", icon: "Tv" }])).toBe("Tv");
    expect(matchMerchantIcon("Padaria", [{ pattern: "uber", icon: "Car" }])).toBeNull();
  });
});

describe("recurrence", () => {
  it("advances monthly dates", () => {
    expect(nextOccurrence("2026-08-15", "monthly")).toBe("2026-09-15");
  });
});

describe("receipt extraction", () => {
  it("normalizes OCR payload", () => {
    const result = normalizeExtraction({
      merchant: "Supermercado Verdemar",
      amount: 186.42,
      date: "2026-08-13",
      payment_method: "credit",
      suggested_category: "Alimentação",
      confidence: 0.94,
    });
    expect(result.merchant).toBe("Supermercado Verdemar");
    expect(result.amount).toBe(186.42);
    expect(result.suggested_category).toBe("alimentacao");
    expect(result.confidence).toBe(0.94);
  });
});

describe("transaction validation", () => {
  it("accepts a valid expense", () => {
    const parsed = transactionSchema.safeParse({
      type: "expense",
      description: "Almoço",
      amount_cents: 4890,
      date: "2026-08-13",
      payment_method: "pix",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects a transfer without destination", () => {
    const parsed = transactionSchema.safeParse({
      type: "transfer",
      description: "Movimentação",
      amount_cents: 1000,
      date: "2026-08-13",
    });
    expect(parsed.success).toBe(false);
  });
});
