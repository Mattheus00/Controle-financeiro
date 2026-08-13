import { requireUser } from "@/lib/supabase/auth";
import { subscriptionService, categoryService } from "@/services/catalog-service";
import { EmptyState, Field, MoneyText } from "@/components/ui-kit";
import { MerchantLogo } from "@/components/merchant/MerchantLogo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createSubscriptionAction } from "@/features/finance/actions";
import type { FormAction } from "@/types";

export default async function SubscriptionsPage() {
  const { supabase, userId } = await requireUser();
  const [result, categories] = await Promise.all([
    subscriptionService.list(supabase, userId),
    categoryService.list(supabase, userId),
  ]);
  const data = result.success ? result.data : { items: [], monthly: 0, yearly: 0 };
  const categoryMap = new Map((categories.success ? categories.data : []).map((item) => [item.id, item]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl tracking-tight">Assinaturas</h1>
        <p className="text-muted-foreground">O custo mensal parece pequeno. O anual, nem tanto.</p>
      </div>
      <div className="rounded-3xl bg-secondary p-6">
        <p className="text-sm text-muted-foreground">Total mensal com assinaturas</p>
        <MoneyText cents={data.monthly} className="text-4xl" />
        <p className="mt-2 text-muted-foreground">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(data.yearly / 100)} / ano</p>
      </div>
      {data.items.length === 0 ? (
        <EmptyState
          title="Nenhuma assinatura encontrada."
          description="Quando você cadastrar despesas recorrentes, elas aparecerão aqui."
        />
      ) : (
        <ul className="space-y-2">
          {data.items.map((item) => {
            const category = item.category_id ? categoryMap.get(item.category_id) : undefined;
            return (
              <li key={item.id} className="flex items-center gap-3 rounded-3xl bg-card px-4 py-3 ring-1 ring-border">
                <MerchantLogo
                  merchantName={item.merchant || item.name}
                  category={category?.slug}
                  categoryIcon={item.icon || category?.icon}
                />
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Todo dia {item.billing_day}</p>
                </div>
                <MoneyText cents={item.amount_cents} className="text-lg" />
              </li>
            );
          })}
        </ul>
      )}
      <form action={createSubscriptionAction as FormAction} className="grid gap-3 rounded-3xl bg-card p-5 ring-1 ring-border md:grid-cols-2">
        <h2 className="font-display text-2xl md:col-span-2">Nova assinatura</h2>
        <Field label="Nome" htmlFor="name"><Input id="name" name="name" required className="h-11" placeholder="Netflix" /></Field>
        <Field label="Valor" htmlFor="amount"><Input id="amount" name="amount" required className="h-11" placeholder="R$ 55,90" /></Field>
        <Field label="Dia de cobrança" htmlFor="billing_day"><Input id="billing_day" name="billing_day" type="number" min={1} max={28} required className="h-11" /></Field>
        <Button type="submit" className="h-11 rounded-2xl md:col-span-2">Salvar</Button>
      </form>
    </div>
  );
}
