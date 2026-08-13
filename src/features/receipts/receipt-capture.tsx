"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui-kit";
import { confirmReceiptAction, processReceiptAction } from "@/features/receipts/actions";
import { todayISO } from "@/lib/date";
import { PAYMENT_METHOD_LABELS, type ReceiptExtraction } from "@/types";

const STEPS = [
  "Analisando seu comprovante...",
  "Identificando estabelecimento...",
  "Encontrando valor...",
  "Identificando pagamento...",
  "Tudo pronto ✓",
];

export function ReceiptCapture({ onDone }: { onDone: () => void }) {
  const [pending, start] = useTransition();
  const [step, setStep] = useState(0);
  const [scanId, setScanId] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<ReceiptExtraction | null>(null);

  if (scanId && extracted) {
    return (
      <ConfirmForm
        scanId={scanId}
        extracted={extracted}
        onDone={onDone}
      />
    );
  }

  return (
    <form
      className="space-y-4"
      action={(formData) => {
        setStep(0);
        const timer = window.setInterval(() => {
          setStep((current) => Math.min(current + 1, STEPS.length - 2));
        }, 700);
        start(async () => {
          const result = await processReceiptAction(formData);
          window.clearInterval(timer);
          if (!result.success) {
            toast.error(result.error.message);
            return;
          }
          setStep(STEPS.length - 1);
          setScanId(result.data.scanId);
          setExtracted(result.data.extracted);
        });
      }}
    >
      <Field label="Foto, galeria ou PDF" htmlFor="file">
        <Input
          id="file"
          name="file"
          type="file"
          accept="image/*,application/pdf,capture=camera"
          capture="environment"
          required
          className="h-11"
        />
      </Field>
      {pending ? (
        <p className="rounded-2xl bg-secondary px-4 py-3 text-sm">{STEPS[step]}</p>
      ) : null}
      <Button type="submit" disabled={pending} className="h-11 w-full rounded-2xl">
        {pending ? "Lendo comprovante..." : "Enviar comprovante"}
      </Button>
    </form>
  );
}

function ConfirmForm({
  scanId,
  extracted,
  onDone,
}: {
  scanId: string;
  extracted: ReceiptExtraction;
  onDone: () => void;
}) {
  const [pending, start] = useTransition();
  const amount = extracted.amount
    ? extracted.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
    : "";

  return (
    <form
      className="space-y-4"
      action={(formData) => {
        start(async () => {
          const result = await confirmReceiptAction(formData);
          if (!result.success) {
            toast.error(result.error.message);
            return;
          }
          toast.success("Gasto cadastrado");
          onDone();
        });
      }}
    >
      <input type="hidden" name="scanId" value={scanId} />
      <div className="rounded-3xl bg-secondary p-4">
        <p className="text-sm text-muted-foreground">Encontramos estas informações:</p>
        <p className="mt-2 font-display text-2xl">{extracted.merchant || "Estabelecimento"}</p>
        <p className="text-lg">{amount ? `R$ ${amount}` : "Valor não identificado"}</p>
        <p className="text-sm text-muted-foreground">
          {extracted.date} · {extracted.payment_method ? PAYMENT_METHOD_LABELS[extracted.payment_method] : "Pagamento"}
        </p>
      </div>
      <Field label="Valor" htmlFor="confirm-amount">
        <Input id="confirm-amount" name="amount" defaultValue={amount} required className="h-11" />
      </Field>
      <Field label="Onde" htmlFor="confirm-merchant">
        <Input id="confirm-merchant" name="merchant" defaultValue={extracted.merchant ?? ""} className="h-11" />
      </Field>
      <Field label="Descrição" htmlFor="confirm-description">
        <Input id="confirm-description" name="description" defaultValue={extracted.description ?? extracted.merchant ?? ""} className="h-11" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Data" htmlFor="confirm-date">
          <Input id="confirm-date" name="date" type="date" defaultValue={extracted.date ?? todayISO()} className="h-11" />
        </Field>
        <Field label="Pagamento" htmlFor="confirm-payment">
          <select
            id="confirm-payment"
            name="payment_method"
            defaultValue={extracted.payment_method ?? "pix"}
            className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="pix">PIX</option>
            <option value="credit">Crédito</option>
            <option value="debit">Débito</option>
            <option value="boleto">Boleto</option>
            <option value="cash">Dinheiro</option>
            <option value="other">Outros</option>
          </select>
        </Field>
      </div>
      <Button type="submit" disabled={pending} className="h-11 w-full rounded-2xl">
        {pending ? "Confirmando..." : "Confirmar gasto"}
      </Button>
    </form>
  );
}
