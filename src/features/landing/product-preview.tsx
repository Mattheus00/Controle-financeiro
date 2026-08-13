import { DEMO_TRANSACTIONS } from "@/features/landing/data";
import { MockFrame, Sparkline, StatCard, TxRow } from "@/features/landing/mock-ui";

export function ProductPreview({ compact = false }: { compact?: boolean }) {
  return (
    <MockFrame title="Visão geral" className={compact ? "max-w-lg" : undefined}>
      <div className="space-y-4 p-4 md:p-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Saldo atual" value="R$ 8.420,32" hint="+8,4% este mês" hintTone="up" />
          <StatCard label="Gastos do mês" value="R$ 4.280,32" />
          <StatCard label="Contas futuras" value="R$ 1.890,20" />
        </div>
        <div className="rounded-3xl bg-secondary/70 p-4">
          <p className="text-xs font-medium text-muted-foreground">Entradas × saídas</p>
          <Sparkline className="mt-2" />
        </div>
        <div className="space-y-3">
          {DEMO_TRANSACTIONS.map((item) => (
            <TxRow key={item.name} {...item} />
          ))}
        </div>
      </div>
    </MockFrame>
  );
}
