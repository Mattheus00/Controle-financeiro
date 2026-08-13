"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ShoppingCart } from "lucide-react";

const STEPS = [
  "Analisando comprovante...",
  "Identificando valor...",
  "Identificando estabelecimento...",
  "Tudo pronto ✓",
];

export function ReceiptDemo() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const done = step >= STEPS.length - 1;

  useEffect(() => {
    if (reduce) {
      setStep(STEPS.length - 1);
      return;
    }
    const id = window.setInterval(() => {
      setStep((current) => (current >= STEPS.length - 1 ? 0 : current + 1));
    }, 1600);
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <div className="rounded-[2rem] bg-card p-5 ring-1 ring-border shadow-[0_24px_60px_-40px_rgba(15,31,22,0.45)]">
      <div className="flex h-10 items-center rounded-2xl bg-secondary px-4 text-sm font-medium">
        <AnimatePresence mode="wait">
          <motion.span
            key={STEPS[step]}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            {STEPS[step]}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="mt-5 flex items-start gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-primary/50">
          <ShoppingCart className="size-5" />
        </span>
        <div>
          <p className="text-sm text-muted-foreground">Supermercado Verdemar</p>
          <p className="font-display text-4xl tracking-tight">R$ 186,42</p>
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-secondary px-3 py-2">
          <dt className="text-xs text-muted-foreground">Categoria</dt>
          <dd className="font-medium">Alimentação</dd>
        </div>
        <div className="rounded-2xl bg-secondary px-3 py-2">
          <dt className="text-xs text-muted-foreground">Pagamento</dt>
          <dd className="font-medium">PIX</dd>
        </div>
        <div className="rounded-2xl bg-secondary px-3 py-2">
          <dt className="text-xs text-muted-foreground">Data</dt>
          <dd className="font-medium">13 de agosto</dd>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-primary/40 px-3 py-2 text-sm font-medium">
          <Check className="size-4" />
          Informações identificadas
        </div>
      </dl>
      <button
        type="button"
        disabled={!done}
        className="mt-5 h-11 w-full rounded-full bg-primary text-sm font-medium text-primary-foreground transition duration-200 hover:bg-primary-hover disabled:opacity-60"
      >
        Confirmar gasto
      </button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Nada é cadastrado antes da sua confirmação.
      </p>
    </div>
  );
}
