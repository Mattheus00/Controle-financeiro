import { getMerchantInitials } from "@/features/merchants/utils/getMerchantInitials";

export const LUCIDE_ICON_NAMES = [
  "Utensils",
  "ShoppingCart",
  "House",
  "Car",
  "Fuel",
  "HeartPulse",
  "Dumbbell",
  "Gamepad2",
  "RefreshCw",
  "GraduationCap",
  "ShoppingBag",
  "Plane",
  "TrendingUp",
  "Landmark",
  "Gift",
  "PawPrint",
  "Briefcase",
  "Banknote",
  "CircleDot",
  "Tv",
  "Music",
  "Wifi",
  "Smartphone",
  "CreditCard",
  "Zap",
  "Droplets",
  "Cloud",
  "Sparkles",
  "Wallet",
  "PiggyBank",
  "Coffee",
  "Bus",
  "Bike",
  "Stethoscope",
  "BookOpen",
  "Ticket",
  "Home",
] as const;

export type LucideIconName = (typeof LUCIDE_ICON_NAMES)[number];

export function initialsFromName(name: string): string {
  return getMerchantInitials(name);
}

export function matchMerchantIcon(
  merchant: string | null | undefined,
  rules: Array<{ pattern: string; icon: string }>,
): string | null {
  if (!merchant) return null;
  const haystack = merchant.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

  for (const rule of rules) {
    const needle = rule.pattern.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
    if (haystack.includes(needle)) return rule.icon;
  }
  return null;
}

export function resolveEntityIcon(input: {
  icon?: string | null;
  merchant?: string | null;
  categoryIcon?: string | null;
  rules?: Array<{ pattern: string; icon: string }>;
}): string | null {
  if (input.icon) return input.icon;
  const fromMerchant = matchMerchantIcon(input.merchant, input.rules ?? []);
  if (fromMerchant) return fromMerchant;
  return input.categoryIcon ?? null;
}
