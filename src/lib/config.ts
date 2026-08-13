export const APP_NAME = "Folio";
export const APP_TAGLINE = "Entenda para onde seu dinheiro está indo.";
export const APP_DESCRIPTION =
  "Controle seus gastos, acompanhe suas metas e tome decisões melhores sem planilhas complicadas.";

export const DEFAULT_CURRENCY = "BRL";
export const DEFAULT_LOCALE = "pt-BR";
export const DEFAULT_TIMEZONE = "America/Sao_Paulo";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ALLOWED_RECEIPT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export const RECEIPT_RATE_LIMIT_WINDOW_MS = 60_000;
export const RECEIPT_RATE_LIMIT_MAX = 8;
