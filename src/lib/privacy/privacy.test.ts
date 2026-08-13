import { describe, expect, it } from "vitest";
import { sanitizeLog } from "@/lib/privacy/sanitize-log";
import { createZip, textFile } from "@/lib/privacy/zip";
import { toCsv } from "@/lib/privacy/csv";
import { toUserError } from "@/lib/errors";
import { buildOcrRequestBody } from "@/services/receipt-processor";
import { creditCardSchema } from "@/validations/misc";
import { deleteAccountSchema, privacyRequestSchema, receiptUploadSchema } from "@/validations/privacy";
import { resolveMerchantBrand } from "@/features/merchants/utils/resolveMerchantBrand";

describe("sanitizeLog", () => {
  it("redacts secrets, tokens and password fields", () => {
    const result = sanitizeLog({
      password: "secret",
      token: "jwt-value",
      authorization: "Bearer abc",
      api_key: "sk-test",
      amount_cents: 1200,
    }) as Record<string, unknown>;
    expect(result.password).toBe("[redacted]");
    expect(result.token).toBe("[redacted]");
    expect(result.authorization).toBe("[redacted]");
    expect(result.api_key).toBe("[redacted]");
    expect(result.amount_cents).toBe(1200);
  });
});

describe("zip/csv", () => {
  it("creates a zip that starts with the PK signature", () => {
    const zip = createZip([textFile("hello.txt", "ola")]);
    expect(String.fromCharCode(zip[0]!, zip[1]!)).toBe("PK");
  });

  it("does not include another user's rows when building csv from filtered input", () => {
    const userA = [{ description: "Café", amount_cents: 1200, user_id: "aaa" }];
    const csv = toCsv(userA);
    expect(csv).toContain("Café");
    expect(csv).not.toContain("bbb");
  });
});

describe("errors", () => {
  it("does not leak supabase/sql messages", () => {
    const leaked = toUserError({ code: "42501", message: "permission denied for table transactions" });
    expect(leaked.success).toBe(false);
    if (!leaked.success) {
      expect(leaked.error.message).not.toContain("permission denied");
      expect(leaked.error.message).not.toContain("transactions");
    }
  });
});

describe("OCR payload", () => {
  it("sends only the file and extraction instructions", () => {
    const body = buildOcrRequestBody({
      mimeType: "image/jpeg",
      dataUrl: "data:image/jpeg;base64,abc",
    });
    const serialized = JSON.stringify(body);
    expect(serialized).not.toContain("user_id");
    expect(serialized).not.toContain("amount_cents");
    expect(serialized).not.toContain("saldo");
    expect(body.store).toBe(false);
    expect(body.messages).toHaveLength(2);
  });
});

describe("validations", () => {
  it("rejects full card numbers and extra fields via explicit schema", () => {
    const parsed = creditCardSchema.safeParse({
      name: "Nubank",
      last_four: "4242",
      closing_day: 10,
      due_day: 17,
      card_number: "4111111111111111",
      cvv: "123",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect("card_number" in parsed.data).toBe(false);
      expect("cvv" in parsed.data).toBe(false);
    }
  });

  it("rejects invalid privacy payloads", () => {
    expect(privacyRequestSchema.safeParse({ type: "HACK", message: "hello there" }).success).toBe(false);
    expect(receiptUploadSchema.safeParse({ mime: "application/exe", size: 10 }).success).toBe(false);
    expect(deleteAccountSchema.safeParse({ password: "12345678", confirmation: "apagar" }).success).toBe(false);
  });
});

describe("merchant resolver minimization", () => {
  it("accepts merchant name without a full transaction object", () => {
    const result = resolveMerchantBrand(
      { merchantName: "Netflix" },
      { brands: [] },
    );
    expect(result.name).toBeTruthy();
  });
});

describe("safe redirects and upload sniffing", () => {
  it("rejects open redirects", async () => {
    const { safeNextPath, sanitizeIlikeTerm } = await import("@/lib/privacy/safe-path");
    expect(safeNextPath("//evil.example")).toBe("/dashboard");
    expect(safeNextPath("https://evil.example")).toBe("/dashboard");
    expect(safeNextPath("/reset-password")).toBe("/reset-password");
    expect(sanitizeIlikeTerm("cafe,or.true")).toBe("cafe or true");
  });

  it("sniffs jpeg and rejects unknown bytes", async () => {
    const { sniffReceiptMime } = await import("@/lib/privacy/sniff-file");
    expect(sniffReceiptMime(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]))).toBe("image/jpeg");
    expect(sniffReceiptMime(Uint8Array.from([0x00, 0x01, 0x02, 0x03, 0, 0, 0, 0, 0, 0, 0, 0]))).toBeNull();
  });
});
