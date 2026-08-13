import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function MockFrame({
  children,
  className,
  title = "Folio",
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[2rem] bg-card ring-1 ring-border shadow-[0_28px_80px_-48px_rgba(15,31,22,0.55)]",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        <span className="size-2.5 rounded-full bg-border" />
        <span className="size-2.5 rounded-full bg-border" />
        <span className="size-2.5 rounded-full bg-primary" />
        <span className="ml-2 text-xs font-medium text-muted-foreground">{title}</span>
      </div>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  hintTone = "muted",
}: {
  label: string;
  value: string;
  hint?: string;
  hintTone?: "muted" | "up" | "down";
}) {
  return (
    <div className="rounded-3xl bg-card p-4 ring-1 ring-border">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl tracking-tight md:text-[1.7rem]">{value}</p>
      {hint ? (
        <p
          className={cn(
            "mt-1 text-xs font-medium",
            hintTone === "up" && "text-success",
            hintTone === "down" && "text-danger",
            hintTone === "muted" && "text-muted-foreground",
          )}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function TxRow({
  name,
  amount,
  icon: Icon,
  category,
  tint = "bg-secondary",
}: {
  name: string;
  amount: string;
  icon: LucideIcon;
  category?: string;
  tint?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={cn("grid size-10 place-items-center rounded-2xl text-foreground", tint)}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        {category ? <p className="text-xs text-muted-foreground">{category}</p> : null}
      </div>
      <p className="text-sm font-medium tabular-nums">{amount}</p>
    </div>
  );
}

export function Sparkline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 280 88" className={cn("h-20 w-full overflow-visible", className)} aria-hidden="true">
      <path
        d="M4 64 C36 60, 48 28, 78 34 C108 40, 118 70, 150 52 C182 34, 196 18, 228 24 C248 28, 262 40, 276 22"
        fill="none"
        stroke="var(--brand-soft)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        className="folio-sparkline"
        d="M4 64 C36 60, 48 28, 78 34 C108 40, 118 70, 150 52 C182 34, 196 18, 228 24 C248 28, 262 40, 276 22"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BarChart({ className }: { className?: string }) {
  const bars = [42, 68, 55, 80, 48, 72, 90];
  return (
    <div className={cn("flex h-28 items-end gap-2", className)} aria-hidden="true">
      {bars.map((height, index) => (
        <div key={height} className="flex h-full flex-1 items-end">
          <div
            className="folio-bar w-full rounded-full bg-primary"
            style={{ height: `${height}%`, animationDelay: `${index * 70}ms` }}
          />
        </div>
      ))}
    </div>
  );
}

export function ProgressLine({ percent, className }: { percent: number; className?: string }) {
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-secondary", className)}>
      <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${percent}%` }} />
    </div>
  );
}
