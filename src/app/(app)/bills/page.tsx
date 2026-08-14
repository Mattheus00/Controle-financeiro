import { requireUser } from "@/lib/supabase/auth";
import { billService } from "@/services/bill-service";
import { categoryService } from "@/services/catalog-service";
import { EmptyState, Field, MoneyText } from "@/components/ui-kit";
import { MerchantLogo } from "@/components/merchant/MerchantLogo";
import { formatDayMonth, todayISO } from "@/lib/date";
import { BILL_STATUS_LABELS, type BillStatus, asFormAction } from "@/types";
import { PayBillButton } from "@/features/bills/pay-bill-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createRecurringAction } from "@/features/finance/actions";

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
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">Contas</h1>
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
              <li key={bill.id} className="flex flex-col gap-3 rounded-3xl bg-card px-4 py-3 ring-1 ring-border sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <MerchantLogo
                    merchantName={bill.name}
                    category={category?.slug}
                    categoryIcon={bill.icon || category?.icon}
                    categoryColor={category?.color}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{bill.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDayMonth(bill.due_date)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 sm:justify-end">
                  <Badge variant={bill.status === "overdue" ? "destructive" : "secondary"}>
                    {BILL_STATUS_LABELS[bill.status as BillStatus]}
                  </Badge>
                  <MoneyText cents={bill.amount_cents} className="text-lg" />
                  {bill.status !== "paid" ? <PayBillButton id={bill.id} /> : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form action={asFormAction(createRecurringAction)} className="grid gap-3 rounded-3xl bg-card p-5 ring-1 ring-border md:grid-cols-2">
        <h2 className="font-display text-2xl md:col-span-2">Conta recorrente</h2>
        <Field label="Descrição" htmlFor="description">
          <Input id="description" name="description" required className="h-11" placeholder="Netflix" />
        </Field>
        <Field label="Valor" htmlFor="amount">
          <Input id="amount" name="amount" required className="h-11" />
        </Field>
        <Field label="Frequência" htmlFor="frequency">
          <select id="frequency" name="frequency" className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm">
            <option value="monthly">Mensal</option>
            <option value="weekly">Semanal</option>
            <option value="quarterly">Trimestral</option>
            <option value="semiannual">Semestral</option>
            <option value="yearly">Anual</option>
          </select>
        </Field>
        <Field label="Começa em" htmlFor="start_date">
          <Input id="start_date" name="start_date" type="date" defaultValue={todayISO()} className="h-11" />
        </Field>
        <Button type="submit" className="h-11 rounded-2xl md:col-span-2">
          Criar recorrência
        </Button>
      </form>
    </div>
  );
}
