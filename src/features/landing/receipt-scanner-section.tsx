import { ArrowDown, Camera, Check, ScanLine } from "lucide-react";
import { ReceiptDemo } from "@/features/landing/receipt-demo";
import { Reveal } from "@/features/landing/reveal";
import { Eyebrow, Lead, Section, SectionTitle } from "@/features/landing/ui";

const FLOW = [
  "Comprei algo",
  "Abri o Folio",
  "Fotografei o comprovante",
  "O Folio identificou os dados",
  "Confirmei",
  "Meu gasto está organizado",
];

const STEPS = [
  { n: "1", title: "Fotografe", text: "Tire uma foto ou envie um comprovante.", icon: Camera },
  {
    n: "2",
    title: "O Folio identifica",
    text: "Estabelecimento, valor, data, categoria e forma de pagamento.",
    icon: ScanLine,
  },
  { n: "3", title: "Confirme", text: "Revise e salve. Você decide o que entra.", icon: Check },
];

export function ReceiptScannerSection() {
  return (
    <Section className="overflow-hidden">
      <div className="grid items-start gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
        <Reveal>
          <Eyebrow>O diferencial</Eyebrow>
          <SectionTitle className="mt-3">Tirou uma foto. O Folio organiza.</SectionTitle>
          <Lead className="mt-4">
            Fotografe sua nota, recibo ou comprovante. O Folio identifica as principais informações e
            prepara o gasto para você revisar.
          </Lead>
          <p className="mt-3 text-sm font-medium">Uma foto. Alguns segundos. Gasto registrado.</p>
          <ol className="mt-8 space-y-4">
            {STEPS.map((step) => (
              <li key={step.n} className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary font-display text-lg">
                  {step.n}
                </span>
                <div>
                  <h3 className="font-medium">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
        <Reveal delay={0.08}>
          <ReceiptDemo />
        </Reveal>
      </div>
      <Reveal className="mt-16">
        <p className="text-center text-sm font-medium text-muted-foreground">Do caixa ao Folio, sem planilha</p>
        <ol className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
          {FLOW.map((item, index) => (
            <li key={item} className="flex items-center gap-2">
              <div className="flex-1 rounded-2xl bg-card px-3 py-3 text-center text-sm font-medium ring-1 ring-border">
                {item}
              </div>
              {index < FLOW.length - 1 ? (
                <ArrowDown className="hidden size-4 shrink-0 text-muted-foreground lg:block lg:rotate-[-90deg]" />
              ) : null}
            </li>
          ))}
        </ol>
      </Reveal>
    </Section>
  );
}
