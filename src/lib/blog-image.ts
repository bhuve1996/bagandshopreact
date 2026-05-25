const BLOG_COVER_FALLBACK = "/blog/fallback.jpg";

/** Normalizes blog cover URLs for next/image (local paths, uploads, or remote blob/CDN). */
export function resolveBlogCoverImage(src?: string | null): string {
  const trimmed = src?.trim();
  if (!trimmed) return BLOG_COVER_FALLBACK;
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    return trimmed;
  }
  return `/${trimmed}`;
}
