export const APP_NAME = "Folio";
export const APP_TAGLINE = "Entenda para onde seu dinheiro está indo.";
export const APP_DESCRIPTION =
  "Organize gastos, contas, cartões, assinaturas e metas em um só lugar. Fotografe comprovantes e deixe o Folio ajudar a registrar suas despesas.";
export const APP_MICROCOPY = "Simples de começar. Sem planilhas complicadas.";
export const APP_SLOGAN = "Menos planilhas. Mais clareza.";
export const LANDING_TITLE = "Folio — Controle financeiro pessoal simples e inteligente";
export const PRICING_FAQ_ANSWER =
  "Você pode começar agora, sem cartão. Enquanto o Folio está em lançamento, o acesso inicial é gratuito.";

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
