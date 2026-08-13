"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, UserRound, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuickAdd } from "@/features/transactions/quick-add";

const ITEMS = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/transactions", label: "Gastos", icon: Receipt },
  { href: "/bills", label: "Contas", icon: Wallet },
  { href: "/settings", label: "Perfil", icon: UserRound },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
      <nav
        className="border-t border-border bg-background/95 pb-safe backdrop-blur"
        aria-label="Navegação inferior"
      >
        <div className="grid grid-cols-5 items-end px-2 pt-2">
          {ITEMS.slice(0, 2).map((item) => (
            <MobileLink key={item.href} {...item} active={pathname.startsWith(item.href)} />
          ))}
          <div className="h-14" />
          {ITEMS.slice(2).map((item) => (
            <MobileLink key={item.href} {...item} active={pathname.startsWith(item.href)} />
          ))}
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
        "flex flex-col items-center gap-1 pb-2 text-[11px] font-medium text-muted-foreground",
        active && "text-foreground",
      )}
    >
      <Icon className="size-5" />
      {label}
    </Link>
  );
}
