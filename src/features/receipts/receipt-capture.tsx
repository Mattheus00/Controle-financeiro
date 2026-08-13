"use client";

import { useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import { Camera, Images } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui-kit";
import { confirmReceiptAction, processReceiptAction } from "@/features/receipts/actions";
import { prepareReceiptFile, receiptPrepareErrorMessage } from "@/lib/prepare-receipt-file";
import { mergeReceiptExtraction } from "@/lib/parse-receipt-text";
import { readReceiptImage } from "@/lib/read-receipt-image";
import { todayISO } from "@/lib/date";
import { PAYMENT_METHOD_LABELS, type ReceiptExtraction } from "@/types";
import { MerchantLogo } from "@/components/merchant/MerchantLogo";

const STEPS = [
  "Lendo o texto da foto...",
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

  function onPick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || file.size === 0) {
      toast.error("Escolha uma foto ou um PDF do comprovante.");
      return;
    }

    setStep(0);
    const timer = window.setInterval(() => {
      setStep((current) => Math.min(current + 1, STEPS.length - 2));
    }, 700);

    start(async () => {
      try {
        const prepared = await prepareReceiptFile(file);
        const formData = new FormData();
        formData.set("file", prepared);
        const [localExtraction, result] = await Promise.all([
          readReceiptImage(prepared),
          processReceiptAction(formData),
        ]);
        window.clearInterval(timer);
        if (!result.success) {
          toast.error(result.error.message);
          return;
        }
        setStep(STEPS.length - 1);
        setScanId(result.data.scanId);
        setExtracted(mergeReceiptExtraction(result.data.extracted, localExtraction));
      } catch (error) {
        window.clearInterval(timer);
        toast.error(receiptPrepareErrorMessage(error));
      }
    });
  }

  return (
    <div className="space-y-3" data-vaul-no-drag="">
      <p className="text-sm text-muted-foreground">
        Tire uma foto agora ou escolha um comprovante da galeria.
      </p>
      <PickerButton
        icon={Camera}
        label="Tirar foto"
        accept="image/*"
        capture="environment"
        disabled={pending}
        onChange={onPick}
      />
      <PickerButton
        icon={Images}
        label="Galeria ou PDF"
        accept="image/*,application/pdf"
        disabled={pending}
        onChange={onPick}
        variant="secondary"
      />
      {pending ? (
        <p className="rounded-2xl bg-secondary px-4 py-3 text-sm">{STEPS[step]}</p>
      ) : null}
    </div>
  );
}

function PickerButton({
  icon: Icon,
  label,
  accept,
  capture,
  disabled,
  onChange,
  variant = "primary",
}: {
  icon: typeof Camera;
  label: string;
  accept: string;
  capture?: "environment";
  disabled: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  variant?: "primary" | "secondary";
}) {
  return (
    <label
      className={
        variant === "primary"
          ? "relative flex h-14 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-2xl bg-primary text-sm font-medium text-primary-foreground has-disabled:pointer-events-none has-disabled:opacity-50"
          : "relative flex h-14 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-2xl bg-secondary text-sm font-medium text-foreground has-disabled:pointer-events-none has-disabled:opacity-50"
      }
      onPointerDown={(event) => event.stopPropagation()}
    >
      <Icon className="size-5" />
      {label}
      <input
        type="file"
        accept={accept}
        capture={capture}
        disabled={disabled}
        onChange={onChange}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
    </label>
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
  const hasExtraction = Boolean(
    extracted.merchant || extracted.amount || extracted.date || extracted.payment_method,
  );
  const detailParts = [
    extracted.date,
    extracted.payment_method ? PAYMENT_METHOD_LABELS[extracted.payment_method] : null,
    extracted.suggested_category,
  ].filter(Boolean);

  return (
    <form
      className="space-y-4"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
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
      {hasExtraction ? (
        <div className="rounded-3xl bg-secondary p-4">
          <p className="text-sm text-muted-foreground">Encontramos estas informações:</p>
          <div className="mt-3 flex items-start gap-3">
            <MerchantLogo
              merchantName={extracted.merchant}
              category={extracted.suggested_category}
              size="lg"
            />
            <div className="min-w-0">
              <p className="font-display text-2xl">{extracted.merchant || "Estabelecimento"}</p>
              <p className="text-lg">{amount ? `R$ ${amount}` : "Valor não identificado"}</p>
              {detailParts.length > 0 ? (
                <p className="text-sm text-muted-foreground">{detailParts.join(" · ")}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-secondary p-4">
          <p className="font-medium">Não conseguimos ler o comprovante automaticamente.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Sem problema: preencha os dados abaixo e o arquivo fica salvo junto do gasto.
          </p>
        </div>
      )}
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
