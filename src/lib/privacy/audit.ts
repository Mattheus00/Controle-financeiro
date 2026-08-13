import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import { logError } from "@/lib/privacy/sanitize-log";

type Client = SupabaseClient<Database>;

export type AuditEventType =
  | "ACCOUNT_EXPORT_REQUESTED"
  | "ACCOUNT_DELETION_REQUESTED"
  | "ACCOUNT_DELETED"
  | "EMAIL_CHANGED"
  | "PASSWORD_CHANGED"
  | "PRIVACY_SETTING_CHANGED"
  | "PRIVACY_REQUEST_CREATED"
  | "RECEIPTS_DELETED"
  | "HISTORY_DELETED";

export async function writeAuditEvent(
  supabase: Client,
  eventType: AuditEventType,
  metadata: Record<string, Json | undefined> = {},
) {
  const { error } = await supabase.rpc("write_audit_event", {
    p_event_type: eventType,
    p_metadata: metadata,
  });
  if (error) logError("audit.write", error.message);
}
