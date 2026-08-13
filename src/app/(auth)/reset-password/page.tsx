import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/supabase/auth";
import { ResetPasswordForm } from "./reset-form";

export default async function ResetPasswordPage() {
  const { userId } = await getOptionalUser();
  if (!userId) redirect("/forgot-password");
  return <ResetPasswordForm />;
}
