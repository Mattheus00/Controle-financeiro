export function normalizeMerchantName(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[*_|#~•]+/g, " ")
    .replace(/[^\p{L}\p{N}.]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function preserveOriginalName(input: string | null | undefined): string {
  return (input ?? "").trim();
}
