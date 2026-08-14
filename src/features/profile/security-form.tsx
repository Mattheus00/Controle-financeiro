"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { forgotPasswordAction } from "@/features/auth/actions";

export function SecurityForm({ email }: { email: string }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-3 rounded-3xl bg-card p-5 ring-1 ring-border">
      <p className="text-sm text-muted-foreground">
        Enviamos um link para {email || "seu e-mail"} trocar a senha. O acesso atual continua até você
        concluir o fluxo.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData();
          formData.set("email", email);
          setMessage(null);
          start(async () => {
            const result = await forgotPasswordAction(formData);
            if (!result.success) {
              setMessage(result.error.message);
              return;
            }
            setMessage("Se esse e-mail existir na Folio, o link já foi enviado.");
          });
        }}
      >
        <Button type="submit" disabled={pending || !email} className="h-11 rounded-2xl">
          {pending ? "Enviando..." : "Enviar link para trocar senha"}
        </Button>
      </form>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
