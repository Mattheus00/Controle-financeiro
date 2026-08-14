import { requireUser } from "@/lib/supabase/auth";
import { profileService } from "@/services/catalog-service";
import { Field } from "@/components/ui-kit";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateProfileAction } from "@/features/finance/actions";
import { SettingsSubpage } from "@/features/profile/settings-subpage";
import { asFormAction } from "@/types";

export default async function EditProfilePage() {
  const { supabase, userId } = await requireUser();
  const profile = await profileService.get(supabase, userId);
  const name = profile.success ? profile.data.profile?.name ?? "" : "";
  const timezone = profile.success ? profile.data.profile?.timezone ?? "America/Sao_Paulo" : "America/Sao_Paulo";

  return (
    <SettingsSubpage title="Seu perfil" description="Nome e como o Folio te chama por aqui.">
      <form action={asFormAction(updateProfileAction)} className="grid gap-3 rounded-3xl bg-card p-5 ring-1 ring-border">
        <Field label="Nome" htmlFor="name">
          <Input id="name" name="name" defaultValue={name} required className="h-11" />
        </Field>
        <input type="hidden" name="timezone" value={timezone} />
        <input type="hidden" name="currency" value="BRL" />
        <Button type="submit" className="h-11 rounded-2xl">
          Salvar perfil
        </Button>
      </form>
    </SettingsSubpage>
  );
}
