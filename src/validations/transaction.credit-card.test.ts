import { describe, expect, it } from "vitest";
import { quickExpenseSchema } from "@/validations/transaction";

describe("quickExpenseSchema", () => {
  const base = {
    amount_cents: 1990,
    date: "2026-08-14",
    description: "Almoço",
  };

  it("requires a credit card when payment is credit", () => {
    const parsed = quickExpenseSchema.safeParse({
      ...base,
      payment_method: "credit",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toBe("Escolha o cartão desta compra.");
    }
  });

  it("accepts a credit expense with a card id", () => {
    const parsed = quickExpenseSchema.safeParse({
      ...base,
      payment_method: "credit",
      credit_card_id: "11111111-1111-1111-1111-111111111111",
    });
    expect(parsed.success).toBe(true);
  });

  it("does not require a card for pix", () => {
    const parsed = quickExpenseSchema.safeParse({
      ...base,
      payment_method: "pix",
    });
    expect(parsed.success).toBe(true);
  });
});
