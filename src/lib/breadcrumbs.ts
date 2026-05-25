import { categoryLabel } from "@/lib/category-label";
import {
  formatSlugTitle,
  getParentCategorySlug,
  normalizeCollectionSlug,
} from "@/lib/collection-slugs";
import type { Category } from "@/types";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function buildProductBreadcrumbs(product: {
  name: string;
  category: string;
  categoryName?: string;
}): BreadcrumbItem[] {
  const categorySlug = product.category;
  return [
    { label: "Home", href: "/" },
    {
      label: categoryLabel(product.categoryName, categorySlug),
      href: `/collections/${categorySlug}`,
    },
    { label: product.name },
  ];
}

export function buildCollectionBreadcrumbs(
  rawSlug: string,
  heading: string,
  categories: Category[]
): BreadcrumbItem[] {
  const slug = normalizeCollectionSlug(rawSlug);
  const parentSlug = getParentCategorySlug(rawSlug);
  const items: BreadcrumbItem[] = [{ label: "Home", href: "/" }];

  if (parentSlug) {
    const parent = categories.find((c) => c.slug === parentSlug);
    items.push({
      label: parent
        ? categoryLabel(parent.name, parent.slug)
        : formatSlugTitle(parentSlug),
      href: `/collections/${parentSlug}`,
    });
  }

  items.push({ label: heading });
  return items;
}
