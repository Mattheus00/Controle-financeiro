"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markBillPaidAction } from "@/features/finance/actions";

export function PayBillButton({ id }: { id: string }) {
  const [pending, start] = useTransition();

  return (
    <Button
      variant="outline"
      className="h-11 min-w-11 shrink-0 rounded-2xl"
      disabled={pending}
      onClick={() => {
        const createExpense = window.confirm("Marcar como pago e criar uma despesa automaticamente?");
        start(async () => {
          const result = await markBillPaidAction(id, createExpense);
          if (!result.success) {
            toast.error(result.error.message);
            return;
          }
          toast.success("Conta marcada como paga");
        });
      }}
    >
      Pago
    </Button>
  );
}
