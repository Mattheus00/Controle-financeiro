import { LandingFooter } from "@/features/landing/footer";
import { LandingHeader } from "@/features/landing/header";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2"
      >
        Ir para o conteúdo
      </a>
      <LandingHeader />
      <main id="conteudo">{children}</main>
      <LandingFooter />
    </div>
  );
}
