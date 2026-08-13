import { VISUAL_TRANSACTIONS } from "@/features/landing/data";
import { MockFrame, TxRow } from "@/features/landing/mock-ui";
import { Reveal } from "@/features/landing/reveal";
import { Eyebrow, Lead, Section, SectionTitle } from "@/features/landing/ui";

export function TransactionsShowcase() {
  return (
    <Section tone="soft">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <Eyebrow>Transações</Eyebrow>
          <SectionTitle className="mt-3">Seu dinheiro, fácil de reconhecer.</SectionTitle>
          <Lead className="mt-4">
            O Folio usa ícones para cada gasto. Você encontra o Uber, o mercado e a assinatura sem
            caçar linhas numa planilha.
          </Lead>
        </Reveal>
        <Reveal delay={0.06}>
          <MockFrame title="Transações">
            <div className="max-h-[28rem] space-y-3 overflow-auto p-4">
              {VISUAL_TRANSACTIONS.map((item) => (
                <TxRow key={item.name} {...item} tint="bg-secondary" />
              ))}
            </div>
          </MockFrame>
        </Reveal>
      </div>
    </Section>
  );
}
