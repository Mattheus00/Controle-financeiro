import { Reveal } from "@/features/landing/reveal";
import { Eyebrow, Section, SectionTitle } from "@/features/landing/ui";

const INSIGHTS = [
  "Seus gastos com restaurantes aumentaram 18% este mês.",
  "Suas assinaturas representam R$ 3.933,60 por ano.",
  "Seu gasto com transporte caiu 12%.",
  "Você já comprometeu 68% da renda prevista deste mês.",
];

export function InsightsSection() {
  return (
    <Section>
      <Reveal>
        <Eyebrow>Insights</Eyebrow>
        <SectionTitle className="mt-3 max-w-3xl">O Folio transforma números em informação útil.</SectionTitle>
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {INSIGHTS.map((text, index) => (
          <Reveal key={text} delay={index * 0.05}>
            <article className="rounded-[1.75rem] bg-card p-6 ring-1 ring-border">
              <p className="font-display text-2xl leading-snug tracking-tight">{text}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
