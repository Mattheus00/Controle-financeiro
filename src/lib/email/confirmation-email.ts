import { APP_NAME } from "@/lib/config";

export function buildSignupConfirmationEmail(confirmUrl: string) {
  const subject = `Confirme seu e-mail no ${APP_NAME}`;
  const safeUrl = confirmUrl.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  const text = [
    `Confirme seu e-mail para ativar sua conta no ${APP_NAME}.`,
    "",
    `Abra este link (vale por 24 horas):`,
    confirmUrl,
    "",
    "Se você não criou essa conta, ignore este e-mail.",
  ].join("\n");

  const html = `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;">Este link expira em 24 horas.</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:24px;padding:32px 28px;">
            <tr>
              <td>
                <p style="margin:0 0 8px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#84CC16;">${APP_NAME}</p>
                <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:#111111;">Confirme seu e-mail</h1>
                <p style="margin:0 0 24px;font-size:16px;line-height:1.5;color:#3f3f46;">
                  Para ativar sua conta, confirme que este e-mail é seu. O link vale por 24 horas.
                </p>
                <p style="margin:0 0 28px;">
                  <a href="${safeUrl}" style="display:inline-block;background:#84CC16;color:#111111;text-decoration:none;font-size:16px;font-weight:600;padding:14px 22px;border-radius:16px;">
                    Confirmar e-mail
                  </a>
                </p>
                <p style="margin:0 0 12px;font-size:13px;line-height:1.5;color:#71717a;">
                  Se o botão não funcionar, copie e cole este endereço no navegador:
                </p>
                <p style="margin:0 0 24px;font-size:13px;line-height:1.5;word-break:break-all;color:#52525b;">${safeUrl}</p>
                <p style="margin:0;font-size:13px;line-height:1.5;color:#71717a;">
                  Se você não criou essa conta, pode ignorar este e-mail.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}
