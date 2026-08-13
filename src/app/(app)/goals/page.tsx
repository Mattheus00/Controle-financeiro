import { requireUser } from "@/lib/supabase/auth";
import { goalService } from "@/services/catalog-service";
import { EmptyState, Field, MoneyText } from "@/components/ui-kit";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { contributeGoalAction, createGoalAction } from "@/features/finance/actions";
import { toFormAction } from "@/lib/form-action";

export default async function GoalsPage() {
  const { supabase, userId } = await requireUser();
  const result = await goalService.list(supabase, userId);
  const goals = result.success ? result.data : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl tracking-tight">Metas</h1>
        <p className="text-muted-foreground">Guarde um pouco agora. O futuro agradece.</p>
      </div>
      {goals.length === 0 ? (
        <EmptyState title="Nenhuma meta ainda." description="Um MacBook, uma viagem, uma reserva. Escolha a primeira." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((goal) => {
            const percent = Math.min(100, Math.round((goal.current_cents / goal.target_cents) * 100));
            return (
              <div key={goal.id} className="rounded-3xl bg-card p-5 ring-1 ring-border">
                <h2 className="font-display text-2xl">{goal.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Meta: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(goal.target_cents / 100)}
                </p>
                <MoneyText cents={goal.current_cents} className="text-3xl" />
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{percent}%</p>
                <form action={toFormAction(contributeGoalAction)} className="mt-4 flex gap-2">
                  <input type="hidden" name="goal_id" value={goal.id} />
                  <Input name="amount" placeholder="R$ 100" className="h-11" />
                  <Button type="submit" className="h-11 rounded-2xl">Guardar</Button>
                </form>
              </div>
            );
          })}
        </div>
      )}
      <form action={toFormAction(createGoalAction)} className="grid gap-3 rounded-3xl bg-card p-5 ring-1 ring-border md:grid-cols-2">
        <h2 className="font-display text-2xl md:col-span-2">Nova meta</h2>
        <Field label="Nome" htmlFor="name"><Input id="name" name="name" required className="h-11" placeholder="Viagem Japão" /></Field>
        <Field label="Valor" htmlFor="target"><Input id="target" name="target" required className="h-11" placeholder="R$ 25.000" /></Field>
        <Field label="Prazo" htmlFor="deadline"><Input id="deadline" name="deadline" type="date" className="h-11" /></Field>
        <Button type="submit" className="h-11 rounded-2xl md:col-span-2">Criar meta</Button>
      </form>
    </div>
  );
}
