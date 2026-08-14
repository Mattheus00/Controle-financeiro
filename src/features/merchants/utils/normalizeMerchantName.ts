const ACQUIRER_NOISE =
  /\b(pagto|pagamento|pagamentos|compra|debit|credito|credito|parcela|parcelado|sa|ltda|epp|me|eireli|do brasil|brasil)\b/g;

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

export function compactMerchantName(input: string): string {
  return normalizeMerchantName(input).replace(ACQUIRER_NOISE, " ").replace(/\s+/g, " ").trim();
}

export function preserveOriginalName(input: string | null | undefined): string {
  return (input ?? "").trim();
}
