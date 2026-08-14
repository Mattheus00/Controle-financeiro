"use client";

import { useState } from "react";
import Link from "next/link";
import { Field } from "@/components/ui-kit";
import { Input } from "@/components/ui/input";
import { creditCardLabel, useCreditCards } from "@/features/cards/credit-cards-provider";

const SELECT_CLASS =
  "h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm";

export function ExpensePaymentFields({
  idPrefix = "",
  defaultPaymentMethod = "pix",
  showInstallments = true,
}: {
  idPrefix?: string;
  defaultPaymentMethod?: string;
  showInstallments?: boolean;
}) {
  const cards = useCreditCards();
  const [method, setMethod] = useState(defaultPaymentMethod);
  const isCredit = method === "credit";
  const paymentId = `${idPrefix}payment_method`;
  const cardId = `${idPrefix}credit_card_id`;
  const installmentsId = `${idPrefix}installment_total`;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Field label="Pagamento" htmlFor={paymentId}>
        <select
          id={paymentId}
          name="payment_method"
          value={method}
          onChange={(event) => setMethod(event.target.value)}
          className={SELECT_CLASS}
        >
          <option value="pix">PIX</option>
          <option value="cash">Dinheiro</option>
          <option value="debit">Débito</option>
          <option value="credit">Crédito</option>
          <option value="boleto">Boleto</option>
          <option value="other">Outros</option>
        </select>
      </Field>
      {isCredit ? (
        cards.length > 0 ? (
          <Field label="Cartão" htmlFor={cardId}>
            <select
              id={cardId}
              name="credit_card_id"
              required
              defaultValue={cards.length === 1 ? (cards[0]?.id ?? "") : ""}
              className={SELECT_CLASS}
            >
              {cards.length > 1 ? <option value="">Escolha o cartão</option> : null}
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {creditCardLabel(card)}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <p className="text-sm text-muted-foreground sm:col-span-1">
            Cadastre um cartão para lançar nesta fatura.{" "}
            <Link href="/cards" className="font-medium underline-offset-4 hover:underline">
              Adicionar cartão
            </Link>
          </p>
        )
      ) : null}
      {isCredit && showInstallments ? (
        <Field label="Parcelas" htmlFor={installmentsId}>
          <Input
            id={installmentsId}
            name="installment_total"
            type="number"
            min={1}
            max={48}
            defaultValue={1}
            className="h-11"
          />
        </Field>
      ) : null}
    </div>
  );
}
