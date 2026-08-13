export type MerchantBrand = {
  id: string;
  name: string;
  slug: string;
  logo_path: string | null;
  category_slug: string | null;
  aliases: string[];
  website: string | null;
  background_color: string | null;
  foreground_color: string | null;
  is_verified: boolean;
  is_active: boolean;
};

export type UserMerchantRule = {
  id: string;
  user_id: string;
  merchant_pattern: string;
  custom_name: string | null;
  category_id: string | null;
  custom_icon: string | null;
};

export type MerchantResolution =
  | {
      type: "brand";
      merchantId: string;
      name: string;
      slug: string;
      logoUrl: string | null;
      icon: string | null;
      backgroundColor: string | null;
      foregroundColor: string | null;
    }
  | {
      type: "category";
      merchantId: null;
      name: string;
      logoUrl: null;
      icon: string;
    }
  | {
      type: "initials";
      merchantId: null;
      name: string;
      logoUrl: null;
      icon: null;
      initials: string;
    };

export type ResolveMerchantInput = {
  merchantName?: string | null;
  categorySlug?: string | null;
  categoryIcon?: string | null;
  userRules?: UserMerchantRule[];
};

export type MerchantCatalog = {
  brands: MerchantBrand[];
};
