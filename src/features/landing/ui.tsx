import { cn } from "@/lib/utils";

export function Section({
  id,
  children,
  className,
  tone = "default",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "soft" | "dark" | "lime";
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 px-4 py-20 md:px-6 md:py-28",
        tone === "default" && "bg-background",
        tone === "soft" && "bg-brand-soft",
        tone === "dark" && "bg-brand-dark text-background",
        tone === "lime" && "bg-primary text-brand-dark",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-sm font-medium tracking-wide text-muted-foreground", className)}>
      {children}
    </p>
  );
}

export function SectionTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={cn("font-display text-[2rem] leading-[1.12] tracking-tight md:text-5xl", className)}>
      {children}
    </h2>
  );
}

export function Lead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg", className)}>
      {children}
    </p>
  );
}
