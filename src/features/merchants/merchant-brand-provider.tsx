"use client";

import { createContext, useContext, useMemo } from "react";
import type { MerchantBrand, MerchantCatalog } from "@/features/merchants/types/merchant";

const MerchantBrandContext = createContext<MerchantCatalog>({ brands: [] });

export function MerchantBrandProvider({
  brands,
  children,
}: {
  brands: MerchantBrand[];
  children: React.ReactNode;
}) {
  const catalog = useMemo<MerchantCatalog>(() => ({ brands }), [brands]);
  return <MerchantBrandContext.Provider value={catalog}>{children}</MerchantBrandContext.Provider>;
}

export function useMerchantCatalog() {
  return useContext(MerchantBrandContext);
}
