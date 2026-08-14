const ICON_FILE = /^(brands|merchant-fallbacks|categories)\/[a-z0-9][a-z0-9.-]*\.svg$/;

export const ICON_PUBLIC_PREFIX = "/icons/";

export function toPublicIconPath(relative: string): string | null {
  const cleaned = relative.replace(/^\/+/, "").replace(/^icons\//, "");
  if (!ICON_FILE.test(cleaned)) return null;
  return `${ICON_PUBLIC_PREFIX}${cleaned}`;
}

export function isAllowedPublicIconPath(path: string): boolean {
  if (!path.startsWith(ICON_PUBLIC_PREFIX)) return false;
  return ICON_FILE.test(path.slice(ICON_PUBLIC_PREFIX.length));
}
