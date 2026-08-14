import { iconForCategorySlug } from "@/lib/categoryIconMap";
import { toPublicIconPath } from "@/lib/icons/allowed-icon-path";
import { normalizeMerchantName } from "@/features/merchants/utils/normalizeMerchantName";

const CATEGORY_SVG: Record<string, string> = {
  alimentacao: "categories/food.svg",
  alimenta: "categories/food.svg",
  food: "categories/food.svg",
  restaurante: "categories/food.svg",
  restaurantes: "categories/food.svg",
  mercado: "categories/shopping.svg",
  compras: "categories/shopping.svg",
  shopping: "categories/shopping.svg",
  transporte: "categories/transport.svg",
  transport: "categories/transport.svg",
  combustivel: "categories/transport.svg",
  assinaturas: "categories/subscription.svg",
  assinatura: "categories/subscription.svg",
  subscription: "categories/subscription.svg",
  streaming: "categories/subscription.svg",
  contas: "categories/utilities.svg",
  utilities: "categories/utilities.svg",
  energia: "categories/utilities.svg",
  internet: "categories/utilities.svg",
  telefone: "categories/utilities.svg",
  moradia: "categories/utilities.svg",
  banco: "categories/bank.svg",
  bank: "categories/bank.svg",
  bancos: "categories/bank.svg",
  cartao: "categories/bank.svg",
  cartoes: "categories/bank.svg",
};

export const GENERIC_ICON = toPublicIconPath("categories/bank.svg") ?? "/icons/categories/bank.svg";

export function categorySvgPath(category?: string | null): string | null {
  if (!category) return null;
  const key = normalizeMerchantName(category).replace(/\s+/g, "");
  const relative = CATEGORY_SVG[key];
  return relative ? toPublicIconPath(relative) : null;
}

export function categoryLucideName(category?: string | null): string | null {
  if (!category) return null;
  const slug = normalizeMerchantName(category).replace(/\s+/g, "");
  return iconForCategorySlug(slug);
}
