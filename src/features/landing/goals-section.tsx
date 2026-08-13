import { Plane, Laptop } from "lucide-react";
import { DEMO_GOALS } from "@/features/landing/data";
import { ProgressLine } from "@/features/landing/mock-ui";
import { Reveal } from "@/features/landing/reveal";
import { Eyebrow, Lead, Section, SectionTitle } from "@/features/landing/ui";

const ICONS = [Plane, Laptop];

export function GoalsSection() {
  return (
    <Section tone="soft">
      <Reveal>
        <Eyebrow>Metas</Eyebrow>
        <SectionTitle className="mt-3">Controle o presente sem esquecer do futuro.</SectionTitle>
        <Lead className="mt-4">Guarde um pouco agora. O futuro aparece no painel.</Lead>
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {DEMO_GOALS.map((goal, index) => {
          const Icon = ICONS[index];
          return (
            <Reveal key={goal.name} delay={index * 0.06}>
              <article className="rounded-[2rem] bg-card p-6 ring-1 ring-border">
                <span className="grid size-12 place-items-center rounded-2xl bg-primary/60">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-3xl tracking-tight">{goal.name}</h3>
                <p className="mt-2 text-muted-foreground">
                  <span className="font-display text-2xl text-foreground">{goal.current}</span>
                  <span> de {goal.target}</span>
                </p>
                <ProgressLine percent={goal.percent} className="mt-5 h-2.5" />
                <p className="mt-2 text-sm font-medium">{goal.percent}%</p>
              </article>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
