export type MerchantIconType = "brand" | "merchant-fallback" | "category" | "generic";

export type MerchantIconMatch = {
  icon: string;
  matchedMerchant: string | null;
  type: MerchantIconType;
  lucideIcon: string | null;
};
