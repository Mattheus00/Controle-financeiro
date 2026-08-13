"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui-kit";
import { forgotPasswordAction, signInAction, signUpAction } from "@/features/auth/actions";

export function LoginForm() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      action={(formData) => {
        setError(null);
        start(async () => {
          const result = await signInAction(formData);
          if (result && !result.success) setError(result.error.message);
        });
      }}
    >
      <Field label="E-mail" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required className="h-11" />
      </Field>
      <Field label="Senha" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" required className="h-11" />
      </Field>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" disabled={pending} className="h-11 w-full rounded-2xl">
        {pending ? "Entrando..." : "Entrar"}
      </Button>
      <div className="flex justify-between text-sm">
        <Link href="/forgot-password" className="text-muted-foreground hover:text-foreground">
          Esqueci a senha
        </Link>
        <Link href="/signup" className="font-medium hover:underline">
          Criar conta
        </Link>
      </div>
    </form>
  );
}

export function SignUpForm() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <p className="rounded-2xl bg-secondary p-4 text-sm">
        Conta criada. Se o projeto exigir confirmação, olhe seu e-mail. Depois disso, é só entrar.
      </p>
    );
  }

  return (
    <form
      className="space-y-4"
      action={(formData) => {
        setError(null);
        start(async () => {
          const result = await signUpAction(formData);
          if (!result.success) {
            setError(result.error.message);
            return;
          }
          setDone(true);
        });
      }}
    >
      <Field label="Nome" htmlFor="name">
        <Input id="name" name="name" required className="h-11" />
      </Field>
      <Field label="E-mail" htmlFor="email">
        <Input id="email" name="email" type="email" required className="h-11" />
      </Field>
      <Field label="Senha" htmlFor="password">
        <Input id="password" name="password" type="password" minLength={8} required className="h-11" />
      </Field>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" disabled={pending} className="h-11 w-full rounded-2xl">
        {pending ? "Criando..." : "Criar conta"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);

  if (done) {
    return <p className="rounded-2xl bg-secondary p-4 text-sm">Se o e-mail existir, enviamos o link de recuperação.</p>;
  }

  return (
    <form
      className="space-y-4"
      action={(formData) => {
        start(async () => {
          await forgotPasswordAction(formData);
          setDone(true);
        });
      }}
    >
      <Field label="E-mail" htmlFor="email">
        <Input id="email" name="email" type="email" required className="h-11" />
      </Field>
      <Button type="submit" disabled={pending} className="h-11 w-full rounded-2xl">
        {pending ? "Enviando..." : "Enviar link"}
      </Button>
    </form>
  );
}
