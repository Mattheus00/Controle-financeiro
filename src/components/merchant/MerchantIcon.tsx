"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "@/components/merchant/CategoryIcon";
import { MerchantInitials } from "@/components/merchant/MerchantInitials";
import { fallbackMerchantIcon, getMerchantIcon } from "@/lib/icons/get-merchant-icon";
import { isAllowedPublicIconPath } from "@/lib/icons/allowed-icon-path";

const PRESET = {
  sm: { px: 32, box: "size-8 rounded-xl", img: "p-1" },
  md: { px: 44, box: "size-11 rounded-2xl", img: "p-1.5" },
  lg: { px: 56, box: "size-14 rounded-2xl", img: "p-2" },
} as const;

type PresetSize = keyof typeof PRESET;

export interface MerchantIconProps {
  name: string;
  category?: string;
  size?: number | PresetSize;
  className?: string;
}

function resolveSize(size: MerchantIconProps["size"] = "md") {
  if (size === "sm" || size === "md" || size === "lg") return PRESET[size];
  const px = size ?? 44;
  const box =
    px <= 32 ? "size-8 rounded-xl" : px >= 52 ? "size-14 rounded-2xl" : "size-11 rounded-2xl";
  const img = px <= 32 ? "p-1" : "p-1.5";
  return { px, box, img };
}

export function MerchantIcon({ name, category, size = "md", className }: MerchantIconProps) {
  const match = useMemo(() => getMerchantIcon(name, category), [name, category]);
  const [failCount, setFailCount] = useState(0);
  const current = failCount === 0 ? match : fallbackMerchantIcon(match, category);
  const box = resolveSize(size);

  useEffect(() => {
    setFailCount(0);
  }, [name, category, match.icon]);

  const showImage =
    failCount < 2 &&
    (current.type === "brand" || current.type === "merchant-fallback" || current.type === "category") &&
    isAllowedPublicIconPath(current.icon);

  if (showImage) {
    return (
      <span
        className={cn("grid shrink-0 place-items-center overflow-hidden bg-card ring-1 ring-border", box.box, className)}
        title={name}
      >
        <img
          src={current.icon}
          alt=""
          width={box.px}
          height={box.px}
          loading="lazy"
          decoding="async"
          className={cn("size-full object-contain", box.img)}
          onError={() => setFailCount((count) => count + 1)}
        />
      </span>
    );
  }

  if (current.lucideIcon) {
    return <CategoryIcon name={current.lucideIcon} size={box.px <= 32 ? "sm" : box.px >= 52 ? "lg" : "md"} className={className} />;
  }

  return <MerchantInitials name={name || "?"} size={box.px <= 32 ? "sm" : box.px >= 52 ? "lg" : "md"} className={className} />;
}
