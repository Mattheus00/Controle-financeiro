import { describe, expect, it } from "vitest";
import { createHash, randomBytes } from "crypto";
import { buildSignupConfirmationEmail } from "@/lib/email/confirmation-email";

describe("signup confirmation email", () => {
  it("includes the confirmation URL in text and html", () => {
    const url = "https://controle-financeiro-one-inky.vercel.app/auth/confirm-email?token=abc";
    const email = buildSignupConfirmationEmail(url);
    expect(email.subject).toContain("Folio");
    expect(email.text).toContain(url);
    expect(email.html).toContain(url);
    expect(email.html).toContain("Confirmar e-mail");
    expect(email.html).toContain("lang=\"pt-BR\"");
  });

  it("hashes tokens as 64-char sha256 hex", () => {
    const token = randomBytes(32).toString("base64url");
    const hash = createHash("sha256").update(token).digest("hex");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(token.length).toBeGreaterThan(20);
  });
});
