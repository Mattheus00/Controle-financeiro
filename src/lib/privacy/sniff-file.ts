export type ReceiptMime = "image/jpeg" | "image/png" | "image/webp" | "application/pdf";

export function sniffReceiptMime(buffer: Uint8Array): ReceiptMime | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return "image/png";
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }
  const head = String.fromCharCode(buffer[0]!, buffer[1]!, buffer[2]!, buffer[3]!);
  if (head === "%PDF") return "application/pdf";
  return null;
}
