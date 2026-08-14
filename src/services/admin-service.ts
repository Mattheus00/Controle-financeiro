import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

const metricsSchema = z.object({
  total_clients: z.number().int().nonnegative(),
  active_session_clients: z.number().int().nonnegative(),
  open_requests: z.number().int().nonnegative(),
  processing_requests: z.number().int().nonnegative(),
});

const requestSchema = z.object({
  request_id: z.string().uuid(),
  customer_name: z.string(),
  request_type: z.string(),
  request_status: z.enum(["OPEN", "PROCESSING", "COMPLETED", "REJECTED"]),
  request_message: z.string().nullable(),
  request_created_at: z.string(),
  assigned_to_current_admin: z.boolean(),
  response_message: z.string().nullable(),
  response_resolution: z.enum(["COMPLETED", "REJECTED"]).nullable(),
  delivery_status: z.enum(["NOT_SENT", "PENDING", "SENT", "FAILED"]),
  delivery_error_code: z.string().nullable(),
  response_sent_at: z.string().nullable(),
});

const preparedResponseSchema = z.union([
  z.object({ already_sent: z.literal(true) }),
  z.object({
    already_sent: z.literal(false),
    recipient_email: z.string().email(),
    response: z.string(),
    resolution: z.enum(["COMPLETED", "REJECTED"]),
  }),
]);

export type AdminMetrics = z.infer<typeof metricsSchema>;
export type AdminPrivacyRequest = z.infer<typeof requestSchema>;
export type PreparedPrivacyResponse = z.infer<typeof preparedResponseSchema>;

export const adminService = {
  async getDashboard(supabase: Client) {
    const [metricsResult, requestsResult] = await Promise.all([
      supabase.rpc("admin_dashboard_metrics"),
      supabase.rpc("admin_list_privacy_requests", { p_status: null }),
    ]);

    if (metricsResult.error) throw new Error(metricsResult.error.message);
    if (requestsResult.error) throw new Error(requestsResult.error.message);

    return {
      metrics: metricsSchema.parse(metricsResult.data),
      requests: z.array(requestSchema).parse(requestsResult.data ?? []),
    };
  },

  async startRequest(supabase: Client, requestId: string) {
    const { data, error } = await supabase.rpc("admin_start_privacy_request", {
      p_request_id: requestId,
    });
    if (error) throw new Error(error.message);
    return data;
  },

  async prepareResponse(
    supabase: Client,
    input: { requestId: string; resolution: "COMPLETED" | "REJECTED"; response: string },
  ): Promise<PreparedPrivacyResponse> {
    const { data, error } = await supabase.rpc("admin_prepare_privacy_response", {
      p_request_id: input.requestId,
      p_resolution: input.resolution,
      p_response: input.response,
    });
    if (error) throw new Error(error.message);
    return preparedResponseSchema.parse(data);
  },

  async finishResponse(supabase: Client, requestId: string, sent: boolean, errorCode?: string) {
    const { data, error } = await supabase.rpc("admin_finish_privacy_response", {
      p_request_id: requestId,
      p_sent: sent,
      p_error_code: errorCode ?? null,
    });
    if (error) throw new Error(error.message);
    return data;
  },
};
