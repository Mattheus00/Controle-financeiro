import { APP_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";

export function Logo({ className, withWordmark = true }: { className?: string; withWordmark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative grid size-9 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_8px_20px_-12px_oklch(0.72_0.18_125)]">
        <svg viewBox="0 0 32 32" className="size-5" aria-hidden="true">
          <path
            d="M16 4c6 3 10 8 10 14 0 6-4 10-10 10S6 24 6 18C6 12 10 7 16 4Z"
            fill="currentColor"
            opacity="0.92"
          />
          <path
            d="M16 9c.4 4 2.2 7.4 5 10"
            fill="none"
            stroke="oklch(0.22 0.06 145)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {withWordmark ? (
        <span className="font-display text-xl tracking-tight text-foreground">{APP_NAME}</span>
      ) : null}
    </span>
  );
}
