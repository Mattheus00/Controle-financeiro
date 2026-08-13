import { Camera, LayoutDashboard, UserRound } from "lucide-react";
import { Reveal } from "@/features/landing/reveal";
import { Eyebrow, Section, SectionTitle } from "@/features/landing/ui";

const STEPS = [
  {
    icon: UserRound,
    title: "Crie sua conta",
    text: "Configure suas contas, cartões e categorias.",
  },
  {
    icon: Camera,
    title: "Registre sua vida financeira",
    text: "Digite um gasto ou simplesmente fotografe um comprovante.",
  },
  {
    icon: LayoutDashboard,
    title: "Tenha clareza",
    text: "O Folio organiza tudo e mostra o que está acontecendo com seu dinheiro.",
  },
];

export function HowItWorks() {
  return (
    <Section id="como-funciona" tone="soft">
      <Reveal>
        <Eyebrow>Como funciona</Eyebrow>
        <SectionTitle className="mt-3">Três passos. Depois, o Folio trabalha com você.</SectionTitle>
      </Reveal>
      <ol className="mt-12 grid gap-4 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <Reveal key={step.title} delay={index * 0.06}>
            <li className="rounded-[1.75rem] bg-card p-6 ring-1 ring-border">
              <span className="font-display text-4xl text-muted-foreground/50">{index + 1}</span>
              <span className="mt-4 grid size-11 place-items-center rounded-2xl bg-primary">
                <step.icon className="size-4" />
              </span>
              <h3 className="mt-5 font-display text-2xl tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
