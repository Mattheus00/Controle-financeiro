"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, User, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuickAdd } from "@/features/transactions/quick-add";

const PRIMARY = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/transactions", label: "Gastos", icon: Receipt },
  { href: "/bills", label: "Contas", icon: Wallet },
  { href: "/settings", label: "Perfil", icon: User },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
      <nav
        className="border-t border-border bg-background/95 pb-[max(0.4rem,env(safe-area-inset-bottom))] backdrop-blur"
        aria-label="Navegação inferior"
      >
        <div className="grid grid-cols-5 items-stretch px-1 pt-1">
          {PRIMARY.slice(0, 2).map((item) => (
            <MobileLink key={item.href} {...item} active={pathname.startsWith(item.href)} />
          ))}
          <div className="min-h-12" />
          <MobileLink
            href="/bills"
            label="Contas"
            icon={Wallet}
            active={pathname.startsWith("/bills")}
          />
          <MobileLink
            href="/settings"
            label="Perfil"
            icon={User}
            active={pathname.startsWith("/settings")}
          />
        </div>
      </nav>
      <div className="pointer-events-none absolute inset-x-0 -top-7 flex justify-center">
        <div className="pointer-events-auto">
          <QuickAdd />
        </div>
      </div>
    </div>
  );
}

function MobileLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex min-h-12 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium text-muted-foreground",
        active && "text-foreground",
      )}
    >
      <Icon className="size-5" />
      {label}
    </Link>
  );
}
