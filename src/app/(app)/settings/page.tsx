import { requireUser } from "@/lib/supabase/auth";
import { accountService, categoryService, profileService } from "@/services/catalog-service";
import { Field } from "@/components/ui-kit";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  createAccountAction,
  createCategoryAction,
  createRecurringAction,
  updateProfileAction,
} from "@/features/finance/actions";
import { signOutAction } from "@/features/auth/actions";
import { todayISO } from "@/lib/date";
import { toFormAction } from "@/lib/form-action";

export default async function SettingsPage() {
  const { supabase, userId } = await requireUser();
  const [profile, categories, accounts] = await Promise.all([
    profileService.get(supabase, userId),
    categoryService.list(supabase, userId),
    accountService.list(supabase, userId),
  ]);
  const name = profile.success ? profile.data.profile?.name ?? "" : "";
  const cats = categories.success ? categories.data : [];
  const accs = accounts.success ? accounts.data : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Seu perfil, categorias e contas.</p>
      </div>

      <form action={toFormAction(updateProfileAction)} className="grid gap-3 rounded-3xl bg-card p-5 ring-1 ring-border md:grid-cols-2">
        <h2 className="font-display text-2xl md:col-span-2">Perfil</h2>
        <Field label="Nome" htmlFor="name"><Input id="name" name="name" defaultValue={name} required className="h-11" /></Field>
        <Field label="Fuso" htmlFor="timezone">
          <Input id="timezone" name="timezone" defaultValue="America/Sao_Paulo" className="h-11" />
        </Field>
        <input type="hidden" name="currency" value="BRL" />
        <Button type="submit" className="h-11 rounded-2xl md:col-span-2">Salvar perfil</Button>
      </form>

      <section className="rounded-3xl bg-card p-5 ring-1 ring-border">
        <h2 className="font-display text-2xl">Contas bancárias</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {accs.map((account) => (
            <li key={account.id} className="flex justify-between rounded-2xl bg-muted px-3 py-2">
              <span>{account.name}</span>
              <span className="text-muted-foreground">{account.type}</span>
            </li>
          ))}
        </ul>
        <form action={toFormAction(createAccountAction)} className="mt-4 grid gap-3 md:grid-cols-2">
          <Field label="Nome" htmlFor="account-name"><Input id="account-name" name="name" required className="h-11" /></Field>
          <Field label="Tipo" htmlFor="type">
            <select id="type" name="type" className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm">
              <option value="checking">Conta corrente</option>
              <option value="savings">Poupança</option>
              <option value="wallet">Carteira</option>
              <option value="cash">Dinheiro</option>
            </select>
          </Field>
          <Field label="Saldo inicial" htmlFor="initial_balance"><Input id="initial_balance" name="initial_balance" className="h-11" placeholder="R$ 0,00" /></Field>
          <Button type="submit" className="h-11 self-end rounded-2xl">Adicionar conta</Button>
        </form>
      </section>

      <section className="rounded-3xl bg-card p-5 ring-1 ring-border">
        <h2 className="font-display text-2xl">Categorias</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {cats.map((category) => (
            <span key={category.id} className="rounded-full bg-muted px-3 py-1 text-sm">{category.name}</span>
          ))}
        </div>
        <form action={toFormAction(createCategoryAction)} className="mt-4 grid gap-3 md:grid-cols-2">
          <Field label="Nova categoria" htmlFor="category-name"><Input id="category-name" name="name" required className="h-11" /></Field>
          <input type="hidden" name="icon" value="CircleDot" />
          <input type="hidden" name="color" value="#84CC16" />
          <input type="hidden" name="type" value="expense" />
          <Button type="submit" className="h-11 self-end rounded-2xl">Criar categoria</Button>
        </form>
      </section>

      <form action={toFormAction(createRecurringAction)} className="grid gap-3 rounded-3xl bg-card p-5 ring-1 ring-border md:grid-cols-2">
        <h2 className="font-display text-2xl md:col-span-2">Conta recorrente</h2>
        <Field label="Descrição" htmlFor="description"><Input id="description" name="description" required className="h-11" placeholder="Netflix" /></Field>
        <Field label="Valor" htmlFor="amount"><Input id="amount" name="amount" required className="h-11" /></Field>
        <Field label="Frequência" htmlFor="frequency">
          <select id="frequency" name="frequency" className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm">
            <option value="monthly">Mensal</option>
            <option value="weekly">Semanal</option>
            <option value="quarterly">Trimestral</option>
            <option value="semiannual">Semestral</option>
            <option value="yearly">Anual</option>
          </select>
        </Field>
        <Field label="Começa em" htmlFor="start_date"><Input id="start_date" name="start_date" type="date" defaultValue={todayISO()} className="h-11" /></Field>
        <Button type="submit" className="h-11 rounded-2xl md:col-span-2">Criar recorrência</Button>
      </form>

      <form action={signOutAction}>
        <Button type="submit" variant="outline" className="h-11 rounded-2xl">Sair da conta</Button>
      </form>
    </div>
  );
}
