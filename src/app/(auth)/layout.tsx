import { Logo } from "@/components/brand/logo";
import { APP_DESCRIPTION, APP_NAME, APP_SLOGAN, APP_TAGLINE } from "@/lib/config";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-2">
      <section className="relative hidden min-h-dvh flex-col justify-between overflow-hidden border-r border-border/40 bg-[#f3f7e8] px-[clamp(2.5rem,5vw,5rem)] py-11 lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.9),transparent_30%),radial-gradient(circle_at_75%_58%,rgba(183,227,75,0.22),transparent_38%)]" />
        <Logo className="relative z-10 scale-110 origin-left" />

        <div className="relative z-10 -mt-10 max-w-xl xl:-mt-16">
          <h1 className="max-w-[10ch] font-display text-[clamp(3rem,4.2vw,4.9rem)] leading-[1.04] tracking-[-0.04em] text-brand-dark">
            {APP_TAGLINE}
          </h1>
          <p className="mt-8 text-lg font-semibold text-[#55752a]">{APP_SLOGAN}</p>
          <p className="mt-3 max-w-[29rem] text-base leading-7 text-muted-foreground xl:text-lg xl:leading-8">
            {APP_DESCRIPTION}
          </p>
        </div>

        <p className="relative z-10 text-sm text-muted-foreground">{APP_NAME} · controle financeiro pessoal</p>

        <div className="pointer-events-none absolute right-[-2rem] bottom-[-2rem] h-[22rem] w-[25rem] rotate-[8deg] opacity-75 xl:right-8 xl:h-[26rem] xl:w-[30rem]">
          <div className="absolute top-2 right-0 w-48 rotate-[8deg] rounded-3xl border border-white/70 bg-white/55 p-5 shadow-[0_22px_70px_rgba(62,92,24,0.12)] backdrop-blur-md">
            <p className="text-xs text-muted-foreground">Metas</p>
            <p className="mt-2 font-display text-lg text-brand-dark">Viagem</p>
            <p className="mt-1 text-xs text-muted-foreground">R$ 3.200,00 de 5.000</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-primary/20"><div className="h-full w-2/3 rounded-full bg-primary" /></div>
          </div>
          <div className="absolute top-24 left-4 w-64 -rotate-[3deg] rounded-3xl border border-white/80 bg-white/80 p-5 shadow-[0_24px_80px_rgba(62,92,24,0.15)] backdrop-blur-md">
            <p className="text-xs text-muted-foreground">Gastos do mês</p>
            <p className="mt-2 font-display text-2xl text-brand-dark">R$ 4.356,90</p>
            <p className="mt-1 text-xs text-success">↗ 12% vs. mês anterior</p>
            <svg viewBox="0 0 220 54" className="mt-4 h-12 w-full" aria-hidden="true">
              <path d="M2 43 C22 25, 35 44, 55 35 S88 45, 106 30 S135 39, 156 25 S185 36, 218 5" fill="none" stroke="#8fc637" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="absolute bottom-0 left-[-3rem] w-72 rotate-[5deg] rounded-3xl border border-white/70 bg-white/70 p-5 shadow-[0_24px_80px_rgba(62,92,24,0.13)] backdrop-blur-md">
            <p className="text-xs text-muted-foreground">Categorias</p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div className="space-y-2 text-xs text-muted-foreground">
                <p><span className="mr-2 inline-block size-2 rounded-full bg-[#8fc637]" />Moradia</p>
                <p><span className="mr-2 inline-block size-2 rounded-full bg-[#b8a6e8]" />Alimentação</p>
                <p><span className="mr-2 inline-block size-2 rounded-full bg-[#efad74]" />Transporte</p>
              </div>
              <div className="size-20 rounded-full bg-[conic-gradient(#8fc637_0_34%,#b8a6e8_34%_60%,#efad74_60%_82%,#e7dc62_82%)] [mask:radial-gradient(circle_at_center,transparent_43%,black_45%)]" />
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute -bottom-16 -left-16 size-52 rounded-[55%_35%_60%_40%] bg-[#75934c]/25 blur-xl" />
      </section>

      <section className="relative flex min-h-dvh items-start justify-center overflow-y-auto bg-[#fbfaf6] px-4 py-8 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] sm:items-center sm:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_12%,rgba(255,255,255,0.95),transparent_28%),radial-gradient(circle_at_30%_85%,rgba(183,227,75,0.08),transparent_34%)]" />
        <div className="relative z-10 w-full max-w-[27rem]">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}
