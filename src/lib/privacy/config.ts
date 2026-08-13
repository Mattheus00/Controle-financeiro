export const POLICY_VERSION = "2026-08-13";

export const PRIVACY_CONTACT_EMAIL =
  process.env.PRIVACY_CONTACT_EMAIL?.trim() ||
  process.env.DATA_PROTECTION_CONTACT_EMAIL?.trim() ||
  "";

export const DATA_PROTECTION_CONTACT_NAME =
  process.env.DATA_PROTECTION_CONTACT_NAME?.trim() || "";

export const DATA_PROTECTION_CONTACT_EMAIL =
  process.env.DATA_PROTECTION_CONTACT_EMAIL?.trim() ||
  process.env.PRIVACY_CONTACT_EMAIL?.trim() ||
  "";

export const RECEIPT_SIGNED_URL_SECONDS = 120;
export const EXPORT_SIGNED_URL_SECONDS = 15 * 60;
export const EXPORT_TTL_HOURS = 24;

export const RATE_LIMITS = {
  login: { max: 8, windowSeconds: 15 * 60 },
  signup: { max: 5, windowSeconds: 15 * 60 },
  forgotPassword: { max: 5, windowSeconds: 15 * 60 },
  export: { max: 3, windowSeconds: 60 * 60 },
  deleteAccount: { max: 3, windowSeconds: 60 * 60 },
  privacyRequest: { max: 8, windowSeconds: 60 * 60 },
  ocr: { max: 8, windowSeconds: 60 },
} as const;

export const DELETE_ACCOUNT_CONFIRMATION = "EXCLUIR MINHA CONTA";
