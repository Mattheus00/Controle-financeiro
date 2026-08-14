"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cancelSubscriptionAction } from "@/features/finance/actions";

export function CancelSubscriptionButton({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      className="h-11 shrink-0 rounded-2xl"
      disabled={pending}
      onClick={() => {
        const confirmed = window.confirm(
          `Cancelar ${name}? Ela sai do total mensal e do gráfico de saídas.`,
        );
        if (!confirmed) return;
        start(async () => {
          const result = await cancelSubscriptionAction(id);
          if (!result.success) {
            toast.error(result.error.message);
            return;
          }
          toast.success("Assinatura cancelada");
        });
      }}
    >
      {pending ? "Cancelando..." : "Cancelar"}
    </Button>
  );
}
