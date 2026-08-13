import type { MerchantBrand, MerchantCatalog } from "@/features/merchants/types/merchant";

function brand(
  partial: Pick<MerchantBrand, "id" | "name" | "slug" | "aliases"> & Partial<MerchantBrand>,
): MerchantBrand {
  return {
    logo_path: `/brands/${partial.slug}.svg`,
    category_slug: null,
    website: null,
    background_color: null,
    foreground_color: null,
    is_verified: true,
    is_active: true,
    ...partial,
  };
}

export const SEED_MERCHANT_BRANDS: MerchantBrand[] = [
  brand({
    id: "netflix",
    name: "Netflix",
    slug: "netflix",
    category_slug: "assinaturas",
    background_color: "#141414",
    foreground_color: "#E50914",
    aliases: ["netflix", "netflix.com", "netflix entretenimento", "netflix entretenimento brasil", "netflix servicos"],
  }),
  brand({
    id: "uber",
    name: "Uber",
    slug: "uber",
    category_slug: "transporte",
    background_color: "#000000",
    foreground_color: "#FFFFFF",
    aliases: ["uber", "uber trip", "uber *trip", "uber do brasil", "help.uber.com"],
  }),
  brand({
    id: "amazon",
    name: "Amazon",
    slug: "amazon",
    category_slug: "compras",
    background_color: "#FFFFFF",
    foreground_color: "#FF9900",
    aliases: ["amazon", "amazon.com", "amazon.com.br", "amzn"],
  }),
  brand({
    id: "spotify",
    name: "Spotify",
    slug: "spotify",
    category_slug: "assinaturas",
    background_color: "#191414",
    foreground_color: "#1DB954",
    aliases: ["spotify", "spotify.com"],
  }),
];

export function catalogFromBrands(brands: MerchantBrand[]): MerchantCatalog {
  return { brands };
}

export const TEST_CATALOG = catalogFromBrands(SEED_MERCHANT_BRANDS);
