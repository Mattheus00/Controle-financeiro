"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/features/auth/actions";

export function AppSidebar({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border/80 bg-sidebar px-4 py-6 lg:flex">
      <Logo />
      <nav className="mt-10 flex flex-1 flex-col gap-1" aria-label="Principal">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
                active && "bg-sidebar-accent text-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="rounded-3xl bg-card p-3 ring-1 ring-border">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{email}</p>
        <form action={signOutAction} className="mt-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="size-4" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
