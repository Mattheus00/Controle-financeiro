/** Maps category slugs (and common aliases) to Lucide icon names. */
export const CATEGORY_ICON_MAP: Record<string, string> = {
  alimentacao: "Utensils",
  mercado: "ShoppingCart",
  transporte: "Car",
  combustivel: "Fuel",
  moradia: "House",
  saude: "HeartPulse",
  academia: "Dumbbell",
  assinaturas: "RefreshCw",
  educacao: "GraduationCap",
  lazer: "Gamepad2",
  viagem: "Plane",
  viagens: "Plane",
  investimentos: "TrendingUp",
  compras: "ShoppingBag",
  pets: "PawPrint",
  impostos: "Landmark",
  energia: "Zap",
  internet: "Wifi",
  telefone: "Smartphone",
  presente: "Gift",
  presentes: "Gift",
  trabalho: "Briefcase",
  salario: "Banknote",
  outros: "CircleDot",
};

export function iconForCategorySlug(slug?: string | null): string | null {
  if (!slug) return null;
  return CATEGORY_ICON_MAP[slug.trim().toLowerCase()] ?? null;
}
