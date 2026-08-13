import { Reveal } from "@/features/landing/reveal";
import { Eyebrow, Lead, Section, SectionTitle } from "@/features/landing/ui";

const ROWS = [
  { label: "Saldo atual", value: "R$ 5.200", tone: "neutral" },
  { label: "Receitas previstas", value: "+ R$ 7.500", tone: "up" },
  { label: "Contas previstas", value: "− R$ 4.850", tone: "down" },
] as const;

export function ForecastSection() {
  return (
    <Section tone="soft">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <Reveal>
          <Eyebrow>Previsão</Eyebrow>
          <SectionTitle className="mt-3">Não veja apenas quanto você tem. Veja quanto vai sobrar.</SectionTitle>
          <Lead className="mt-4">Entenda hoje para decidir melhor amanhã.</Lead>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="rounded-[2rem] bg-card p-6 ring-1 ring-border md:p-8">
            <ul className="space-y-4">
              {ROWS.map((row) => (
                <li key={row.label} className="flex items-baseline justify-between border-b border-border pb-4">
                  <span className="text-sm text-muted-foreground">{row.label}</span>
                  <span
                    className={
                      row.tone === "up"
                        ? "font-medium text-success"
                        : row.tone === "down"
                          ? "font-medium text-danger"
                          : "font-display text-2xl tracking-tight"
                    }
                  >
                    {row.value}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-[1.5rem] bg-primary px-5 py-6">
              <p className="text-sm font-medium">Saldo projetado</p>
              <p className="mt-1 font-display text-5xl tracking-tight md:text-6xl">R$ 7.850</p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
