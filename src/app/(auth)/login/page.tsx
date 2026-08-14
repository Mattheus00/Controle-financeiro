import { LoginForm } from "@/features/auth/auth-forms";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ confirmed?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="rounded-[2rem] bg-card p-6 ring-1 ring-border md:p-8">
      <h1 className="font-display text-3xl tracking-tight">Bem-vindo de volta</h1>
      <p className="mt-2 mb-6 text-muted-foreground">Entre para ver para onde seu dinheiro está indo.</p>
      <LoginForm confirmed={params.confirmed === "1"} confirmError={params.error === "confirm"} />
    </div>
  );
}
