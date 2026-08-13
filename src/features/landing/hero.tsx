import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_MICROCOPY, APP_SLOGAN } from "@/lib/config";
import { ProductPreview } from "@/features/landing/product-preview";
import { Reveal } from "@/features/landing/reveal";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-10 md:px-6 md:pb-24 md:pt-16">
      <div className="pointer-events-none absolute -right-24 top-0 size-[28rem] rounded-full bg-brand-soft blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-10 size-72 rounded-full bg-primary/30 blur-3xl" />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <Reveal>
          <p className="text-sm font-medium text-muted-foreground">Controle financeiro pessoal</p>
          <h1 className="mt-4 font-display text-[2rem] leading-[1.1] tracking-tight sm:text-[2.35rem] md:text-5xl lg:text-[4rem]">
            Entenda para onde seu dinheiro está indo.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            Controle gastos, contas, cartões, assinaturas e metas sem depender de planilhas. O Folio
            organiza sua vida financeira de forma simples e visual.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild className="h-12 rounded-full px-6 text-base">
              <Link href="/dashboard">Acessar o sistema</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-full px-6 text-base">
              <Link href="/signup">Começar grátis</Link>
            </Button>
            <Button asChild variant="ghost" className="h-12 rounded-full px-6 text-base">
              <a href="/#como-funciona">Ver como funciona</a>
            </Button>
          </div>
          <p className="mt-5 text-sm text-muted-foreground">{APP_SLOGAN}</p>
          <p className="mt-1 text-sm text-muted-foreground">{APP_MICROCOPY}</p>
        </Reveal>
        <Reveal delay={0.08} className="lg:justify-self-end">
          <ProductPreview compact />
        </Reveal>
      </div>
    </section>
  );
}
