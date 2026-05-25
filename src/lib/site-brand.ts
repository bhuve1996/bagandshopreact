import { siteConfig } from "@/lib/site-content";
import { getStorefrontSettings } from "@/services/storefront-settings";
import { DEFAULT_BRAND, type BrandCopy } from "@/types/storefront-settings";

/** Brand strings for metadata and fallbacks when the DB is unavailable. */
export function brandFromSettings(brand: BrandCopy) {
  return {
    name: brand.name,
    tagline: brand.tagline,
    announcement: brand.announcement,
    currency: siteConfig.currency,
  };
}

export async function getSiteBrand() {
  try {
    const settings = await getStorefrontSettings();
    return brandFromSettings(settings.brand);
  } catch {
    return brandFromSettings(DEFAULT_BRAND);
  }
}
