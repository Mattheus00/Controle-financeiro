import { requireUser } from "@/lib/supabase/auth";
import { cardService } from "@/services/catalog-service";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState, Field, MoneyText } from "@/components/ui-kit";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createCardAction } from "@/features/finance/actions";
import { MerchantLogo } from "@/components/merchant/MerchantLogo";
import type { FormAction } from "@/types";

export default async function CardsPage() {
  const { supabase, userId } = await requireUser();
  const result = await cardService.list(supabase, userId);
  const cards = result.success ? result.data : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl tracking-tight">Cartões</h1>
        <p className="text-muted-foreground">Limite, fatura e vencimento. Sem número completo.</p>
      </div>
      {cards.length === 0 ? (
        <EmptyState title="Nenhum cartão ainda." description="Cadastre o nome, os 4 últimos dígitos e o limite." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <Card key={card.id} className="rounded-3xl">
              <CardHeader className="flex flex-row items-start gap-3">
                <MerchantLogo merchantName={card.brand || card.name} size="lg" />
                <div>
                  <p className="text-sm text-muted-foreground">{card.brand || "Cartão"}</p>
                  <h2 className="font-display text-2xl">{card.name}</h2>
                  <p className="text-muted-foreground">**** {card.last_four ?? "----"}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Fatura atual</span>
                  <MoneyText cents={card.invoice_cents} />
                </div>
                {card.limit_cents != null ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Limite</span>
                      <MoneyText cents={card.limit_cents} />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Disponível</span>
                      <MoneyText cents={card.available_cents ?? 0} tone="success" />
                    </div>
                  </>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  Fecha dia {card.closing_day} · vence dia {card.due_day}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <form action={createCardAction as FormAction} className="grid gap-3 rounded-3xl bg-card p-5 ring-1 ring-border md:grid-cols-2">
        <h2 className="font-display text-2xl md:col-span-2">Novo cartão</h2>
        <Field label="Nome" htmlFor="name"><Input id="name" name="name" required className="h-11" placeholder="Nubank" /></Field>
        <Field label="Bandeira" htmlFor="brand"><Input id="brand" name="brand" className="h-11" placeholder="Mastercard" /></Field>
        <Field label="Últimos 4 dígitos" htmlFor="last_four"><Input id="last_four" name="last_four" maxLength={4} className="h-11" placeholder="4821" /></Field>
        <Field label="Limite" htmlFor="limit"><Input id="limit" name="limit" className="h-11" placeholder="R$ 8.000" /></Field>
        <Field label="Fechamento" htmlFor="closing_day"><Input id="closing_day" name="closing_day" type="number" min={1} max={28} required className="h-11" /></Field>
        <Field label="Vencimento" htmlFor="due_day"><Input id="due_day" name="due_day" type="number" min={1} max={28} required className="h-11" /></Field>
        <Button type="submit" className="h-11 rounded-2xl md:col-span-2">Salvar cartão</Button>
      </form>
    </div>
  );
}
