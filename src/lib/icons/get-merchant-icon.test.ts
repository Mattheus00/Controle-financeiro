import { describe, expect, it } from "vitest";
import { compactMerchantName, normalizeMerchantName } from "@/features/merchants/utils/normalizeMerchantName";
import { isAllowedPublicIconPath } from "@/lib/icons/allowed-icon-path";
import { getMerchantIcon } from "@/lib/icons/get-merchant-icon";

describe("normalizeMerchantName", () => {
  it("normalizes case, accents and receipt noise", () => {
    expect(normalizeMerchantName("UBER *TRIP SAO PAULO")).toBe("uber trip sao paulo");
    expect(normalizeMerchantName("Nú Bank")).toBe("nu bank");
  });

  it("compacts acquirer suffixes", () => {
    expect(compactMerchantName("NUBANK PAGAMENTOS")).toBe("nubank");
    expect(compactMerchantName("UBER DO BRASIL")).toBe("uber");
  });
});

describe("getMerchantIcon", () => {
  it.each([
    ["NUBANK", "nubank", "/icons/brands/nubank.svg", "brand"],
    ["NU PAGAMENTOS", "nubank", "/icons/brands/nubank.svg", "brand"],
    ["NUBANK PAGAMENTOS", "nubank", "/icons/brands/nubank.svg", "brand"],
    ["SPOTIFY", "spotify", "/icons/brands/spotify.svg", "brand"],
    ["SPOTIFY PREMIUM", "spotify", "/icons/brands/spotify.svg", "brand"],
    ["NETFLIX", "netflix", "/icons/brands/netflix.svg", "brand"],
    ["NETFLIX.COM", "netflix", "/icons/brands/netflix.svg", "brand"],
    ["UBER", "uber", "/icons/brands/uber.svg", "brand"],
    ["UBER *TRIP", "uber", "/icons/brands/uber.svg", "brand"],
    ["UBER DO BRASIL", "uber", "/icons/brands/uber.svg", "brand"],
    ["APPLE.COM/BILL", "apple", "/icons/brands/apple.svg", "brand"],
    ["APP STORE", "apple", "/icons/brands/apple.svg", "brand"],
    ["GOOGLE", "google", "/icons/brands/google.svg", "brand"],
    ["GOOGLE ONE", "google", "/icons/brands/google.svg", "brand"],
    ["GOOGLE PLAY", "google", "/icons/brands/google.svg", "brand"],
    ["PAYPAL", "paypal", "/icons/brands/paypal.svg", "brand"],
    ["PAYPAL *", "paypal", "/icons/brands/paypal.svg", "brand"],
    ["YOUTUBE", "youtube", "/icons/brands/youtube.svg", "brand"],
    ["YOUTUBE PREMIUM", "youtube", "/icons/brands/youtube.svg", "brand"],
  ] as const)("resolves %s", (description, merchant, icon, type) => {
    const result = getMerchantIcon(description);
    expect(result.matchedMerchant).toBe(merchant);
    expect(result.icon).toBe(icon);
    expect(result.type).toBe(type);
    expect(isAllowedPublicIconPath(result.icon)).toBe(true);
  });

  it("prefers Uber Eats over Uber", () => {
    const result = getMerchantIcon("UBER EATS CENTRO");
    expect(result.matchedMerchant).toBe("uber-eats");
    expect(result.icon).toBe("/icons/merchant-fallbacks/uber-eats.svg");
  });

  it("does not match Amazonas to Amazon", () => {
    const result = getMerchantIcon("Amazonas Restaurante", "Alimentação");
    expect(result.matchedMerchant).toBeNull();
    expect(result.icon).toBe("/icons/categories/food.svg");
    expect(result.type).toBe("category");
  });

  it("uses food fallback for an unknown restaurant", () => {
    const result = getMerchantIcon("RESTAURANTE DO JOAO", "Alimentação");
    expect(result.matchedMerchant).toBeNull();
    expect(result.icon).toBe("/icons/categories/food.svg");
    expect(result.type).toBe("category");
  });

  it("uses transport fallback", () => {
    const result = getMerchantIcon("Posto desconhecido", "Transporte");
    expect(result.icon).toBe("/icons/categories/transport.svg");
  });

  it("uses utilities fallback for bills", () => {
    const result = getMerchantIcon("Conta de energia", "Contas");
    expect(result.icon).toBe("/icons/categories/utilities.svg");
  });

  it("never builds a path from the raw description", () => {
    const result = getMerchantIcon("../etc/passwd");
    expect(result.icon.startsWith("/icons/")).toBe(true);
    expect(result.icon).not.toContain("passwd");
    expect(isAllowedPublicIconPath(result.icon)).toBe(true);
  });

  it("caches repeated lookups", () => {
    const first = getMerchantIcon("Spotify Premium");
    const second = getMerchantIcon("Spotify Premium");
    expect(second).toEqual(first);
  });
});
