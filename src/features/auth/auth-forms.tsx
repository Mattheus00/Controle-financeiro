"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Field } from "@/components/ui-kit";
import { forgotPasswordAction, signInAction, signUpAction } from "@/features/auth/actions";
import { LockKeyhole, Mail } from "lucide-react";

export function LoginForm({
  confirmed,
  confirmError,
}: {
  confirmed?: boolean;
  confirmError?: boolean;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-5"
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
      {confirmed ? (
        <p className="rounded-2xl bg-secondary p-4 text-sm">
          E-mail confirmado. Agora você já pode entrar.
        </p>
      ) : null}
      {confirmError ? (
        <p className="text-sm text-danger">
          Não foi possível confirmar o e-mail. O link pode ter expirado. Peça outro e-mail na tela de cadastro.
        </p>
      ) : null}
      <Field label="E-mail" htmlFor="email">
        <div className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-4 z-10 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            required
            className="h-12 rounded-xl bg-background/40 pl-11"
          />
        </div>
      </Field>
      <Field label="Senha" htmlFor="password">
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute top-1/2 left-4 z-10 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            placeholder="Digite sua senha"
            required
            className="h-12 rounded-xl bg-background/40 pr-12 pl-11"
          />
        </div>
      </Field>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" disabled={pending} className="h-12 w-full rounded-xl text-sm font-semibold shadow-[0_10px_30px_rgba(143,198,55,0.18)]">
        {pending ? "Entrando..." : "Entrar"}
      </Button>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 pt-1 text-sm">
        <Link href="/forgot-password" className="text-center font-medium text-[#507823] transition-colors hover:text-foreground">
          Esqueci a senha
        </Link>
        <span className="h-7 w-px bg-border" aria-hidden />
        <Link href="/signup" className="text-center font-medium text-[#507823] transition-colors hover:text-foreground">
          Criar conta
        </Link>
      </div>
    </form>
  );
}

export function SignUpForm() {
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
          const result = await signUpAction(formData);
          if (result && !result.success) setError(result.error.message);
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
