import { MAX_UPLOAD_BYTES } from "@/lib/config";

const MAX_EDGE = 1600;
const TARGET_BYTES = 900_000;

export async function prepareReceiptFile(file: File): Promise<File> {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (isPdf) {
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new Error("FILE_TOO_LARGE");
    }
    return file;
  }

  const bitmap = await decodeImage(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    closeBitmap(bitmap);
    throw new Error("IMAGE_UNSUPPORTED");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  closeBitmap(bitmap);

  let quality = 0.82;
  let blob: Blob | null = null;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    blob = await canvasToJpeg(canvas, quality);
    if (blob.size <= TARGET_BYTES || quality <= 0.45) break;
    quality -= 0.08;
  }

  if (!blob || blob.size > MAX_UPLOAD_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }

  return new File([blob], "comprovante.jpg", { type: "image/jpeg", lastModified: Date.now() });
}

export function receiptPrepareErrorMessage(error: unknown) {
  const code = error instanceof Error ? error.message : "";
  if (code === "FILE_TOO_LARGE") {
    return "Arquivo grande demais. Use JPEG, PNG, WEBP ou PDF de até 10 MB.";
  }
  if (code === "IMAGE_UNSUPPORTED") {
    return "Não foi possível ler essa foto. Tire uma nova ou envie JPEG, PNG ou PDF.";
  }
  return "Não foi possível enviar o comprovante. Tente outra foto.";
}

async function decodeImage(file: File) {
  try {
    return await createImageBitmap(file);
  } catch {
    return loadHtmlImage(file);
  }
}

function loadHtmlImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("IMAGE_UNSUPPORTED"));
    };
    image.src = url;
  });
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("IMAGE_UNSUPPORTED"));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });
}

function closeBitmap(image: ImageBitmap | HTMLImageElement) {
  if ("close" in image && typeof image.close === "function") {
    image.close();
  }
}
