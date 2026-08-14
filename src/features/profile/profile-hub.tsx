import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  ChevronRight,
  Download,
  Lock,
  LogOut,
  PieChart,
  RefreshCw,
  Shield,
  SlidersHorizontal,
  Tag,
  Trash2,
  User,
  Wallet,
} from "lucide-react";
import { signOutAction } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

const FINANCIAL_ITEMS = [
  { href: "/settings/accounts", label: "Contas e cartões", icon: Wallet },
  { href: "/settings/categories", label: "Categorias", icon: Tag },
  { href: "/subscriptions", label: "Assinaturas", icon: RefreshCw },
  { href: "/budgets", label: "Orçamentos", icon: PieChart },
] as const;

const FOLIO_ITEMS = [
  { href: "/settings/preferences", label: "Preferências", icon: SlidersHorizontal },
  { href: "/settings/notifications", label: "Notificações", icon: Bell },
  { href: "/settings/privacy", label: "Privacidade e dados", icon: Shield },
  { href: "/settings/security", label: "Segurança", icon: Lock },
] as const;

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "Você";
}

export function ProfileHub({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const displayName = firstName(name);

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <h1 className="text-center font-display text-3xl tracking-tight">Perfil</h1>

      <Link
        href="/settings/edit"
        className="flex items-center gap-3 rounded-3xl bg-secondary px-4 py-3 ring-1 ring-border/60 transition-colors hover:bg-secondary/80"
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-card text-foreground ring-1 ring-border">
          <User className="size-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-xl tracking-tight">{displayName}</span>
          <span className="block truncate text-sm text-muted-foreground">{email || "Seu e-mail"}</span>
        </span>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      </Link>

      <ProfileSection title="Financeiro" items={FINANCIAL_ITEMS} />
      <ProfileSection title="Folio" items={FOLIO_ITEMS} />

      <section className="space-y-1.5" aria-labelledby="profile-account-heading">
        <h2 id="profile-account-heading" className="px-1 text-sm font-medium text-muted-foreground">
          Conta
        </h2>
        <div className="divide-y divide-border overflow-hidden rounded-3xl bg-card ring-1 ring-border">
          <ProfileRow href="/settings/export" label="Exportar meus dados" icon={Download} />
          <ProfileRow
            href="/settings/delete"
            label="Excluir minha conta"
            icon={Trash2}
            tone="danger"
          />
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60"
            >
              <RowIcon icon={LogOut} />
              <span className="min-w-0 flex-1 text-sm font-medium">Sair</span>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

function ProfileSection({
  title,
  items,
}: {
  title: string;
  items: readonly { href: string; label: string; icon: LucideIcon }[];
}) {
  const headingId = `profile-${title.toLowerCase()}-heading`;
  return (
    <section className="space-y-1.5" aria-labelledby={headingId}>
      <h2 id={headingId} className="px-1 text-sm font-medium text-muted-foreground">
        {title}
      </h2>
      <div className="divide-y divide-border overflow-hidden rounded-3xl bg-card ring-1 ring-border">
        {items.map((item) => (
          <ProfileRow key={item.href} {...item} />
        ))}
      </div>
    </section>
  );
}

function ProfileRow({
  href,
  label,
  icon,
  tone = "default",
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  tone?: "default" | "danger";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60",
        tone === "danger" && "text-danger",
      )}
    >
      <RowIcon icon={icon} tone={tone} />
      <span className="min-w-0 flex-1 text-sm font-medium">{label}</span>
      <ChevronRight
        className={cn("size-5 shrink-0 text-muted-foreground", tone === "danger" && "text-danger/70")}
        aria-hidden
      />
    </Link>
  );
}

function RowIcon({
  icon: Icon,
  tone = "default",
}: {
  icon: LucideIcon;
  tone?: "default" | "danger";
}) {
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full",
        tone === "danger" ? "bg-danger/10 text-danger" : "bg-secondary text-foreground",
      )}
    >
      <Icon className="size-4" aria-hidden />
    </span>
  );
}
