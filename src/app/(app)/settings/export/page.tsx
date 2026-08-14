import { SettingsSubpage } from "@/features/profile/settings-subpage";
import { ExportForm } from "@/features/privacy/privacy-center";

export default function ExportDataPage() {
  return (
    <SettingsSubpage
      title="Exportar meus dados"
      description="Gera um ZIP com perfil, contas, transações e comprovantes."
    >
      <div className="rounded-3xl bg-card p-5 ring-1 ring-border">
        <ExportForm />
      </div>
    </SettingsSubpage>
  );
}
