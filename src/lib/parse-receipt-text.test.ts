import { describe, expect, it } from "vitest";
import { mergeReceiptExtraction, parseReceiptText } from "@/lib/parse-receipt-text";

describe("parseReceiptText", () => {
  it("reads a PIX transfer receipt", () => {
    const parsed = parseReceiptText(`
      Comprovante de transferência
      Pix
      R$ 50,00
      Para
      Padaria São João
      Em 13/08/2026 às 17:20
    `);
    expect(parsed.amount).toBe(50);
    expect(parsed.payment_method).toBe("pix");
    expect(parsed.date).toBe("2026-08-13");
    expect(parsed.merchant).toMatch(/Padaria/i);
    expect(parsed.confidence).toBeGreaterThan(0);
  });

  it("reads supermarket-style amount and CNPJ", () => {
    const parsed = parseReceiptText(`
      SUPERMERCADO VERDEMAR
      CNPJ 12.345.678/0001-90
      Valor total R$ 186,42
      13/08/2026
      Débito
    `);
    expect(parsed.amount).toBe(186.42);
    expect(parsed.merchant).toMatch(/VERDEMAR/i);
    expect(parsed.cnpj).toContain("12.345.678");
    expect(parsed.payment_method).toBe("debit");
    expect(parsed.suggested_category).toBe("alimentacao");
  });

  it("returns empty extraction for noise", () => {
    const parsed = parseReceiptText("asdf qwer");
    expect(parsed.amount).toBeNull();
    expect(parsed.merchant).toBeNull();
    expect(parsed.confidence).toBe(0);
  });
});

describe("mergeReceiptExtraction", () => {
  it("fills missing fields from the fallback", () => {
    const merged = mergeReceiptExtraction(
      {
        merchant: null,
        description: null,
        amount: null,
        date: null,
        payment_method: null,
        installments: null,
        document_number: null,
        cnpj: null,
        suggested_category: null,
        confidence: 0,
      },
      {
        merchant: "Uber",
        description: "Uber",
        amount: 24.9,
        date: "2026-08-13",
        payment_method: "pix",
        installments: null,
        document_number: null,
        cnpj: null,
        suggested_category: "transporte",
        confidence: 0.7,
      },
    );
    expect(merged.merchant).toBe("Uber");
    expect(merged.amount).toBe(24.9);
    expect(merged.confidence).toBe(0.7);
  });
});
