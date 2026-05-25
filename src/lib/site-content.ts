/**
 * Static fallbacks for metadata and offline use.
 * Live brand, homepage headings, and UI labels are edited in Admin → Content & labels.
 */
export const siteConfig = {
  name: "Bag & Shop",
  tagline: "Design-led lifestyle accessories",
  announcement: "Free shipping on orders above ₹999 · Shop the latest drops",
  currency: "INR",
};

const BRAND_BASE = "/bagnshop_brand_assets";

/** Favicons, logos, and PWA icons served from `public/bagnshop_brand_assets/`. */
export const brandAssets = {
  logo: `${BRAND_BASE}/primary-logo.png`,
  logoWidth: 1200,
  logoHeight: 400,
  icons: {
    icon16: `${BRAND_BASE}/favicon-16x16.png`,
    icon32: `${BRAND_BASE}/favicon-32x32.png`,
    icon64: `${BRAND_BASE}/favicon-64x64.png`,
    icon128: `${BRAND_BASE}/favicon-128x128.png`,
    icon256: `${BRAND_BASE}/favicon-256x256.png`,
    icon512: `${BRAND_BASE}/favicon-512x512.png`,
    apple: `${BRAND_BASE}/apple-touch-icon.png`,
    android192: `${BRAND_BASE}/android-icon-192.png`,
    android512: `${BRAND_BASE}/android-icon-512.png`,
  },
} as const;
