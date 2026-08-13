"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_LINKS } from "@/features/landing/data";

export function LandingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:h-[4.25rem] md:px-6">
        <Link href="/" aria-label="Folio, página inicial">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground lg:flex" aria-label="Seções">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors duration-200 hover:text-foreground">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="ghost" className="h-10 rounded-full px-4">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild variant="outline" className="h-10 rounded-full px-4">
            <Link href="/signup">Começar grátis</Link>
          </Button>
          <Button asChild className="h-10 rounded-full px-5">
            <Link href="/dashboard">Acessar o sistema</Link>
          </Button>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="size-11 lg:hidden" aria-label="Abrir menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-background pb-[max(1rem,env(safe-area-inset-bottom))]">
            <SheetHeader>
              <SheetTitle className="font-display text-2xl">Folio</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4" aria-label="Menu">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-3 py-3 text-base font-medium hover:bg-secondary"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-2 p-4">
              <Button asChild variant="outline" className="h-11 rounded-full">
                <Link href="/login" onClick={() => setOpen(false)}>
                  Entrar
                </Link>
              </Button>
              <Button asChild variant="secondary" className="h-11 rounded-full">
                <Link href="/signup" onClick={() => setOpen(false)}>
                  Começar grátis
                </Link>
              </Button>
              <Button asChild className="h-11 rounded-full">
                <Link href="/dashboard" onClick={() => setOpen(false)}>
                  Acessar o sistema
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
