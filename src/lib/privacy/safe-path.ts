const ALLOWED_NEXT = new Set([
  "/dashboard",
  "/transactions",
  "/bills",
  "/cards",
  "/subscriptions",
  "/budgets",
  "/goals",
  "/calendar",
  "/reports",
  "/settings",
  "/reset-password",
]);

export function safeNextPath(next: string | null | undefined, fallback = "/dashboard") {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("://") || next.includes("\\")) {
    return fallback;
  }
  const pathname = next.split("?")[0] ?? fallback;
  if (ALLOWED_NEXT.has(pathname)) return next.startsWith(pathname) ? pathname : fallback;
  return fallback;
}

export function sanitizeIlikeTerm(value: string, max = 80) {
  return value
    .replace(/[%_,.()\\:*]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}
