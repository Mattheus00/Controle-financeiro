import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/supabase/auth";

export default async function HomePage() {
  const { userId } = await getOptionalUser();
  redirect(userId ? "/dashboard" : "/login");
}
