import { ShieldCheck } from "lucide-react";
import { LoginForm } from "@/features/auth/auth-forms";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ confirmed?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-border/80 bg-white/85 shadow-[0_24px_80px_rgba(35,51,29,0.08)] backdrop-blur-xl dark:bg-card/90">
      <div className="p-6 sm:p-9">
        <h1 className="text-center font-display text-3xl tracking-[-0.03em] sm:text-[2.15rem]">Bem-vindo de volta</h1>
        <p className="mt-2 mb-7 text-center text-sm text-muted-foreground">
          Entre para ver para onde seu dinheiro está indo.
        </p>
        <LoginForm confirmed={params.confirmed === "1"} confirmError={params.error === "confirm"} />
      </div>
      <div className="flex items-center justify-center gap-2 border-t border-border/70 bg-background/45 px-5 py-5 text-center text-xs text-muted-foreground">
        <ShieldCheck className="size-5 text-[#5f8b27]" aria-hidden />
        <span>Seus dados financeiros são privados e protegidos.</span>
      </div>
    </div>
  );
}
