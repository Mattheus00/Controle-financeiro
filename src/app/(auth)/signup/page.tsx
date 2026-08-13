import { SignUpForm } from "@/features/auth/auth-forms";

export default function SignUpPage() {
  return (
    <div className="rounded-[2rem] bg-card p-6 ring-1 ring-border md:p-8">
      <h1 className="font-display text-3xl tracking-tight">Comece em um minuto</h1>
      <p className="mt-2 mb-6 text-muted-foreground">Sem planilha. Sem complicação.</p>
      <SignUpForm />
    </div>
  );
}
