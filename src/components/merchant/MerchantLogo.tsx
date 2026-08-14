"use client";

import { MerchantIcon } from "@/components/merchant/MerchantIcon";

const SIZE_ALIAS = {
  sm: "sm",
  md: "md",
  lg: "lg",
} as const;

export function MerchantLogo({
  merchantName,
  category,
  categorySlug,
  size = "md",
  className,
}: {
  merchantName?: string | null;
  category?: string | null;
  categorySlug?: string | null;
  categoryIcon?: string | null;
  categoryColor?: string | null;
  size?: keyof typeof SIZE_ALIAS;
  className?: string;
  resolved?: unknown;
}) {
  return (
    <MerchantIcon
      name={merchantName ?? ""}
      category={categorySlug ?? category ?? undefined}
      size={size}
      className={className}
    />
  );
}
