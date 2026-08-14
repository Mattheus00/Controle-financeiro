import { SettingsSubpage } from "@/features/profile/settings-subpage";
import { DeleteAccountForm } from "@/features/privacy/privacy-center";

export default function DeleteAccountPage() {
  return (
    <SettingsSubpage
      title="Excluir minha conta"
      description="Remove perfil, transações, cartões, metas, comprovantes e arquivos. Não dá para desfazer."
    >
      <DeleteAccountForm />
    </SettingsSubpage>
  );
}
