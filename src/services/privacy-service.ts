import { createHash } from "crypto";
import { fail, ok, Errors, type ActionResult } from "@/lib/errors";
import {
  EXPORT_SIGNED_URL_SECONDS,
  EXPORT_TTL_HOURS,
  POLICY_VERSION,
  RECEIPT_SIGNED_URL_SECONDS,
} from "@/lib/privacy/config";
import { writeAuditEvent } from "@/lib/privacy/audit";
import { toCsv, toJsonFile } from "@/lib/privacy/csv";
import { createZip, textFile, type ZipEntry } from "@/lib/privacy/zip";
import { logError } from "@/lib/privacy/sanitize-log";
import { privacyRequestSchema } from "@/validations/privacy";
import type { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

const USER_TABLES = [
  "transactions",
  "transaction_installments",
  "bills",
  "recurring_transactions",
  "receipt_scans",
  "attachments",
] as const;

export const privacyService = {
  async createSignedReceiptUrl(supabase: Client, userId: string, storagePath: string) {
    if (!storagePath.startsWith(`${userId}/`)) {
      return Errors.FORBIDDEN;
    }
    const { data, error } = await supabase.storage
      .from("receipts")
      .createSignedUrl(storagePath, RECEIPT_SIGNED_URL_SECONDS);
    if (error || !data?.signedUrl) {
      return fail("SIGNED_URL_FAILED", "Não foi possível abrir o comprovante.");
    }
    return ok({ url: data.signedUrl, expiresIn: RECEIPT_SIGNED_URL_SECONDS });
  },

  async exportOwnData(supabase: Client, userId: string, email: string | null) {
    await supabase.rpc("purge_expired_exports");

    const { data: job, error: jobError } = await supabase
      .from("data_export_jobs")
      .insert({ user_id: userId, status: "PROCESSING" })
      .select("id")
      .single();

    if (jobError || !job) {
      return fail("EXPORT_FAILED", "Não foi possível iniciar a exportação.");
    }

    try {
      const zip = await buildExportZip(supabase, userId, email);
      const storagePath = `${userId}/${job.id}.zip`;
      const { error: uploadError } = await supabase.storage
        .from("privacy-exports")
        .upload(storagePath, zip, {
          contentType: "application/zip",
          upsert: false,
        });
      if (uploadError) throw uploadError;

      const expiresAt = new Date(Date.now() + EXPORT_TTL_HOURS * 60 * 60 * 1000).toISOString();
      await supabase
        .from("data_export_jobs")
        .update({
          status: "READY",
          storage_path: storagePath,
          completed_at: new Date().toISOString(),
          expires_at: expiresAt,
        })
        .eq("id", job.id)
        .eq("user_id", userId);

      const { data: signed, error: signedError } = await supabase.storage
        .from("privacy-exports")
        .createSignedUrl(storagePath, EXPORT_SIGNED_URL_SECONDS);

      if (signedError || !signed?.signedUrl) {
        return fail("EXPORT_FAILED", "A exportação foi gerada, mas o link temporário falhou.");
      }

      await writeAuditEvent(supabase, "ACCOUNT_EXPORT_REQUESTED", { job_id: job.id });
      return ok({
        url: signed.signedUrl,
        expiresIn: EXPORT_SIGNED_URL_SECONDS,
        expiresAt,
      });
    } catch (error) {
      logError("privacy.export", error);
      await supabase
        .from("data_export_jobs")
        .update({ status: "FAILED", error_code: "EXPORT_FAILED" })
        .eq("id", job.id)
        .eq("user_id", userId);
      return fail("EXPORT_FAILED", "Não foi possível gerar o arquivo com seus dados.");
    }
  },

  async deleteReceipts(supabase: Client, userId: string) {
    const { data: attachments } = await supabase
      .from("attachments")
      .select("id, storage_path")
      .eq("user_id", userId);
    const { data: scans } = await supabase
      .from("receipt_scans")
      .select("id, storage_path")
      .eq("user_id", userId);

    const paths = [
      ...(attachments ?? []).map((row) => row.storage_path),
      ...(scans ?? []).map((row) => row.storage_path),
    ].filter((path) => path.startsWith(`${userId}/`));

    if (paths.length) {
      await supabase.storage.from("receipts").remove(paths);
    }
    await supabase.from("attachments").delete().eq("user_id", userId);
    await supabase.from("receipt_scans").delete().eq("user_id", userId);
    await writeAuditEvent(supabase, "RECEIPTS_DELETED", { files: paths.length });
    return ok({ deleted: paths.length });
  },

  async deleteHistory(supabase: Client, userId: string) {
    await privacyService.deleteReceipts(supabase, userId);
    for (const table of USER_TABLES) {
      const { error } = await supabase.from(table).delete().eq("user_id", userId);
      if (error) logError(`privacy.delete.${table}`, error.message);
    }
    await writeAuditEvent(supabase, "HISTORY_DELETED", { scope: "financial_history" });
    return ok({ deleted: true });
  },

  async deleteAccount(supabase: Client, userId: string) {
    await writeAuditEvent(supabase, "ACCOUNT_DELETION_REQUESTED", {});
    await supabase.from("privacy_requests").insert({
      user_id: userId,
      type: "DELETION",
      status: "OPEN",
      message: "Solicitação de exclusão da conta pelo centro de privacidade.",
    });
    const { error } = await supabase.rpc("delete_own_account");
    if (error) {
      logError("privacy.deleteAccount", error.message);
      return fail("DELETE_FAILED", "Não foi possível excluir a conta. Tente novamente.");
    }
    return ok({ deleted: true });
  },

  async createPrivacyRequest(supabase: Client, userId: string, input: PrivacyRequestInput) {
    const { data, error } = await supabase
      .from("privacy_requests")
      .insert({
        user_id: userId,
        type: input.type,
        status: "OPEN",
        message: input.message,
      })
      .select("id, type, status, created_at, message")
      .single();
    if (error || !data) {
      return fail("PRIVACY_REQUEST_FAILED", "Não foi possível registrar a solicitação.");
    }
    await writeAuditEvent(supabase, "PRIVACY_REQUEST_CREATED", { type: input.type });
    return ok(data);
  },

  async listPrivacyRequests(supabase: Client, userId: string) {
    const { data, error } = await supabase
      .from("privacy_requests")
      .select("id, type, status, created_at, completed_at, message")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) return fail("PRIVACY_REQUEST_LIST_FAILED", "Não foi possível carregar as solicitações.");
    return ok(data ?? []);
  },

  async listConsents(supabase: Client, userId: string) {
    const { data, error } = await supabase
      .from("user_consents")
      .select("id, consent_type, policy_version, granted, granted_at, revoked_at, source")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) return fail("CONSENT_LIST_FAILED", "Não foi possível carregar as preferências.");
    return ok(data ?? []);
  },

  async setMarketingConsent(supabase: Client, userId: string, granted: boolean) {
    const { data: existing } = await supabase
      .from("user_consents")
      .select("id")
      .eq("user_id", userId)
      .eq("consent_type", "marketing_email")
      .is("revoked_at", null)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("user_consents")
        .update({
          granted,
          granted_at: granted ? new Date().toISOString() : null,
          revoked_at: granted ? null : new Date().toISOString(),
        })
        .eq("id", existing.id)
        .eq("user_id", userId);
    } else {
      await supabase.from("user_consents").insert({
        user_id: userId,
        consent_type: "marketing_email",
        policy_version: POLICY_VERSION,
        granted,
        granted_at: granted ? new Date().toISOString() : null,
        revoked_at: granted ? null : new Date().toISOString(),
        source: "privacy_center",
      });
    }
    await writeAuditEvent(supabase, "PRIVACY_SETTING_CHANGED", {
      consent_type: "marketing_email",
      granted,
    });
    return ok({ granted });
  },
};

async function buildExportZip(supabase: Client, userId: string, email: string | null) {
  const [
    profile,
    preferences,
    accounts,
    cards,
    categories,
    transactions,
    bills,
    subscriptions,
    budgets,
    goals,
    contributions,
    recurring,
    consents,
    attachments,
  ] = await Promise.all([
    supabase.from("profiles").select("name, currency, timezone, created_at").eq("user_id", userId),
    supabase.from("user_preferences").select("theme, locale, week_starts_on").eq("user_id", userId),
    supabase.from("accounts").select("name, type, initial_balance_cents, is_archived, created_at").eq("user_id", userId),
    supabase.from("credit_cards").select("name, brand, last_four, limit_cents, closing_day, due_day, is_active").eq("user_id", userId),
    supabase.from("categories").select("name, slug, type").eq("user_id", userId),
    supabase.from("transactions").select("type, description, amount_cents, date, merchant, payment_method, notes").eq("user_id", userId),
    supabase.from("bills").select("name, amount_cents, due_date, status").eq("user_id", userId),
    supabase.from("subscriptions").select("name, amount_cents, billing_day, merchant, is_active").eq("user_id", userId),
    supabase.from("budgets").select("amount_cents, month, category_id").eq("user_id", userId),
    supabase.from("financial_goals").select("name, target_cents, current_cents, deadline").eq("user_id", userId),
    supabase.from("financial_goal_contributions").select("amount_cents, contributed_at, notes").eq("user_id", userId),
    supabase.from("recurring_transactions").select("type, description, amount_cents, frequency, start_date, is_active").eq("user_id", userId),
    supabase.from("user_consents").select("consent_type, policy_version, granted, granted_at, revoked_at").eq("user_id", userId),
    supabase.from("attachments").select("storage_path, mime_type, original_name").eq("user_id", userId),
  ]);

  const fingerprint = createHash("sha256").update(userId).digest("hex").slice(0, 12);
  const entries: ZipEntry[] = [
    textFile(
      "manifest.json",
      toJsonFile({
        product: "Folio",
        policy_version: POLICY_VERSION,
        exported_at: new Date().toISOString(),
        account_fingerprint: fingerprint,
        email: email ?? null,
      }),
    ),
    textFile("profile.json", toJsonFile(profile.data ?? [])),
    textFile("preferences.json", toJsonFile(preferences.data ?? [])),
    textFile("accounts.json", toJsonFile(accounts.data ?? [])),
    textFile("credit_cards.json", toJsonFile(cards.data ?? [])),
    textFile("categories.json", toJsonFile(categories.data ?? [])),
    textFile("consents.json", toJsonFile(consents.data ?? [])),
    textFile("transactions.csv", toCsv((transactions.data ?? []) as Array<Record<string, unknown>>)),
    textFile("bills.csv", toCsv((bills.data ?? []) as Array<Record<string, unknown>>)),
    textFile("subscriptions.csv", toCsv((subscriptions.data ?? []) as Array<Record<string, unknown>>)),
    textFile("budgets.csv", toCsv((budgets.data ?? []) as Array<Record<string, unknown>>)),
    textFile("goals.csv", toCsv((goals.data ?? []) as Array<Record<string, unknown>>)),
    textFile("goal_contributions.csv", toCsv((contributions.data ?? []) as Array<Record<string, unknown>>)),
    textFile("recurring.csv", toCsv((recurring.data ?? []) as Array<Record<string, unknown>>)),
  ];

  for (const file of attachments.data ?? []) {
    if (!file.storage_path.startsWith(`${userId}/`)) continue;
    const { data } = await supabase.storage.from("receipts").download(file.storage_path);
    if (!data) continue;
    const buffer = new Uint8Array(await data.arrayBuffer());
    const filename = file.storage_path.split("/").pop() ?? "comprovante";
    entries.push({ name: `attachments/${filename}`, data: buffer });
  }

  return createZip(entries);
}

type PrivacyRequestInput = z.infer<typeof privacyRequestSchema>;
