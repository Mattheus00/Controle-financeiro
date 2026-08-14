import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function SettingsSubpage({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/settings"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Perfil
        </Link>
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">{title}</h1>
        {description ? <p className="mt-1 text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}
