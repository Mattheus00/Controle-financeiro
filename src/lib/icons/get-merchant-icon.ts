import merchantMapJson from "../../../public/folio-icon-pack-v2/merchant-map.json";
import { compactMerchantName, normalizeMerchantName } from "@/features/merchants/utils/normalizeMerchantName";
import { toPublicIconPath } from "@/lib/icons/allowed-icon-path";
import { categoryLucideName, categorySvgPath, GENERIC_ICON } from "@/lib/icons/category-icon-fallbacks";
import type { MerchantIconMatch, MerchantIconType } from "@/lib/icons/merchant-icon-types";

type MapEntry = { icon: string; aliases: string[] };

const merchantMap = merchantMapJson as Record<string, MapEntry>;

const WEAK_ALIASES = new Set([
  "99",
  "oi",
  "c6",
  "max",
  "tim",
  "caixa",
  "vivo",
  "claro",
  "inter",
  "stone",
  "wise",
  "nu",
]);

type IndexedMerchant = {
  id: string;
  icon: string;
  type: Extract<MerchantIconType, "brand" | "merchant-fallback">;
  aliases: string[];
};

type AliasRow = { alias: string; merchant: IndexedMerchant };

function iconTypeFromPath(relative: string): IndexedMerchant["type"] {
  return relative.startsWith("brands/") ? "brand" : "merchant-fallback";
}

function uniqueAliases(id: string, aliases: string[]): string[] {
  const values = new Set<string>();
  for (const alias of [id, ...aliases]) {
    const normalized = normalizeMerchantName(alias);
    if (normalized) values.add(normalized);
  }
  return [...values];
}

const merchants: IndexedMerchant[] = Object.entries(merchantMap).flatMap(([id, entry]) => {
  const icon = toPublicIconPath(entry.icon);
  if (!icon) return [];
  return [
    {
      id,
      icon,
      type: iconTypeFromPath(entry.icon),
      aliases: uniqueAliases(id, entry.aliases),
    },
  ];
});

const aliasRows: AliasRow[] = merchants
  .flatMap((merchant) => merchant.aliases.map((alias) => ({ alias, merchant })))
  .sort((a, b) => b.alias.length - a.alias.length || a.merchant.id.localeCompare(b.merchant.id));

const exactIndex = new Map<string, IndexedMerchant>();
for (const row of aliasRows) {
  if (!exactIndex.has(row.alias)) exactIndex.set(row.alias, row.merchant);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasBoundedAlias(haystack: string, alias: string) {
  const pattern = new RegExp(`(^|[^a-z0-9.])${escapeRegExp(alias)}([^a-z0-9.]|$)`);
  return pattern.test(haystack);
}

function isWeakAlias(alias: string) {
  return alias.length < 3 || WEAK_ALIASES.has(alias);
}

export function merchantDisplayName(id: string) {
  const special: Record<string, string> = {
    "99": "99",
    "c6-bank": "C6 Bank",
    chatgpt: "ChatGPT",
    icloud: "iCloud",
    ifood: "iFood",
    youtube: "YouTube",
    "youtube-music": "YouTube Music",
    "banco-do-brasil": "Banco do Brasil",
    "pao-de-acucar": "Pão de Açúcar",
    "disney-plus": "Disney+",
    "uber-eats": "Uber Eats",
    "microsoft-365": "Microsoft 365",
    "prime-video": "Prime Video",
    "net-claro": "NET Claro",
    "epic-games": "Epic Games",
    "smart-fit": "Smart Fit",
  };
  if (special[id]) return special[id];
  return id
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function matchMerchant(normalized: string): IndexedMerchant | null {
  if (!normalized) return null;

  const exact = exactIndex.get(normalized);
  if (exact) return exact;

  for (const row of aliasRows) {
    if (normalized.startsWith(`${row.alias} `) || normalized.startsWith(`${row.alias}.`)) {
      return row.merchant;
    }
  }

  for (const row of aliasRows) {
    if (isWeakAlias(row.alias)) continue;
    if (hasBoundedAlias(normalized, row.alias)) return row.merchant;
  }

  return null;
}

function categoryFallback(category: string | undefined, _description: string): MerchantIconMatch {
  const svg = categorySvgPath(category);
  const lucideIcon = categoryLucideName(category);
  return {
    icon: svg ?? GENERIC_ICON,
    matchedMerchant: null,
    type: svg ? "category" : "generic",
    lucideIcon,
  };
}

const cache = new Map<string, MerchantIconMatch>();
const CACHE_LIMIT = 500;

function cacheGet(key: string): MerchantIconMatch | undefined {
  return cache.get(key);
}

function cacheSet(key: string, value: MerchantIconMatch) {
  if (cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(key, value);
}

export function getMerchantIcon(description: string, category?: string): MerchantIconMatch {
  const key = `${normalizeMerchantName(description)}::${normalizeMerchantName(category ?? "")}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  const normalized = normalizeMerchantName(description);
  const compact = compactMerchantName(description);
  const matched = matchMerchant(normalized) ?? (compact !== normalized ? matchMerchant(compact) : null);

  const result = matched
    ? {
        icon: matched.icon,
        matchedMerchant: matched.id,
        type: matched.type,
        lucideIcon: categoryLucideName(category),
      }
    : categoryFallback(category, description);

  cacheSet(key, result);
  return result;
}

export function fallbackMerchantIcon(current: MerchantIconMatch, category?: string): MerchantIconMatch {
  if (current.type === "category" || current.type === "generic") return current;
  return categoryFallback(category, current.matchedMerchant ?? "");
}
