import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-3xl border border-dashed border-border bg-card/60 px-5 py-8 sm:px-6 sm:py-10",
        className,
      )}
    >
      <h2 className="font-display text-xl tracking-tight break-words sm:text-2xl">{title}</h2>
      <p className="max-w-md text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function MoneyText({
  cents,
  className,
  tone,
}: {
  cents: number;
  className?: string;
  tone?: "default" | "danger" | "success" | "muted";
}) {
  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);

  return (
    <span
      className={cn(
        "inline-block shrink-0 font-display tracking-tight whitespace-nowrap tabular-nums",
        tone === "danger" && "text-danger",
        tone === "success" && "text-success",
        tone === "muted" && "text-muted-foreground",
        className,
      )}
    >
      {formatted}
    </span>
  );
}

export function PrimaryButton(props: React.ComponentProps<typeof Button>) {
  return <Button size="lg" className={cn("h-11 rounded-2xl px-5 text-sm", props.className)} {...props} />;
}
