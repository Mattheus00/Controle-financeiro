"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Field } from "@/components/ui-kit";
import { forgotPasswordAction, signInAction, signUpAction } from "@/features/auth/actions";

export function LoginForm() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
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
        <PasswordInput id="password" name="password" autoComplete="current-password" required className="h-11" />
      </Field>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" disabled={pending} className="h-11 w-full rounded-2xl">
        {pending ? "Entrando..." : "Entrar"}
      </Button>
      <div className="flex flex-wrap justify-between gap-3 text-sm">
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
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
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
        <PasswordInput id="password" name="password" minLength={8} required className="h-11" />
      </Field>
      <label className="flex items-start gap-2 text-sm text-muted-foreground">
        <input type="checkbox" name="accepted_privacy" className="mt-0.5 size-5 shrink-0" />
        <span>
          Li e concordo com a{" "}
          <Link href="/privacidade" className="font-medium text-foreground hover:underline">
            Política de Privacidade
          </Link>
          .
        </span>
      </label>
      <label className="flex items-start gap-2 text-sm text-muted-foreground">
        <input type="checkbox" name="accepted_terms" className="mt-0.5 size-5 shrink-0" />
        <span>
          Li e concordo com os{" "}
          <Link href="/termos" className="font-medium text-foreground hover:underline">
            Termos de Uso
          </Link>
          .
        </span>
      </label>
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
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
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
