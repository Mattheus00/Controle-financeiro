import Link from "next/link";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4">
      <section className="w-full max-w-md rounded-3xl bg-card p-7 text-center ring-1 ring-border">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-danger/10 text-danger">
          <ShieldX className="size-5" aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-3xl tracking-tight">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sua conta não possui permissão para acessar esta área.
        </p>
        <Button asChild className="mt-6 h-11 rounded-2xl">
          <Link href="/dashboard">Voltar ao aplicativo</Link>
        </Button>
      </section>
    </main>
  );
}
