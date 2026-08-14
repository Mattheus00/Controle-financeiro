import { requireUser } from "@/lib/supabase/auth";
import { profileService } from "@/services/catalog-service";
import { Field } from "@/components/ui-kit";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateProfileAction } from "@/features/finance/actions";
import { SettingsSubpage } from "@/features/profile/settings-subpage";
import { asFormAction } from "@/types";

export default async function PreferencesPage() {
  const { supabase, userId } = await requireUser();
  const profile = await profileService.get(supabase, userId);
  const name = profile.success ? profile.data.profile?.name ?? "Você" : "Você";
  const timezone = profile.success ? profile.data.profile?.timezone ?? "America/Sao_Paulo" : "America/Sao_Paulo";

  return (
    <SettingsSubpage title="Preferências" description="Fuso horário e moeda da sua conta.">
      <form action={asFormAction(updateProfileAction)} className="grid gap-3 rounded-3xl bg-card p-5 ring-1 ring-border">
        <input type="hidden" name="name" value={name} />
        <Field label="Fuso" htmlFor="timezone">
          <Input id="timezone" name="timezone" defaultValue={timezone} className="h-11" />
        </Field>
        <Field label="Moeda" htmlFor="currency">
          <Input id="currency" name="currency" defaultValue="BRL" readOnly className="h-11" />
        </Field>
        <Button type="submit" className="h-11 rounded-2xl">
          Salvar preferências
        </Button>
      </form>
    </SettingsSubpage>
  );
}
