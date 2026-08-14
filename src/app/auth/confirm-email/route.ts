import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token")?.trim() ?? "";

  if (!token) {
    return NextResponse.redirect(`${origin}/login?error=confirm`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("confirm_email_with_token", { p_token: token });

  if (error || data !== true) {
    return NextResponse.redirect(`${origin}/login?error=confirm`);
  }

  return NextResponse.redirect(`${origin}/login?confirmed=1`);
}
