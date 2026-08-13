import { DEMO_BUDGETS } from "@/features/landing/data";
import { ProgressLine } from "@/features/landing/mock-ui";
import { Reveal } from "@/features/landing/reveal";
import { Eyebrow, Lead, Section, SectionTitle } from "@/features/landing/ui";

export function BudgetSection() {
  return (
    <Section>
      <Reveal>
        <Eyebrow>Orçamento</Eyebrow>
        <SectionTitle className="mt-3 max-w-3xl">
          Defina limites sem transformar sua vida em uma planilha.
        </SectionTitle>
        <Lead className="mt-4">Um número. Uma barra. Você sabe onde está.</Lead>
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {DEMO_BUDGETS.map((item, index) => (
          <Reveal key={item.name} delay={index * 0.05}>
            <article className="rounded-[1.75rem] bg-card p-5 ring-1 ring-border">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-medium">{item.name}</h3>
                <span className="text-sm text-muted-foreground">{item.percent}%</span>
              </div>
              <p className="mt-3 font-display text-3xl tracking-tight">
                {item.spent}
                <span className="ml-1 text-base text-muted-foreground">/ {item.limit}</span>
              </p>
              <ProgressLine percent={item.percent} className="mt-4 h-2.5" />
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
