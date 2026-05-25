import { formatSlugTitle } from "@/lib/collection-slugs";

/** Human-readable label for a category slug, preferring DB name when present. */
export function categoryLabel(name: string | undefined, slug: string): string {
  const trimmed = name?.trim();
  if (trimmed && trimmed.toLowerCase() !== slug.toLowerCase()) {
    return trimmed;
  }
  return formatSlugTitle(slug);
}

const NAV_LABEL_OVERRIDES: Record<string, string> = {
  general: "All products",
};

/** Header / nav label — friendlier than raw DB names for edge-case slugs. */
export function navCategoryLabel(name: string | undefined, slug: string): string {
  const override = NAV_LABEL_OVERRIDES[slug];
  if (override) return override;
  return categoryLabel(name, slug);
}
