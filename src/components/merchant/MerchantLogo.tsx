"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "@/components/merchant/CategoryIcon";
import { MerchantInitials } from "@/components/merchant/MerchantInitials";
import { useMerchantCatalog } from "@/features/merchants/merchant-brand-provider";
import {
  fallbackAfterLogoError,
  resolveMerchantBrand,
} from "@/features/merchants/utils/resolveMerchantBrand";
import type { MerchantResolution } from "@/features/merchants/types/merchant";

const SIZE = {
  sm: { box: "size-8 rounded-xl", img: "p-1", px: 32 },
  md: { box: "size-11 rounded-2xl", img: "p-1.5", px: 44 },
  lg: { box: "size-14 rounded-2xl", img: "p-2", px: 56 },
} as const;

export function MerchantLogo({
  merchantName,
  category,
  categorySlug,
  categoryIcon,
  categoryColor,
  size = "md",
  className,
  resolved,
}: {
  merchantName?: string | null;
  category?: string | null;
  categorySlug?: string | null;
  categoryIcon?: string | null;
  categoryColor?: string | null;
  size?: keyof typeof SIZE;
  className?: string;
  resolved?: MerchantResolution;
}) {
  const catalog = useMerchantCatalog();
  const [failed, setFailed] = useState(false);
  const base = useMemo(
    () =>
      resolved ??
      resolveMerchantBrand(
        {
          merchantName,
          categorySlug: categorySlug ?? category,
          categoryIcon,
        },
        catalog,
      ),
    [resolved, merchantName, categorySlug, category, categoryIcon, catalog],
  );
  const current = failed ? fallbackAfterLogoError(base) : base;
  const box = SIZE[size];

  if (current.type === "brand" && current.logoUrl) {
    return (
      <span
        className={cn("grid shrink-0 place-items-center overflow-hidden bg-card ring-1 ring-border", box.box, className)}
        style={{
          backgroundColor: current.backgroundColor ?? undefined,
          color: current.foregroundColor ?? undefined,
        }}
        title={current.name}
      >
        {/* Brand marks are tiny SVGs; img avoids next/image SVG limitations and keeps object-contain. */}
        <img
          src={current.logoUrl}
          alt=""
          width={box.px}
          height={box.px}
          loading="lazy"
          decoding="async"
          className={cn("size-full object-contain", box.img)}
          onError={() => setFailed(true)}
        />
      </span>
    );
  }

  if (current.type === "category" || (current.type === "brand" && current.icon)) {
    const icon = current.type === "category" ? current.icon : current.icon;
    if (icon) {
      return (
        <CategoryIcon
          name={icon}
          color={categoryColor}
          size={size}
          className={className}
        />
      );
    }
  }

  return (
    <MerchantInitials
      name={current.name || merchantName || "?"}
      size={size}
      className={className}
    />
  );
}
