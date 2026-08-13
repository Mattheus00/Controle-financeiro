import { DEMO_SUBSCRIPTIONS } from "@/features/landing/data";
import { Reveal } from "@/features/landing/reveal";
import { Eyebrow, Section, SectionTitle } from "@/features/landing/ui";

export function SubscriptionsSection() {
  return (
    <Section tone="soft">
      <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <Eyebrow>Assinaturas</Eyebrow>
          <SectionTitle className="mt-3">Pequenos gastos também ficam grandes.</SectionTitle>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            O Folio mostra o impacto real das suas assinaturas ao longo do tempo.
          </p>
          <div className="mt-8 space-y-3">
            {DEMO_SUBSCRIPTIONS.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
                <span className="font-medium">{item.name}</span>
                <span className="tabular-nums">{item.amount}</span>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="rounded-[2rem] bg-brand-dark p-8 text-background md:p-12">
            <p className="text-sm text-background/70">Tudo isso soma</p>
            <p className="mt-3 font-display text-[clamp(2rem,12vw,3.75rem)] tracking-tight tabular-nums">R$ 327,80</p>
            <p className="mt-1 text-lg text-primary">/ mês</p>
            <div className="mt-8 border-t border-background/15 pt-6">
              <p className="text-sm text-background/70">Em um ano</p>
              <p className="mt-2 font-display text-[clamp(1.75rem,10vw,3rem)] tracking-tight tabular-nums">R$ 3.933,60</p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
