import type { Metadata } from "next";
import { brandAssets } from "@/lib/site-content";
import { getSiteBrand } from "@/lib/site-brand";
import { absoluteUrl } from "@/lib/seo/site-url";
import { truncateDescription } from "@/lib/seo/metadata-helpers";
import { getStorefrontSettings } from "@/services/storefront-settings";
import type { SeoSettings, StorefrontSettings } from "@/types/storefront-settings";

export async function getSeoSettings(): Promise<SeoSettings> {
  const settings = await getStorefrontSettings();
  return settings.seo;
}

export function resolveOgImage(image: string | undefined, seo: SeoSettings): string {
  const src = image || seo.defaultOgImage || brandAssets.logo;
  return src.startsWith("http") ? src : absoluteUrl(src);
}

export async function buildRootMetadata(): Promise<Metadata> {
  const settings = await getStorefrontSettings();
  const brand = await getSiteBrand();
  const seo = settings.seo;
  const title = seo.homeTitle || `${brand.name} — ${brand.tagline}`;
  const description = truncateDescription(seo.defaultDescription);
  const ogImage = resolveOgImage(undefined, seo);

  const { getSiteUrl } = await import("@/lib/seo/site-url");

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: title,
      template: `%s | ${brand.name}`,
    },
    description,
    ...(seo.googleSiteVerification
      ? { verification: { google: seo.googleSiteVerification } }
      : {}),
    robots: seo.allowIndexing
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      type: "website",
      locale: seo.ogLocale,
      siteName: brand.name,
      title,
      description,
      url: absoluteUrl("/"),
      images: [
        {
          url: ogImage,
          width: brandAssets.logoWidth,
          height: brandAssets.logoHeight,
          alt: brand.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      ...(seo.twitterHandle
        ? { site: seo.twitterHandle, creator: seo.twitterHandle }
        : {}),
    },
  };
}

export function findPageOverride(
  settings: StorefrontSettings,
  path: string
) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return settings.seo.pageOverrides.find((p) => p.path === normalized);
}

export async function staticPageMetadata(
  path: string,
  fallback: { title: string; description: string }
): Promise<Metadata> {
  const settings = await getStorefrontSettings();
  const override = findPageOverride(settings, path);
  const seo = settings.seo;

  const { pageMetadata } = await import("@/lib/seo/metadata-helpers");

  return pageMetadata({
    title: override?.title ?? fallback.title,
    description:
      override?.description ?? fallback.description ?? seo.defaultDescription,
    path,
    image: seo.defaultOgImage,
    noIndex: override?.noIndex,
  });
}
