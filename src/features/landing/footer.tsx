import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { APP_NAME, APP_SLOGAN } from "@/lib/config";

const LINKS = [
  { href: "/#recursos", label: "Produto" },
  { href: "/#recursos", label: "Recursos" },
  { href: "/#seguranca", label: "Segurança" },
  { href: "/privacidade", label: "Privacidade" },
  { href: "/termos", label: "Termos" },
  { href: "/dashboard", label: "Acessar o sistema" },
  { href: "/login", label: "Entrar" },
];

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background px-4 py-12 pb-[max(3rem,env(safe-area-inset-bottom))] md:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">{APP_SLOGAN}</p>
        </div>
        <nav aria-label="Rodapé" className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm md:flex md:flex-wrap md:gap-x-6">
          {LINKS.map((link) => (
            <Link
              key={`${link.href}-${link.label}`}
              href={link.href}
              className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="mx-auto mt-10 max-w-6xl text-xs text-muted-foreground">
        © {year} {APP_NAME}. Controle financeiro pessoal.
      </p>
    </footer>
  );
}
