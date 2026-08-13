"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui-kit";
import { resetPasswordAction } from "@/features/auth/actions";

export default function ResetPasswordPage() {
  const [pending, start] = useTransition();
  return (
    <div className="rounded-[2rem] bg-card p-6 ring-1 ring-border md:p-8">
      <h1 className="font-display text-3xl tracking-tight">Nova senha</h1>
      <form
        className="mt-6 space-y-4"
        action={(formData) => {
          start(async () => {
            await resetPasswordAction(formData);
          });
        }}
      >
        <Field label="Senha" htmlFor="password">
          <Input id="password" name="password" type="password" minLength={8} required className="h-11" />
        </Field>
        <Button type="submit" disabled={pending} className="h-11 w-full rounded-2xl">
          {pending ? "Salvando..." : "Atualizar senha"}
        </Button>
      </form>
    </div>
  );
}
