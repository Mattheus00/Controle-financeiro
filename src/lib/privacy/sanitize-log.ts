const SENSITIVE_KEY =
  /^(password|passwd|pwd|token|access_token|refresh_token|id_token|jwt|authorization|api[_-]?key|secret|service[_-]?role|cookie|set-cookie|cvv|cvc|pan|card_number|cardnumber|credit_card|pin|otp|extracted|buffer|file_data|image|raw)$/i;

const REDACTED = "[redacted]";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date);
}

export function sanitizeLog(value: unknown, depth = 0): unknown {
  if (depth > 6) return "[truncated]";
  if (value == null) return value;
  if (typeof value === "string") {
    if (value.length > 500) return `${value.slice(0, 80)}…[truncated]`;
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (value instanceof Error) {
    return { name: value.name, message: value.message };
  }
  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => sanitizeLog(item, depth + 1));
  }
  if (isPlainObject(value)) {
    const output: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      output[key] = SENSITIVE_KEY.test(key) ? REDACTED : sanitizeLog(nested, depth + 1);
    }
    return output;
  }
  return String(value);
}

export function logError(scope: string, error: unknown) {
  console.error(scope, sanitizeLog(error));
}
