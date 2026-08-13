import { describe, expect, it } from "vitest";
import { getMerchantInitials } from "@/features/merchants/utils/getMerchantInitials";
import { normalizeMerchantName } from "@/features/merchants/utils/normalizeMerchantName";
import { fallbackAfterLogoError, resolveMerchantBrand } from "@/features/merchants/utils/resolveMerchantBrand";
import { TEST_CATALOG } from "@/features/merchants/utils/test-catalog";

describe("normalizeMerchantName", () => {
  it("trims, lowercases and keeps domains", () => {
    expect(normalizeMerchantName("  NETFLIX.COM  ")).toBe("netflix.com");
  });

  it("strips receipt noise without losing the brand token", () => {
    expect(normalizeMerchantName("UBER *TRIP HELP.UBER.COM")).toBe("uber trip help.uber.com");
  });
});

describe("resolveMerchantBrand", () => {
  it.each(["Netflix", "NETFLIX", "Netflix.com", "NETFLIX.COM", "  NETFLIX.COM  "])(
    "resolves %s to Netflix",
    (merchantName) => {
      const result = resolveMerchantBrand({ merchantName }, TEST_CATALOG);
      expect(result.type).toBe("brand");
      if (result.type === "brand") {
        expect(result.name).toBe("Netflix");
        expect(result.slug).toBe("netflix");
      }
    },
  );

  it("resolves UBER *TRIP to Uber", () => {
    const result = resolveMerchantBrand({ merchantName: "UBER *TRIP" }, TEST_CATALOG);
    expect(result.type).toBe("brand");
    if (result.type === "brand") expect(result.name).toBe("Uber");
  });

  it("does not match Amazonas to Amazon", () => {
    const result = resolveMerchantBrand(
      { merchantName: "Amazonas Restaurante", categorySlug: "alimentacao" },
      TEST_CATALOG,
    );
    expect(result.type).toBe("category");
    if (result.type === "category") {
      expect(result.name).toBe("Amazonas Restaurante");
      expect(result.icon).toBe("Utensils");
    }
  });

  it("falls back to category for unknown bakeries", () => {
    const result = resolveMerchantBrand(
      { merchantName: "Padaria São João", categorySlug: "alimentacao" },
      TEST_CATALOG,
    );
    expect(result.type).toBe("category");
    if (result.type === "category") expect(result.icon).toBe("Utensils");
  });

  it("falls back to initials when nothing else matches", () => {
    const result = resolveMerchantBrand({ merchantName: "Empresa desconhecida" }, TEST_CATALOG);
    expect(result.type).toBe("initials");
    if (result.type === "initials") expect(result.initials).toBe("ED");
  });

  it("falls back when a brand logo URL fails to load", () => {
    const brand = resolveMerchantBrand({ merchantName: "Netflix" }, TEST_CATALOG);
    const next = fallbackAfterLogoError(brand);
    expect(next.type).toBe("category");
    if (next.type === "category") expect(next.icon).toBe("RefreshCw");
  });
});

describe("getMerchantInitials", () => {
  it("builds two-letter initials", () => {
    expect(getMerchantInitials("Padaria São João")).toBe("PS");
    expect(getMerchantInitials("Mercado Central")).toBe("MC");
    expect(getMerchantInitials("Uber")).toBe("U");
  });
});
