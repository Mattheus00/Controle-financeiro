import { requireUser } from "@/lib/supabase/auth";
import { SettingsSubpage } from "@/features/profile/settings-subpage";
import { SecurityForm } from "@/features/profile/security-form";

export default async function SecurityPage() {
  const { supabase } = await requireUser();
  const { data } = await supabase.auth.getUser();

  return (
    <SettingsSubpage title="Segurança" description="Senha da conta e acesso.">
      <SecurityForm email={data.user?.email ?? ""} />
    </SettingsSubpage>
  );
}
