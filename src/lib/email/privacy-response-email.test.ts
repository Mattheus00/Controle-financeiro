import { describe, expect, it } from "vitest";
import { buildPrivacyResponseEmail } from "@/lib/email/privacy-response-email";

describe("privacy response email", () => {
  it("includes the response in text and escaped HTML", () => {
    const email = buildPrivacyResponseEmail({
      resolution: "COMPLETED",
      response: "Seu pedido foi concluído.\n<script>alert('x')</script>",
    });

    expect(email.subject).toContain("solicitação");
    expect(email.text).toContain("Seu pedido foi concluído.");
    expect(email.html).toContain("Seu pedido foi concluído.<br />");
    expect(email.html).toContain("&lt;script&gt;");
    expect(email.html).not.toContain("<script>");
  });

  it("uses rejected copy for rejected requests", () => {
    const email = buildPrivacyResponseEmail({ resolution: "REJECTED", response: "Pedido não aplicável." });
    expect(email.text).toContain("encerrada");
    expect(email.html).toContain("encerrada");
  });
});
