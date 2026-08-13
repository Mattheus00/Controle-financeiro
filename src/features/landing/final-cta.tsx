import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/features/landing/reveal";
import { Section } from "@/features/landing/ui";

export function FinalCta() {
  return (
    <Section tone="dark" className="md:py-32">
      <Reveal>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-[2.2rem] leading-[1.1] tracking-tight md:text-6xl">
            Seu dinheiro pode ser mais simples de entender.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-background/70 md:text-lg">
            Comece a organizar seus gastos hoje e tenha uma visão clara do que entra, do que sai e do
            que vem pela frente.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild className="h-12 rounded-full px-8 text-base">
              <Link href="/dashboard">Acessar o sistema</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-full border-background/20 bg-transparent px-8 text-base text-background hover:bg-background/10 hover:text-background"
            >
              <Link href="/signup">Criar minha conta</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-background/55">Leva menos de 1 minuto para começar.</p>
        </div>
      </Reveal>
    </Section>
  );
}
