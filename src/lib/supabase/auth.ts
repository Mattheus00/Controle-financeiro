import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { forbidden, redirect } from "next/navigation";

export async function requireUser(): Promise<{
  supabase: SupabaseClient<Database>;
  userId: string;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || !userId) {
    redirect("/login");
  }

  return { supabase, userId };
}

export async function getOptionalUser() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return { supabase: null, userId: null };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return { supabase, userId: data?.claims?.sub ?? null };
}

export async function getAdminContext() {
  const context = await requireUser();
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();

  return {
    ...context,
    isAdmin: !error && data?.role === "admin",
  };
}

export async function requireAdmin() {
  const context = await getAdminContext();
  if (!context.isAdmin) forbidden();
  return context;
}
