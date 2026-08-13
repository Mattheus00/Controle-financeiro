import type { PaymentMethod, ReceiptExtraction } from "@/types";

const SYSTEM_PROMPT = `Você extrai dados de comprovantes financeiros brasileiros.
Retorne APENAS um JSON válido com as chaves:
merchant, description, amount, date, payment_method, installments, document_number, cnpj, suggested_category, confidence.

Regras:
- amount é número em reais (ex: 186.42), não string e não em centavos.
- date no formato YYYY-MM-DD.
- payment_method deve ser um de: pix, cash, debit, credit, boleto, transfer, other.
- suggested_category deve ser um slug em português sem acento, por exemplo: alimentacao, mercado, transporte, moradia, lazer, assinaturas, saude, combustivel, educacao, compras, viagens, outros.
- confidence entre 0 e 1.
- Se um campo não estiver claro, use null.
- Nunca invente CNPJ ou valor.`;

export function buildOcrRequestBody(input: { mimeType: string; dataUrl: string }) {
  const isPdf = input.mimeType === "application/pdf";
  const content: Array<Record<string, unknown>> = [
    {
      type: "text",
      text: "Extraia os dados deste comprovante, nota fiscal, recibo, boleto ou fatura.",
    },
  ];
  if (isPdf) {
    content.push({
      type: "file",
      file: { filename: "comprovante.pdf", file_data: input.dataUrl },
    });
  } else {
    content.push({
      type: "image_url",
      image_url: { url: input.dataUrl },
    });
  }
  return {
    model: process.env.OPENAI_VISION_MODEL ?? "gpt-4o-mini",
    temperature: 0,
    store: false,
    response_format: { type: "json_object" as const },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content },
    ],
  };
}

export class ReceiptProcessor {
  constructor(private readonly apiKey = process.env.OPENAI_API_KEY) {}

  async process(input: { buffer: Buffer; mimeType: string }): Promise<ReceiptExtraction> {
    if (!this.apiKey) {
      throw new Error("OCR_UNAVAILABLE");
    }

    const dataUrl = `data:${input.mimeType};base64,${input.buffer.toString("base64")}`;
    const body = buildOcrRequestBody({ mimeType: input.mimeType, dataUrl });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("OCR_UNAVAILABLE");
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = payload.choices?.[0]?.message?.content;
    if (!raw) throw new Error("OCR_UNAVAILABLE");

    return normalizeExtraction(JSON.parse(raw) as Record<string, unknown>);
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

function toNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toAmount(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/\./g, "").replace(",", "."));
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
}

function toNullableDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return value;
}

function toPositiveInt(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return null;
  return parsed;
}
