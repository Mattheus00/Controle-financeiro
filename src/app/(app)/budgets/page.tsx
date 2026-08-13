import { requireUser } from "@/lib/supabase/auth";
import { budgetService, categoryService } from "@/services/catalog-service";
import { monthStartISO } from "@/lib/date";
import { budgetPercent, budgetTone } from "@/lib/budget";
import { EmptyState, Field, MoneyText } from "@/components/ui-kit";
import { EntityIcon } from "@/components/icons/entity-icon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { upsertBudgetAction } from "@/features/finance/actions";
import { asFormAction } from "@/types";
import { cn } from "@/lib/utils";

const TONE_LABEL = {
  normal: "Normal",
  attention: "Atenção",
  near: "Limite próximo",
  exceeded: "Limite excedido",
};

export default async function BudgetsPage() {
  const { supabase, userId } = await requireUser();
  const month = monthStartISO();
  const [budgets, categories] = await Promise.all([
    budgetService.list(supabase, userId, month),
    categoryService.list(supabase, userId),
  ]);
  const items = budgets.success ? budgets.data : [];
  const cats = categories.success ? categories.data : [];
  const categoryMap = new Map(cats.map((item) => [item.id, item]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">Orçamento</h1>
        <p className="text-muted-foreground">Limites simples, sem culpa.</p>
      </div>
      {items.length === 0 ? (
        <EmptyState title="Nenhum limite definido." description="Escolha uma categoria e um valor para acompanhar o mês." />
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const category = categoryMap.get(item.category_id);
            const percent = budgetPercent(item.spent_cents, item.amount_cents);
            const tone = budgetTone(item.spent_cents, item.amount_cents);
            return (
              <div key={item.id} className="rounded-3xl bg-card p-4 ring-1 ring-border">
                <div className="flex items-start gap-3">
                  <EntityIcon name={category?.icon} label={category?.name} color={category?.color} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <p className="truncate font-medium">{category?.name}</p>
                      <p className="shrink-0 text-sm">
                        <MoneyText cents={item.spent_cents} className="text-base" /> / {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.amount_cents / 100)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">{TONE_LABEL[tone]}</p>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      tone === "exceeded" && "bg-danger",
                      tone === "near" && "bg-warning",
                      tone === "attention" && "bg-warning",
                      tone === "normal" && "bg-primary",
                    )}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-right text-xs text-muted-foreground">{percent}%</p>
              </div>
            );
          })}
        </div>
      )}
      <form action={asFormAction(upsertBudgetAction)} className="grid gap-3 rounded-3xl bg-card p-5 ring-1 ring-border md:grid-cols-2">
        <h2 className="font-display text-2xl md:col-span-2">Definir limite</h2>
        <input type="hidden" name="month" value={month} />
        <Field label="Categoria" htmlFor="category_id">
          <select id="category_id" name="category_id" required className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm">
            {cats.filter((item) => item.type !== "income").map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Limite" htmlFor="amount"><Input id="amount" name="amount" required className="h-11" placeholder="R$ 800" /></Field>
        <Button type="submit" className="h-11 rounded-2xl md:col-span-2">Salvar limite</Button>
      </form>
    </div>
  );
}
