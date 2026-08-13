export type ActionError = {
  code: string;
  message: string;
};

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: ActionError };

export function ok<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

export function fail(code: string, message: string): ActionResult<never> {
  return { success: false, error: { code, message } };
}

export const Errors = {
  UNAUTHENTICATED: fail("UNAUTHENTICATED", "Entre para continuar."),
  VALIDATION: fail("VALIDATION_ERROR", "Revise os dados informados."),
  NOT_FOUND: fail("NOT_FOUND", "Registro não encontrado."),
  FORBIDDEN: fail("FORBIDDEN", "Você não pode acessar este recurso."),
  RATE_LIMIT: fail(
    "RATE_LIMIT",
    "Muitas tentativas em pouco tempo. Espere um instante e tente de novo.",
  ),
  UPLOAD_INVALID: fail(
    "UPLOAD_INVALID",
    "Arquivo inválido. Use JPEG, PNG, WEBP ou PDF de até 10 MB.",
  ),
  OCR_UNAVAILABLE: fail(
    "OCR_UNAVAILABLE",
    "Não foi possível ler o comprovante agora. Você ainda pode preencher os dados na mão.",
  ),
  GENERIC: fail("UNEXPECTED", "Algo deu errado. Tente novamente."),
} as const;

export function toUserError(error: unknown, fallback = Errors.GENERIC): ActionResult<never> {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
  ) {
    return fail(String(error.code), String(error.message));
  }
  return fallback;
}
