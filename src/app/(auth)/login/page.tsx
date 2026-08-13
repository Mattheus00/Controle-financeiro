import { LoginForm } from "@/features/auth/auth-forms";

export default function LoginPage() {
  return (
    <div className="rounded-[2rem] bg-card p-6 ring-1 ring-border md:p-8">
      <h1 className="font-display text-3xl tracking-tight">Bem-vindo de volta</h1>
      <p className="mt-2 mb-6 text-muted-foreground">Entre para ver para onde seu dinheiro está indo.</p>
      <LoginForm />
    </div>
  );
}
