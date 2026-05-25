import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo/site-url";
import { DEFAULT_SEO } from "@/types/storefront-settings";

function resolveImage(image?: string): string {
  const src = image || DEFAULT_SEO.defaultOgImage;
  return src.startsWith("http") ? src : absoluteUrl(src);
}

const MAX_DESCRIPTION = 160;

export function truncateDescription(text: string, max = MAX_DESCRIPTION): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trim()}…`;
}

export function pageMetadata(options: {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const canonical = absoluteUrl(options.path);
  const description = truncateDescription(options.description);
  const image = resolveImage(options.image);

  return {
    title: options.title,
    description,
    alternates: { canonical },
    ...(options.noIndex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: options.title,
      description,
      url: canonical,
      type: "website",
      ...(image ? { images: [{ url: image, alt: options.title }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: options.title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}
