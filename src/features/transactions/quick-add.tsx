"use client";

import { useState, useTransition, type FormEvent, type MouseEvent } from "react";
import { Camera, Plus, Repeat, Wallet, ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui-kit";
import { createQuickExpenseAction, createTransactionAction, createBillAction } from "@/features/finance/actions";
import { ReceiptCapture } from "@/features/receipts/receipt-capture";
import { ExpensePaymentFields } from "@/features/transactions/payment-fields";
import { todayISO } from "@/lib/date";
import { useMediaQuery } from "@/hooks/use-media-query";

type Mode = "menu" | "expense" | "income" | "scan" | "bill" | "transfer";

export function QuickAdd() {
  return <QuickAddControl variant="fab" />;
}

export function DesktopQuickAdd() {
  return <QuickAddControl variant="button" />;
}

function QuickAddControl({ variant }: { variant: "fab" | "button" }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("menu");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  function close() {
    setOpen(false);
    setTimeout(() => setMode("menu"), 200);
  }

  function openSheet(event: MouseEvent<HTMLButtonElement>) {
    event.currentTarget.blur();
    setOpen(true);
  }

  const trigger =
    variant === "fab" ? (
      <button
        type="button"
        onClick={openSheet}
        className="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_30px_-10px_oklch(0.72_0.18_125)] transition hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring"
        aria-label="Novo lançamento"
      >
        <Plus className="size-7" />
      </button>
    ) : (
      <Button size="lg" className="h-11 rounded-2xl px-4" onClick={openSheet}>
        <Plus className="size-4" />
        Novo gasto
      </Button>
    );

  const body = (
    <QuickAddBody mode={mode} setMode={setMode} onClose={close} />
  );

  if (isDesktop) {
    return (
      <>
        {trigger}
        <Dialog open={open} onOpenChange={(value) => (value ? setOpen(true) : close())}>
          <DialogContent className="max-h-[85vh] overflow-y-auto rounded-3xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{titleFor(mode)}</DialogTitle>
            </DialogHeader>
            {body}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      {trigger}
      <Drawer open={open} onOpenChange={(value) => (value ? setOpen(true) : close())}>
        <DrawerContent className="flex max-h-[min(92dvh,100%)] flex-col rounded-t-3xl data-[vaul-drawer-direction=bottom]:max-h-[min(92dvh,100%)]">
          <DrawerHeader>
            <DrawerTitle>{titleFor(mode)}</DrawerTitle>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">{body}</div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function titleFor(mode: Mode) {
  switch (mode) {
    case "expense":
      return "Quanto você gastou?";
    case "income":
      return "Nova receita";
    case "scan":
      return "Escanear comprovante";
    case "bill":
      return "Nova conta";
    case "transfer":
      return "Transferência";
    default:
      return "Adicionar";
  }
}

function QuickAddBody({
  mode,
  setMode,
  onClose,
}: {
  mode: Mode;
  setMode: (mode: Mode) => void;
  onClose: () => void;
}) {
  if (mode === "menu") {
    return (
      <div className="grid gap-2">
        <MenuButton icon={Plus} label="Novo gasto" onClick={() => setMode("expense")} />
        <MenuButton icon={Wallet} label="Nova receita" onClick={() => setMode("income")} />
        <MenuButton icon={Camera} label="Escanear comprovante" onClick={() => setMode("scan")} />
        <MenuButton icon={Repeat} label="Nova conta" onClick={() => setMode("bill")} />
        <MenuButton icon={ArrowLeftRight} label="Transferência" onClick={() => setMode("transfer")} />
      </div>
    );
  }

  if (mode === "scan") {
    return <ReceiptCapture onDone={onClose} />;
  }

  if (mode === "expense") {
    return <ExpenseForm onDone={onClose} />;
  }

  if (mode === "income") {
    return <SimpleTransactionForm type="income" onDone={onClose} />;
  }

  if (mode === "transfer") {
    return <SimpleTransactionForm type="transfer" onDone={onClose} />;
  }

  return <BillForm onDone={onClose} />;
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Plus;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-12 items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-muted"
    >
      <span className="grid size-10 place-items-center rounded-2xl bg-secondary">
        <Icon className="size-4" />
      </span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

function ExpenseForm({ onDone }: { onDone: () => void }) {
  const [pending, start] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        start(async () => {
          const result = await createQuickExpenseAction(formData);
          if (!result.success) {
            toast.error(result.error.message);
            return;
          }
          toast.success("Gasto registrado");
          onDone();
        });
      }}
    >
      <Field label="Valor" htmlFor="amount">
        <Input id="amount" name="amount" inputMode="decimal" placeholder="R$ 0,00" required className="h-14 text-2xl font-display" />
      </Field>
      <Field label="Onde?" htmlFor="merchant">
        <Input id="merchant" name="merchant" placeholder="Padaria, Uber, mercado..." className="h-11" />
      </Field>
      <Field label="Descrição" htmlFor="description">
        <Input id="description" name="description" placeholder="Opcional" className="h-11" />
      </Field>
      <ExpensePaymentFields />
      <Field label="Data" htmlFor="date">
        <Input id="date" name="date" type="date" defaultValue={todayISO()} className="h-11" />
      </Field>
      <Button type="submit" disabled={pending} className="h-11 w-full rounded-2xl">
        {pending ? "Salvando..." : "Registrar gasto"}
      </Button>
    </form>
  );
}

function SimpleTransactionForm({
  type,
  onDone,
}: {
  type: "income" | "transfer";
  onDone: () => void;
}) {
  const [pending, start] = useTransition();
  return (
    <form
      className="space-y-4"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        formData.set("type", type);
        start(async () => {
          const result = await createTransactionAction(formData);
          if (!result.success) {
            toast.error(result.error.message);
            return;
          }
          toast.success(type === "income" ? "Receita registrada" : "Transferência registrada");
          onDone();
        });
      }}
    >
      <input type="hidden" name="type" value={type} />
      <Field label="Valor" htmlFor={`${type}-amount`}>
        <Input id={`${type}-amount`} name="amount" inputMode="decimal" placeholder="R$ 0,00" required className="h-14 text-2xl font-display" />
      </Field>
      <Field label="Descrição" htmlFor={`${type}-description`}>
        <Input id={`${type}-description`} name="description" required className="h-11" placeholder={type === "income" ? "Salário" : "Transferência"} />
      </Field>
      <Field label="Data" htmlFor={`${type}-date`}>
        <Input id={`${type}-date`} name="date" type="date" defaultValue={todayISO()} className="h-11" />
      </Field>
      <Button type="submit" disabled={pending} className="h-11 w-full rounded-2xl">
        {pending ? "Salvando..." : "Confirmar"}
      </Button>
    </form>
  );
}

function BillForm({ onDone }: { onDone: () => void }) {
  const [pending, start] = useTransition();
  return (
    <form
      className="space-y-4"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        start(async () => {
          const result = await createBillAction(formData);
          if (!result.success) {
            toast.error(result.error.message);
            return;
          }
          toast.success("Conta criada");
          onDone();
        });
      }}
    >
      <Field label="Nome" htmlFor="bill-name">
        <Input id="bill-name" name="name" required className="h-11" placeholder="Netflix, energia..." />
      </Field>
      <Field label="Valor" htmlFor="bill-amount">
        <Input id="bill-amount" name="amount" inputMode="decimal" required className="h-11" placeholder="R$ 0,00" />
      </Field>
      <Field label="Vencimento" htmlFor="due_date">
        <Input id="due_date" name="due_date" type="date" defaultValue={todayISO()} className="h-11" />
      </Field>
      <Field label="Observações" htmlFor="notes">
        <Textarea id="notes" name="notes" />
      </Field>
      <Button type="submit" disabled={pending} className="h-11 w-full rounded-2xl">
        {pending ? "Salvando..." : "Criar conta"}
      </Button>
    </form>
  );
}
