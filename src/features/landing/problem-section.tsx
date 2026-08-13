import { Bell, CreditCard, FileQuestion, HelpCircle, Layers, Receipt } from "lucide-react";
import { Reveal } from "@/features/landing/reveal";
import { Eyebrow, Lead, Section, SectionTitle } from "@/features/landing/ui";

const PAINS = [
  { icon: HelpCircle, title: "Gastos esquecidos", text: "Saiu. Pagou. Esqueceu." },
  { icon: Receipt, title: "Comprovantes perdidos", text: "A foto ficou na galeria. O gasto, no ar." },
  { icon: Layers, title: "Assinaturas escondidas", text: "Pequenas. Mensais. Fáceis de ignorar." },
  { icon: Bell, title: "Contas no mesmo dia", text: "Tudo vence junto. Você descobre tarde." },
  { icon: CreditCard, title: "Compras espalhadas", text: "PIX, débito, dois cartões. Zero visão." },
  { icon: FileQuestion, title: "Sobrou quanto?", text: "Saldo existe. Clareza, não." },
];

export function ProblemSection() {
  return (
    <Section>
      <Reveal>
        <Eyebrow>O problema</Eyebrow>
        <SectionTitle className="mt-3 max-w-3xl">
          Sua vida financeira não deveria depender de uma planilha.
        </SectionTitle>
        <Lead className="mt-4">Você gastou. O Folio organiza.</Lead>
      </Reveal>
      <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PAINS.map((item, index) => (
          <Reveal key={item.title} delay={index * 0.04}>
            <article className="flex gap-4 rounded-[1.75rem] bg-card p-5 ring-1 ring-border">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-secondary">
                <item.icon className="size-4" />
              </span>
              <div>
                <h3 className="font-medium">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
