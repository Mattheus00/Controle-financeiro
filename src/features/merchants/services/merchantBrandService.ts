import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { MerchantBrand, MerchantCatalog, ResolveMerchantInput } from "@/features/merchants/types/merchant";
import { logError } from "@/lib/privacy/sanitize-log";
import { resolveMerchantBrand } from "@/features/merchants/utils/resolveMerchantBrand";

export const getMerchantBrandCatalog = cache(async function getMerchantBrandCatalog(
  supabase: SupabaseClient<Database>,
): Promise<MerchantCatalog> {
  const { data, error } = await supabase
    .from("merchant_brands")
    .select(
      "id, name, slug, logo_path, category_slug, aliases, website, background_color, foreground_color, is_verified, is_active",
    )
    .eq("is_active", true);

  if (error) {
    logError("merchant_brands catalog", error.message);
    return { brands: [] };
  }

  const brands = (data ?? []).map((row) => ({
    ...row,
    aliases: row.aliases ?? [],
  })) as MerchantBrand[];

  return { brands };
});

export async function resolveMerchantBrandCached(
  supabase: SupabaseClient<Database>,
  input: ResolveMerchantInput,
) {
  const catalog = await getMerchantBrandCatalog(supabase);
  return resolveMerchantBrand(input, catalog);
}
