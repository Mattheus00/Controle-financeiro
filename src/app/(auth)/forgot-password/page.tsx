import { ForgotPasswordForm } from "@/features/auth/auth-forms";

export default function ForgotPasswordPage() {
  return (
    <div className="rounded-[2rem] bg-card p-6 ring-1 ring-border md:p-8">
      <h1 className="font-display text-3xl tracking-tight">Recuperar senha</h1>
      <p className="mt-2 mb-6 text-muted-foreground">Enviamos um link para o seu e-mail.</p>
      <ForgotPasswordForm />
    </div>
  );
}
