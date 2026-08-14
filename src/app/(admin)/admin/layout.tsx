import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LogOut, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/features/auth/actions";
import { requireAdmin } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Administração",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-dvh bg-muted/30">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 lg:px-8">
          <Logo />
          <span className="hidden h-5 w-px bg-border sm:block" />
          <span className="hidden items-center gap-1.5 text-sm font-medium text-muted-foreground sm:flex">
            <ShieldCheck className="size-4" aria-hidden />
            Administração
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="ghost" className="rounded-xl">
              <Link href="/dashboard">
                <ArrowLeft className="size-4" aria-hidden />
                <span className="hidden sm:inline">Ir para o aplicativo</span>
                <span className="sm:hidden">Aplicativo</span>
              </Link>
            </Button>
            <form action={signOutAction}>
              <Button type="submit" variant="outline" className="rounded-xl">
                <LogOut className="size-4" aria-hidden />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
