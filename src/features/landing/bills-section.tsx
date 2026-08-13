import { DEMO_BILLS } from "@/features/landing/data";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/features/landing/reveal";
import { Eyebrow, Lead, Section, SectionTitle } from "@/features/landing/ui";
import { cn } from "@/lib/utils";

const STATUS_CLASS = {
  próximo: "bg-secondary text-foreground",
  pago: "bg-primary/50 text-foreground",
  atrasado: "bg-danger/10 text-danger",
};

export function BillsSection() {
  return (
    <Section>
      <Reveal>
        <Eyebrow>Contas a pagar</Eyebrow>
        <SectionTitle className="mt-3 max-w-2xl">Saiba o que ainda vai sair da sua conta.</SectionTitle>
        <Lead className="mt-4">Sem surpresa no fim do mês. Cada vencimento no lugar.</Lead>
      </Reveal>
      <div className="mt-10 grid gap-3 md:grid-cols-2">
        {DEMO_BILLS.map((bill, index) => (
          <Reveal key={bill.name} delay={index * 0.04}>
            <article className="flex items-center gap-4 rounded-[1.75rem] bg-card p-4 ring-1 ring-border transition duration-200 hover:-translate-y-0.5">
              <span className="grid size-12 place-items-center rounded-2xl bg-secondary">
                <bill.icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{bill.name}</p>
                <p className="text-xs text-muted-foreground">{bill.date}</p>
              </div>
              <p className="font-display text-xl tracking-tight">{bill.amount}</p>
              <Badge className={cn("capitalize", STATUS_CLASS[bill.status])}>{bill.status}</Badge>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
