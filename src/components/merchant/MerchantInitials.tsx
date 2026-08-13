import { cn } from "@/lib/utils";
import { getMerchantInitials } from "@/features/merchants/utils/getMerchantInitials";

const SIZE = {
  sm: "size-8 text-[10px] rounded-xl",
  md: "size-11 text-xs rounded-2xl",
  lg: "size-14 text-sm rounded-2xl",
} as const;

export function MerchantInitials({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: keyof typeof SIZE;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center bg-secondary font-semibold text-foreground",
        SIZE[size],
        className,
      )}
      aria-hidden
    >
      {getMerchantInitials(name)}
    </span>
  );
}
