import type { MetadataRoute } from "next";
import { brandAssets } from "@/lib/site-content";
import { getSiteBrand } from "@/lib/site-brand";
import { getSeoSettings } from "@/lib/seo/config";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const [brand, seo] = await Promise.all([getSiteBrand(), getSeoSettings()]);

  return {
    name: brand.name,
    short_name: brand.name.slice(0, 12),
    description: seo.defaultDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1c1917",
    icons: [
      {
        src: brandAssets.icons.android192,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: brandAssets.icons.android512,
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
