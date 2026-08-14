import sharp from "sharp";
import {
  MAX_UPLOAD_BYTES,
  RECEIPT_RATE_LIMIT_MAX,
  RECEIPT_RATE_LIMIT_WINDOW_MS,
} from "@/lib/config";
import { reaisToCents } from "@/lib/money";
import { fail, ok } from "@/lib/errors";
import { sniffReceiptMime } from "@/lib/privacy/sniff-file";
import { ReceiptProcessor } from "@/services/receipt-processor";
import { transactionService } from "@/services/transaction-service";
import type { ReceiptExtraction } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export const receiptService = {
  async processUpload(
    supabase: Client,
    userId: string,
    file: File,
  ) {
    if (file.size > MAX_UPLOAD_BYTES) {
      return fail("UPLOAD_INVALID", "Arquivo inválido. Use JPEG, PNG, WEBP ou PDF de até 10 MB.");
    }

    const windowStart = new Date(Date.now() - RECEIPT_RATE_LIMIT_WINDOW_MS).toISOString();
    const { count } = await supabase
      .from("receipt_scans")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", windowStart);

    if ((count ?? 0) >= RECEIPT_RATE_LIMIT_MAX) {
      return fail(
        "RATE_LIMIT",
        "Muitas tentativas em pouco tempo. Espere um instante e tente de novo.",
      );
    }

    const original = Buffer.from(await file.arrayBuffer());
    const sniffed = sniffReceiptMime(original);
    if (!sniffed) {
      return fail("UPLOAD_INVALID", "Arquivo inválido. Use JPEG, PNG, WEBP ou PDF de até 10 MB.");
    }
    const processed = await prepareFile(original, sniffed);
    const ext = processed.mimeType === "application/pdf" ? "pdf" : "jpg";
    const objectId = crypto.randomUUID();
    const storagePath = `${userId}/pending/${objectId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(storagePath, processed.buffer, {
        contentType: processed.mimeType,
        upsert: false,
      });

    if (uploadError) {
      return fail("UPLOAD_FAILED", "Não foi possível enviar o comprovante.");
    }

    const { data: scan, error: scanError } = await supabase
      .from("receipt_scans")
      .insert({
        user_id: userId,
        storage_path: storagePath,
        status: "processing",
      })
      .select()
      .single();

    if (scanError || !scan) {
      return fail("SCAN_CREATE_FAILED", "Não foi possível iniciar a leitura do comprovante.");
    }

    try {
      const extracted = await new ReceiptProcessor().process({
        buffer: processed.buffer,
        mimeType: processed.mimeType,
      });

      const { data: completed } = await supabase
        .from("receipt_scans")
        .update({
          status: "completed",
          extracted,
          confidence: extracted.confidence,
        })
        .eq("id", scan.id)
        .eq("user_id", userId)
        .select()
        .single();

      return ok({
        scanId: scan.id,
        storagePath,
        extracted,
        confidence: extracted.confidence,
      });
    } catch {
      await supabase
        .from("receipt_scans")
        .update({ status: "failed" })
        .eq("id", scan.id)
        .eq("user_id", userId);

      return ok({
        scanId: scan.id,
        storagePath,
        extracted: emptyExtraction(),
        confidence: 0,
      });
    }
  },

  async confirm(
    supabase: Client,
    userId: string,
    input: {
      scanId: string;
      amount_cents: number;
      date: string;
      description: string;
      merchant?: string | null;
      category_id?: string | null;
      payment_method?: string | null;
      account_id?: string | null;
      credit_card_id?: string | null;
      installment_total?: number;
      icon?: string | null;
    },
  ) {
    const { data: scan } = await supabase
      .from("receipt_scans")
      .select("*")
      .eq("id", input.scanId)
      .eq("user_id", userId)
      .single();

    if (!scan) return fail("SCAN_NOT_FOUND", "Leitura do comprovante não encontrada.");

    const created = await transactionService.create(supabase, userId, {
      type: "expense",
      description: input.description,
      amount_cents: input.amount_cents,
      date: input.date,
      merchant: input.merchant,
      category_id: input.category_id,
      payment_method: input.payment_method as never,
      account_id: input.account_id,
      credit_card_id: input.credit_card_id,
      installment_total: input.installment_total,
      icon: input.icon,
    });

    if (!created.success) return created;

    const filename = scan.storage_path.split("/").pop() ?? "comprovante";
    const folder = scan.storage_path.split("/").slice(0, -1).join("/");
    const { data: listed } = await supabase.storage.from("receipts").list(folder);
    const stored = listed?.find((item) => item.name === filename);
    const sizeBytes = Math.max(Number(stored?.metadata?.size ?? 1), 1);
    const mimeType = filename.endsWith(".pdf") ? "application/pdf" : "image/jpeg";

    const finalPath = `${userId}/${created.data.id}/${filename}`;
    await supabase.storage.from("receipts").move(scan.storage_path, finalPath);

    const { data: attachment } = await supabase
      .from("attachments")
      .insert({
        user_id: userId,
        transaction_id: created.data.id,
        storage_path: finalPath,
        mime_type: mimeType,
        size_bytes: sizeBytes,
        original_name: "comprovante",
      })
      .select()
      .single();

    await supabase
      .from("receipt_scans")
      .update({
        transaction_id: created.data.id,
        attachment_id: attachment?.id ?? null,
        storage_path: finalPath,
        status: "completed",
      })
      .eq("id", scan.id)
      .eq("user_id", userId);

    return ok(created.data);
  },
};

async function prepareFile(buffer: Buffer, mimeType: string) {
  if (mimeType === "application/pdf") {
    return { buffer, mimeType };
  }

  const output = await sharp(buffer)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  return { buffer: output, mimeType: "image/jpeg" };
}

function emptyExtraction(): ReceiptExtraction {
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

export function extractionToCents(extraction: ReceiptExtraction) {
  return extraction.amount ? reaisToCents(extraction.amount) : 0;
}
