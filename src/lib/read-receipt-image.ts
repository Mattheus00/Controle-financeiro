import { parseReceiptText, emptyReceiptExtraction } from "@/lib/parse-receipt-text";
import type { ReceiptExtraction } from "@/types";

const OCR_TIMEOUT_MS = 25_000;

export async function readReceiptImage(file: File): Promise<ReceiptExtraction> {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    return emptyReceiptExtraction();
  }

  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("por");

  try {
    const result = await Promise.race([
      worker.recognize(file),
      new Promise<never>((_, reject) => {
        window.setTimeout(() => reject(new Error("OCR_TIMEOUT")), OCR_TIMEOUT_MS);
      }),
    ]);
    return parseReceiptText(result.data.text ?? "");
  } catch {
    return emptyReceiptExtraction();
  } finally {
    await worker.terminate().catch(() => undefined);
  }
}

