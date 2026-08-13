const STOP_WORDS = new Set(["de", "da", "do", "dos", "das", "e", "em", "a", "o", "as", "os", "para", "com", "the"]);

export function getMerchantInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .filter((part) => !STOP_WORDS.has(part.toLowerCase()));

  const usable = parts.length > 0 ? parts : name.trim().split(/\s+/).filter(Boolean);
  if (usable.length === 0) return "?";
  if (usable.length === 1) return (usable[0][0] ?? "?").toUpperCase();
  return `${usable[0][0] ?? ""}${usable[1][0] ?? ""}`.toUpperCase();
}
