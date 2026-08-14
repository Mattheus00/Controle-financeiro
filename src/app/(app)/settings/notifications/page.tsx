import { SettingsSubpage } from "@/features/profile/settings-subpage";

export default function NotificationsPage() {
  return (
    <SettingsSubpage
      title="Notificações"
      description="Ainda não enviamos push nem e-mail de alerta. Quando isso existir, o controle fica aqui — desligado por padrão."
    >
      <div className="rounded-3xl bg-card p-5 ring-1 ring-border">
        <p className="text-sm text-muted-foreground">
          O Folio não dispara lembretes, cobranças nem marketing por enquanto. Nada para ligar ou
          desligar hoje.
        </p>
      </div>
    </SettingsSubpage>
  );
}
