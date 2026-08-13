import { Logo } from "@/components/brand/logo";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/lib/config";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-secondary px-12 py-10 lg:flex">
        <Logo />
        <div className="max-w-lg">
          <p className="font-display text-5xl leading-[1.05] tracking-tight">{APP_TAGLINE}</p>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">{APP_DESCRIPTION}</p>
        </div>
        <p className="text-sm text-muted-foreground">{APP_NAME} · controle financeiro pessoal</p>
        <div className="pointer-events-none absolute -right-16 -bottom-16 size-80 rounded-full bg-primary/70 blur-3xl" />
      </section>
      <section className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}
