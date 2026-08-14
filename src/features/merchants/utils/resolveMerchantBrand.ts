import type { MerchantBrand, MerchantCatalog, MerchantResolution, ResolveMerchantInput } from "@/features/merchants/types/merchant";
import { iconForCategorySlug } from "@/lib/categoryIconMap";
import { getMerchantInitials } from "@/features/merchants/utils/getMerchantInitials";
import { normalizeMerchantName, preserveOriginalName } from "@/features/merchants/utils/normalizeMerchantName";
import { getMerchantIcon, merchantDisplayName } from "@/lib/icons/get-merchant-icon";

const SHORT_ALIASES = new Set(["99"]);

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasBoundedAlias(haystack: string, alias: string) {
  if (alias.length < 3 && !SHORT_ALIASES.has(alias)) return false;
  const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(alias)}([^a-z0-9]|$)`);
  return pattern.test(haystack);
}

export function brandLogoUrl(logoPath: string | null | undefined): string | null {
  if (!logoPath) return null;
  if (logoPath.startsWith("http://") || logoPath.startsWith("https://") || logoPath.startsWith("/")) {
    return logoPath;
  }
  return `/icons/${logoPath.replace(/^\/+/, "")}`;
}

function brandResult(brand: MerchantBrand): MerchantResolution {
  return {
    type: "brand",
    merchantId: brand.id,
    name: brand.name,
    slug: brand.slug,
    logoUrl: brandLogoUrl(brand.logo_path),
    icon: iconForCategorySlug(brand.category_slug),
    backgroundColor: brand.background_color,
    foregroundColor: brand.foreground_color,
  };
}

function fallbackResolution(
  displayName: string,
  categorySlug?: string | null,
  categoryIcon?: string | null,
): MerchantResolution {
  const icon = categoryIcon || iconForCategorySlug(categorySlug);
  if (icon) {
    return {
      type: "category",
      merchantId: null,
      name: displayName,
      logoUrl: null,
      icon,
    };
  }
  return {
    type: "initials",
    merchantId: null,
    name: displayName || "?",
    logoUrl: null,
    icon: null,
    initials: getMerchantInitials(displayName || "?"),
  };
}

export function resolveMerchantBrand(
  input: ResolveMerchantInput,
  catalog: MerchantCatalog,
): MerchantResolution {
  const original = preserveOriginalName(input.merchantName) || "Estabelecimento";
  const normalized = input.merchantName ? normalizeMerchantName(input.merchantName) : "";

  if (input.userRules?.length && normalized) {
    const rule = input.userRules.find((item) => normalizeMerchantName(item.merchant_pattern) === normalized);
    if (rule?.custom_icon) {
      return {
        type: "category",
        merchantId: null,
        name: rule.custom_name || original,
        logoUrl: null,
        icon: rule.custom_icon,
      };
    }
  }

  const local = getMerchantIcon(input.merchantName ?? "", input.categorySlug ?? undefined);
  if (local.type === "brand" || local.type === "merchant-fallback") {
    return {
      type: "brand",
      merchantId: local.matchedMerchant ?? "",
      name: merchantDisplayName(local.matchedMerchant ?? "") || original,
      slug: local.matchedMerchant ?? "",
      logoUrl: local.icon,
      icon: local.lucideIcon ?? iconForCategorySlug(input.categorySlug),
      backgroundColor: null,
      foregroundColor: null,
    };
  }

  if (normalized) {
    const exact = catalog.brands.find((brand) => {
      if (!brand.is_active) return false;
      const names = [brand.slug, normalizeMerchantName(brand.name), ...brand.aliases.map(normalizeMerchantName)];
      return names.includes(normalized);
    });
    if (exact) return brandResult(exact);

    const ranked = catalog.brands
      .filter((brand) => brand.is_active)
      .flatMap((brand) =>
        [brand.slug, normalizeMerchantName(brand.name), ...brand.aliases.map(normalizeMerchantName)]
          .filter(Boolean)
          .map((alias) => ({ alias, brand })),
      )
      .sort((a, b) => b.alias.length - a.alias.length);

    for (const entry of ranked) {
      if (hasBoundedAlias(normalized, entry.alias)) return brandResult(entry.brand);
    }
  }

  if (local.lucideIcon) {
    return {
      type: "category",
      merchantId: null,
      name: original,
      logoUrl: null,
      icon: local.lucideIcon,
    };
  }

  return fallbackResolution(original, input.categorySlug, input.categoryIcon);
}

export function fallbackAfterLogoError(current: MerchantResolution): MerchantResolution {
  if (current.type !== "brand") return current;
  if (current.icon) {
    return {
      type: "category",
      merchantId: null,
      name: current.name,
      logoUrl: null,
      icon: current.icon,
    };
  }
  return {
    type: "initials",
    merchantId: null,
    name: current.name,
    logoUrl: null,
    icon: null,
    initials: getMerchantInitials(current.name),
  };
}
