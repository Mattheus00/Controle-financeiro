import { DEMO_TRANSACTIONS } from "@/features/landing/data";
import { BarChart, MockFrame, ProgressLine, Sparkline, StatCard, TxRow } from "@/features/landing/mock-ui";
import { Reveal } from "@/features/landing/reveal";
import { Eyebrow, Lead, Section, SectionTitle } from "@/features/landing/ui";

const CATEGORIES = [
  { name: "Alimentação", percent: 32 },
  { name: "Moradia", percent: 28 },
  { name: "Transporte", percent: 18 },
  { name: "Assinaturas", percent: 12 },
];

export function DashboardShowcase() {
  return (
    <Section>
      <Reveal>
        <Eyebrow>Dashboard</Eyebrow>
        <SectionTitle className="mt-3">Seu mês inteiro em poucos segundos.</SectionTitle>
        <Lead className="mt-4">Menos números espalhados. Mais clareza para decidir.</Lead>
      </Reveal>
      <Reveal delay={0.06} className="mt-10">
        <MockFrame title="Seu mês">
          <div className="grid gap-4 p-4 md:grid-cols-2 md:p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Saldo atual" value="R$ 8.420,32" hint="+8,4% este mês" hintTone="up" />
                <StatCard label="Entradas" value="R$ 9.200,00" />
                <StatCard label="Gastos" value="R$ 4.280,32" />
                <StatCard label="Contas futuras" value="R$ 1.890,20" />
              </div>
              <div className="rounded-3xl bg-secondary/80 p-4">
                <p className="text-xs font-medium text-muted-foreground">Entradas × saídas</p>
                <Sparkline className="mt-2" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl bg-card p-4 ring-1 ring-border">
                <p className="text-xs font-medium text-muted-foreground">Categorias</p>
                <div className="mt-4 space-y-3">
                  {CATEGORIES.map((item) => (
                    <div key={item.name}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>{item.name}</span>
                        <span className="text-muted-foreground">{item.percent}%</span>
                      </div>
                      <ProgressLine percent={item.percent} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl bg-card p-4 ring-1 ring-border">
                <p className="text-xs font-medium text-muted-foreground">Previsão dos próximos dias</p>
                <BarChart className="mt-4" />
              </div>
              <div className="space-y-3">
                {DEMO_TRANSACTIONS.slice(0, 3).map((item) => (
                  <TxRow key={item.name} {...item} />
                ))}
              </div>
            </div>
          </div>
        </MockFrame>
      </Reveal>
    </Section>
  );
}
