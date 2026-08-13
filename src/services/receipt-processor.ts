import type { PaymentMethod, ReceiptExtraction } from "@/types";

const SYSTEM_PROMPT = `Você extrai dados de comprovantes financeiros brasileiros.
Retorne APENAS um JSON válido com as chaves:
merchant, description, amount, date, payment_method, installments, document_number, cnpj, suggested_category, confidence.

Regras:
- amount é número em reais com ponto decimal (ex: 55.9), nunca string e nunca em centavos.
- date no formato YYYY-MM-DD (ex: 2026-08-13).
- payment_method deve ser um de: pix, cash, debit, credit, boleto, transfer, other.
- suggested_category deve ser um slug em português sem acento, por exemplo: alimentacao, mercado, transporte, moradia, lazer, assinaturas, saude, combustivel, educacao, compras, viagens, outros.
- confidence entre 0 e 1.
- Se um campo não estiver claro, use null.
- Nunca invente CNPJ ou valor.`;

const GROQ_MODELS = [
  process.env.GROQ_VISION_MODEL,
  "qwen/qwen3.6-27b",
].filter((model, index, list): model is string => Boolean(model) && list.indexOf(model) === index);

export function buildOcrRequestBody(input: { mimeType: string; base64: string }) {
  return {
    temperature: 0,
    response_format: { type: "json_object" as const },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extraia os dados deste comprovante, nota fiscal, recibo, boleto ou fatura.",
          },
          {
            type: "image_url",
            image_url: { url: `data:${input.mimeType};base64,${input.base64}` },
          },
        ],
      },
    ],
  };
}

export class ReceiptProcessor {
  constructor(private readonly apiKey = process.env.GROQ_API_KEY) {}

  async process(input: { buffer: Buffer; mimeType: string }): Promise<ReceiptExtraction> {
    if (!this.apiKey) {
      throw new Error("OCR_UNAVAILABLE");
    }
    if (input.mimeType === "application/pdf") {
      throw new Error("OCR_UNAVAILABLE");
    }

    const body = buildOcrRequestBody({
      mimeType: input.mimeType,
      base64: input.buffer.toString("base64"),
    });

    let lastError = "OCR_UNAVAILABLE";
    for (const model of GROQ_MODELS) {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...body, model }),
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        lastError = `OCR_UNAVAILABLE:${response.status}`;
        console.error("[folio:ocr]", response.status, detail.slice(0, 300));
        continue;
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const raw = payload.choices?.[0]?.message?.content?.trim();
      if (!raw) {
        lastError = "OCR_UNAVAILABLE:empty";
        continue;
      }

      return normalizeExtraction(parseModelJson(raw));
    }

    throw new Error(lastError);
  }
}

const PAYMENT_METHODS: PaymentMethod[] = [
  "pix",
  "cash",
  "debit",
  "credit",
  "boleto",
  "transfer",
  "other",
];

export function normalizeExtraction(raw: Record<string, unknown>): ReceiptExtraction {
  const amount = toAmount(raw.amount);
  const payment = String(raw.payment_method ?? "").toLowerCase();
  const confidence = Number(raw.confidence);

  return {
    merchant: toNullableString(raw.merchant),
    description: toNullableString(raw.description),
    amount,
    date: toNullableDate(raw.date),
    payment_method: PAYMENT_METHODS.includes(payment as PaymentMethod)
      ? (payment as PaymentMethod)
      : null,
    installments: toPositiveInt(raw.installments),
    document_number: toNullableString(raw.document_number),
    cnpj: toNullableString(raw.cnpj),
    suggested_category: toNullableString(raw.suggested_category)
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9]+/g, "") ?? null,
    confidence: Number.isFinite(confidence) ? Math.min(1, Math.max(0, confidence)) : 0,
  };
}

function parseModelJson(raw: string): Record<string, unknown> {
  const trimmed = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
    }
    throw new Error("OCR_UNAVAILABLE");
  }
}

function toNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toAmount(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/R\$/gi, "").replace(/\s/g, "").trim();
  if (!cleaned) return null;
  const parsed = cleaned.includes(",")
    ? Number(cleaned.replace(/\./g, "").replace(",", "."))
    : Number(cleaned);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  return null;
}

function toNullableDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed) && isValidIsoDate(trimmed)) return trimmed;
  const brazilian = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (brazilian) {
    const iso = `${brazilian[3]}-${brazilian[2]!.padStart(2, "0")}-${brazilian[1]!.padStart(2, "0")}`;
    if (isValidIsoDate(iso)) return iso;
  }
  return null;
}

function isValidIsoDate(value: string): boolean {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return false;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function toPositiveInt(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return null;
  return parsed;
}
