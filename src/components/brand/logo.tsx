import { APP_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";

type MarkVariant = "color" | "onLime" | "onDark" | "mono";

export function FolioMark({
  className,
  variant = "color",
}: {
  className?: string;
  variant?: MarkVariant;
}) {
  const palette = {
    color: { outer: "#B7E34B", inner: "#0F1F16", vein: "#F9FAF3" },
    onLime: { outer: "#0F1F16", inner: "#0F1F16", vein: "#B7E34B" },
    onDark: { outer: "#F9FAF3", inner: "#F9FAF3", vein: "#0F1F16" },
    mono: { outer: "currentColor", inner: "currentColor", vein: "transparent" },
  }[variant];

  return (
    <svg viewBox="0 0 48 56" className={cn("overflow-visible", className)} aria-hidden="true">
      <path
        d="M24 2.5C37.2 11.4 44.8 24.8 41.6 38.2C39.2 48.2 31.4 53.8 24 55.5C16.6 53.8 8.8 48.2 6.4 38.2C3.2 24.8 10.8 11.4 24 2.5Z"
        fill={palette.outer}
      />
      {variant === "color" ? (
        <path
          d="M24 12.5C33.2 19.2 37.6 29.4 35.4 39.1C33.8 46.2 28.7 51.2 24 53C19.3 51.2 14.2 46.2 12.6 39.1C10.4 29.4 14.8 19.2 24 12.5Z"
          fill={palette.inner}
        />
      ) : null}
      <path
        d="M24 18.5V47"
        fill="none"
        stroke={palette.vein === "transparent" ? "var(--background)" : palette.vein}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({
  className,
  withWordmark = true,
  tone = "light",
}: {
  className?: string;
  withWordmark?: boolean;
  tone?: "light" | "dark" | "lime";
}) {
  const markVariant: MarkVariant = tone === "dark" ? "onDark" : "onLime";
  const wordClass =
    tone === "dark" ? "text-background" : tone === "lime" ? "text-brand-dark" : "text-foreground";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative grid size-9 place-items-center rounded-[0.9rem]",
          tone === "dark" && "bg-background/12 text-background",
          tone === "lime" && "bg-brand-dark text-primary",
          tone === "light" && "bg-primary text-brand-dark",
        )}
      >
        <FolioMark className="size-[1.35rem]" variant={markVariant} />
      </span>
      {withWordmark ? (
        <span className={cn("font-display text-[1.35rem] leading-none tracking-tight", wordClass)}>
          {APP_NAME}
        </span>
      ) : null}
    </span>
  );
}
