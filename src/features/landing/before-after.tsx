import { Check, Minus } from "lucide-react";
import { Reveal } from "@/features/landing/reveal";
import { Eyebrow, Section, SectionTitle } from "@/features/landing/ui";

const BEFORE = [
  "Planilhas",
  "Anotações",
  "Comprovantes perdidos",
  "Gastos esquecidos",
  "Contas chegando de surpresa",
];

const AFTER = [
  "Tudo organizado",
  "Visão do mês",
  "Próximos pagamentos",
  "Gastos categorizados",
  "Metas visíveis",
];

export function BeforeAfter() {
  return (
    <Section>
      <Reveal>
        <Eyebrow>Antes e depois</Eyebrow>
        <SectionTitle className="mt-3">A mesma vida financeira. Outra forma de ver.</SectionTitle>
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <Reveal>
          <div className="rounded-[2rem] bg-secondary/70 p-6 md:p-8">
            <p className="text-sm font-medium text-muted-foreground">Antes do Folio</p>
            <ul className="mt-6 space-y-4">
              {BEFORE.map((item) => (
                <li key={item} className="flex items-center gap-3 text-muted-foreground">
                  <Minus className="size-4 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="rounded-[2rem] bg-primary p-6 md:p-8">
            <p className="text-sm font-medium">Com o Folio</p>
            <ul className="mt-6 space-y-4">
              {AFTER.map((item) => (
                <li key={item} className="flex items-center gap-3 font-medium">
                  <span className="grid size-6 place-items-center rounded-full bg-brand-dark text-primary">
                    <Check className="size-3.5" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
