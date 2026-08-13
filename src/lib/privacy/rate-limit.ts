import { createHash } from "crypto";
import { Errors, type ActionResult } from "@/lib/errors";
import { RATE_LIMITS } from "@/lib/privacy/config";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export function rateLimitKey(scope: string, identifier: string) {
  const digest = createHash("sha256").update(`${scope}:${identifier.toLowerCase()}`).digest("hex");
  return `${scope}:${digest.slice(0, 40)}`;
}

export async function enforceRateLimit(
  supabase: Client,
  scope: keyof typeof RATE_LIMITS,
  identifier: string,
): Promise<ActionResult<never> | null> {
  const config = RATE_LIMITS[scope];
  const key = rateLimitKey(scope, identifier);
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_key: key,
    p_max: config.max,
    p_window_seconds: config.windowSeconds,
  });

  if (error) return null;
  if (data === false) return Errors.RATE_LIMIT;
  return null;
}
