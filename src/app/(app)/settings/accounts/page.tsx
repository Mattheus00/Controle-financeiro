import Link from "next/link";
import { requireUser } from "@/lib/supabase/auth";
import { accountService, cardService } from "@/services/catalog-service";
import { EmptyState, Field, MoneyText } from "@/components/ui-kit";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createAccountAction } from "@/features/finance/actions";
import { SettingsSubpage } from "@/features/profile/settings-subpage";
import { MerchantLogo } from "@/components/merchant/MerchantLogo";
import { asFormAction } from "@/types";

export default async function AccountsSettingsPage() {
  const { supabase, userId } = await requireUser();
  const [accounts, cards] = await Promise.all([
    accountService.list(supabase, userId),
    cardService.list(supabase, userId),
  ]);
  const accs = accounts.success ? accounts.data : [];
  const cardRows = cards.success ? cards.data : [];

  return (
    <SettingsSubpage title="Contas e cartões" description="De onde o dinheiro sai e entra.">
      <section className="rounded-3xl bg-card p-5 ring-1 ring-border">
        <h2 className="font-display text-2xl">Contas bancárias</h2>
        {accs.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nenhuma conta cadastrada ainda.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {accs.map((account) => (
              <li key={account.id} className="flex items-start justify-between gap-3 rounded-2xl bg-muted px-3 py-2">
                <span className="min-w-0 break-words">{account.name}</span>
                <span className="shrink-0 text-muted-foreground">{account.type}</span>
              </li>
            ))}
          </ul>
        )}
        <form action={asFormAction(createAccountAction)} className="mt-4 grid gap-3 md:grid-cols-2">
          <Field label="Nome" htmlFor="account-name">
            <Input id="account-name" name="name" required className="h-11" />
          </Field>
          <Field label="Tipo" htmlFor="type">
            <select id="type" name="type" className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm">
              <option value="checking">Conta corrente</option>
              <option value="savings">Poupança</option>
              <option value="wallet">Carteira</option>
              <option value="cash">Dinheiro</option>
            </select>
          </Field>
          <Field label="Saldo inicial" htmlFor="initial_balance">
            <Input id="initial_balance" name="initial_balance" className="h-11" placeholder="R$ 0,00" />
          </Field>
          <Button type="submit" className="h-11 self-end rounded-2xl">
            Adicionar conta
          </Button>
        </form>
      </section>

      <section className="rounded-3xl bg-card p-5 ring-1 ring-border">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-2xl">Cartões</h2>
          <Link href="/cards" className="text-sm font-medium underline-offset-4 hover:underline">
            Gerenciar
          </Link>
        </div>
        {cardRows.length === 0 ? (
          <EmptyState
            className="mt-3"
            title="Nenhum cartão ainda."
            description="Cadastre o nome, os 4 últimos dígitos e o limite."
            action={
              <Button asChild className="h-11 rounded-2xl">
                <Link href="/cards">Adicionar cartão</Link>
              </Button>
            }
          />
        ) : (
          <ul className="mt-3 space-y-2">
            {cardRows.map((card) => (
              <li key={card.id} className="flex items-center gap-3 rounded-2xl bg-muted px-3 py-2">
                <MerchantLogo merchantName={card.brand || card.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{card.name}</p>
                  <p className="text-xs text-muted-foreground">**** {card.last_four ?? "----"}</p>
                </div>
                <MoneyText cents={card.invoice_cents} className="text-base" />
              </li>
            ))}
          </ul>
        )}
      </section>
    </SettingsSubpage>
  );
}
