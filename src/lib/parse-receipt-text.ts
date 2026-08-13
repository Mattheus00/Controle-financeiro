import type { PaymentMethod, ReceiptExtraction } from "@/types";
import { parseBRLToCents, centsToReais } from "@/lib/money";

const SKIP_LINE =
  /^(comprovante|transferencia|transferência|pix enviado|pix recebido|pix|banco|nubank|inter|itau|itaú|bradesco|santander|caixa|bb|banco do brasil|cpf|cnpj|autenticacao|autenticação|id da transacao|id da transação|e2e|sucesso|concluido|concluído|pago|pagou|voce pagou|você pagou|para|de|em|valor|data|horario|horário|tipo|descricao|descrição|mensagem|copia e cola|copia cola|qr code|aprovado|realizado)$/i;

const MONTHS: Record<string, string> = {
  janeiro: "01",
  fevereiro: "02",
  marco: "03",
  março: "03",
  abril: "04",
  maio: "05",
  junho: "06",
  julho: "07",
  agosto: "08",
  setembro: "09",
  outubro: "10",
  novembro: "11",
  dezembro: "12",
};

const CATEGORY_HINTS: Array<[RegExp, string]> = [
  [/\b(uber|99|cabify|onibus|ônibus|metro|metrô|combustivel|combustível|shell|ipiranga|posto)\b/i, "transporte"],
  [/\b(ifood|rappi|restaurante|padaria|mercado|supermercado|carrefour|assai|açaí|lanche)\b/i, "alimentacao"],
  [/\b(netflix|spotify|disney|prime video|youtube|icloud|chatgpt)\b/i, "assinaturas"],
  [/\b(aluguel|condominio|condomínio|energia|enel|cemig|copel|agua|água|sabesp|vivo|claro|tim)\b/i, "moradia"],
  [/\b(farmacia|farmácia|droga|hospital|clinica|clínica|unimed)\b/i, "saude"],
];

export function emptyReceiptExtraction(): ReceiptExtraction {
  return {
    merchant: null,
    description: null,
    amount: null,
    date: null,
    payment_method: null,
    installments: null,
    document_number: null,
    cnpj: null,
    suggested_category: null,
    confidence: 0,
  };
}

export function parseReceiptText(raw: string): ReceiptExtraction {
  const text = raw.replace(/\u00a0/g, " ").replace(/[|]+/g, "\n");
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const amount = findAmount(text);
  const date = findDate(text);
  const payment_method = findPaymentMethod(text);
  const cnpj = findCnpj(text);
  const merchant = findMerchant(text, lines, Boolean(amount || date || payment_method));
  const suggested_category = findCategory(`${merchant ?? ""} ${text}`);
  const hits = [amount, date, payment_method, merchant].filter(Boolean).length;

  return {
    merchant,
    description: merchant,
    amount,
    date,
    payment_method,
    installments: null,
    document_number: null,
    cnpj,
    suggested_category,
    confidence: hits === 0 ? 0 : Math.min(0.85, 0.25 * hits + (cnpj ? 0.1 : 0)),
  };
}

export function mergeReceiptExtraction(
  primary: ReceiptExtraction,
  fallback: ReceiptExtraction,
): ReceiptExtraction {
  return {
    merchant: primary.merchant ?? fallback.merchant,
    description: primary.description ?? fallback.description,
    amount: primary.amount ?? fallback.amount,
    date: primary.date ?? fallback.date,
    payment_method: primary.payment_method ?? fallback.payment_method,
    installments: primary.installments ?? fallback.installments,
    document_number: primary.document_number ?? fallback.document_number,
    cnpj: primary.cnpj ?? fallback.cnpj,
    suggested_category: primary.suggested_category ?? fallback.suggested_category,
    confidence: Math.max(primary.confidence, fallback.confidence),
  };
}

function findAmount(text: string): number | null {
  const patterns = [
    /R\$\s*(\d{1,3}(?:\.\d{3})*,\d{2})/gi,
    /valor[:\s]+R\$?\s*(\d{1,3}(?:\.\d{3})*,\d{2})/gi,
    /(\d{1,3}(?:\.\d{3})*,\d{2})/g,
  ];
  const candidates: number[] = [];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const cents = parseBRLToCents(match[1] ?? "");
      if (cents && cents >= 100 && cents <= 100_000_000) {
        candidates.push(centsToReais(cents));
      }
    }
    if (candidates.length > 0) break;
  }
  if (candidates.length === 0) return null;
  return candidates.sort((a, b) => b - a)[0] ?? null;
}

function findDate(text: string): string | null {
  const numeric = text.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/);
  if (numeric) {
    const day = numeric[1]!.padStart(2, "0");
    const month = numeric[2]!.padStart(2, "0");
    let year = numeric[3]!;
    if (year.length === 2) year = `20${year}`;
    if (isValidIsoDate(`${year}-${month}-${day}`)) return `${year}-${month}-${day}`;
  }

  const named = text.match(
    /\b(\d{1,2})\s+de\s+(janeiro|fevereiro|mar[cç]o|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+(?:de\s+)?(\d{4})\b/i,
  );
  if (named) {
    const day = named[1]!.padStart(2, "0");
    const monthName = named[2]!.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
    const month = MONTHS[named[2]!.toLowerCase()] ?? MONTHS[monthName];
    const year = named[3]!;
    if (month && isValidIsoDate(`${year}-${month}-${day}`)) return `${year}-${month}-${day}`;
  }
  return null;
}

function findPaymentMethod(text: string): PaymentMethod | null {
  const normalized = text.toLowerCase();
  if (/\bpix\b/.test(normalized)) return "pix";
  if (/\bboleto\b/.test(normalized)) return "boleto";
  if (/\bcr[eé]dito\b/.test(normalized)) return "credit";
  if (/\bd[eé]bito\b/.test(normalized)) return "debit";
  if (/\bdinheiro\b|\bcash\b/.test(normalized)) return "cash";
  if (/\bted\b|\bdoc\b|\btransfer[eê]ncia\b/.test(normalized)) return "transfer";
  return null;
}

function findCnpj(text: string): string | null {
  const match = text.match(/\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/);
  return match?.[0] ?? null;
}

function findMerchant(text: string, lines: string[], hasContext: boolean): string | null {
  const labeled = text.match(
    /(?:para|favorecido|recebedor|estabelecimento|loja|nome)[:\s]+([A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9 .&'-]{2,40})/i,
  );
  if (labeled) {
    const value = cleanMerchant(labeled[1] ?? "");
    if (value) return value;
  }

  if (!hasContext) return null;

  for (const line of lines) {
    const cleaned = cleanMerchant(line);
    if (!cleaned) continue;
    if (isGenericMerchant(cleaned)) continue;
    if (/^\d/.test(cleaned)) continue;
    if (cleaned.length < 3 || cleaned.length > 42) continue;
    return cleaned;
  }
  return null;
}

function isGenericMerchant(value: string): boolean {
  const normalized = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
  if (SKIP_LINE.test(normalized)) return true;
  if (/^comprovante\b/.test(normalized)) return true;
  if (/^transferencia\b/.test(normalized)) return true;
  return false;
}

function cleanMerchant(value: string): string | null {
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (!trimmed) return null;
  if (/^R\$/.test(trimmed)) return null;
  if (/^\d+[/-]\d+/.test(trimmed)) return null;
  return trimmed;
}

function findCategory(text: string): string | null {
  for (const [pattern, slug] of CATEGORY_HINTS) {
    if (pattern.test(text)) return slug;
  }
  return null;
}

function isValidIsoDate(value: string): boolean {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return false;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
