import type { AdminResolution } from "@/validations/admin";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function buildPrivacyResponseEmail({
  response,
  resolution,
}: {
  response: string;
  resolution: AdminResolution;
}) {
  const outcome = resolution === "COMPLETED" ? "concluída" : "encerrada";
  const subject = `Atualização da sua solicitação no Folio`;
  const text = `Olá,\n\nSua solicitação foi ${outcome}.\n\nResposta:\n${response}\n\nEquipe Folio`;
  const responseHtml = escapeHtml(response).replaceAll("\n", "<br />");

  const html = `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;background:#f4f4f5;font-family:Arial,sans-serif;color:#18181b">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:24px;padding:32px 28px">
          <tr><td>
            <p style="margin:0 0 8px;font-size:13px;color:#71717a">Folio</p>
            <h1 style="margin:0;font-size:24px">Solicitação ${outcome}</h1>
            <p style="margin:16px 0 8px;color:#52525b">Olá, esta é a resposta da equipe:</p>
            <div style="border-radius:16px;background:#f4f4f5;padding:16px;line-height:1.55">${responseHtml}</div>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}
