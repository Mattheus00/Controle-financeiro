import { requireUser } from "@/lib/supabase/auth";
import { billService } from "@/services/bill-service";
import { categoryService } from "@/services/catalog-service";
import { EmptyState, MoneyText } from "@/components/ui-kit";
import { EntityIcon } from "@/components/icons/entity-icon";
import { formatDayMonth } from "@/lib/date";
import { BILL_STATUS_LABELS, type BillStatus } from "@/types";
import { PayBillButton } from "@/features/bills/pay-bill-button";
import { Badge } from "@/components/ui/badge";

export default async function BillsPage() {
  const { supabase, userId } = await requireUser();
  const [result, categories] = await Promise.all([
    billService.list(supabase, userId),
    categoryService.list(supabase, userId),
  ]);
  const bills = result.success ? result.data : [];
  const categoryMap = new Map((categories.success ? categories.data : []).map((item) => [item.id, item]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-tight">Contas</h1>
        <p className="text-muted-foreground">O que ainda precisa ser pago.</p>
      </div>
      {bills.length === 0 ? (
        <EmptyState
          title="Nenhuma conta por aqui."
          description="Quando você cadastrar despesas futuras, elas aparecerão com data e ícone."
        />
      ) : (
        <ul className="space-y-2">
          {bills.map((bill) => {
            const category = bill.category_id ? categoryMap.get(bill.category_id) : undefined;
            return (
              <li key={bill.id} className="flex items-center gap-3 rounded-3xl bg-card px-4 py-3 ring-1 ring-border">
                <EntityIcon name={bill.icon || category?.icon} label={bill.name} color={category?.color} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{bill.name}</p>
                  <p className="text-xs text-muted-foreground">{formatDayMonth(bill.due_date)}</p>
                </div>
                <Badge variant={bill.status === "overdue" ? "destructive" : "secondary"}>
                  {BILL_STATUS_LABELS[bill.status as BillStatus]}
                </Badge>
                <MoneyText cents={bill.amount_cents} className="text-lg" />
                {bill.status !== "paid" ? <PayBillButton id={bill.id} /> : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
