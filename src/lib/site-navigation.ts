import { navCategoryLabel } from "@/lib/category-label";
import type { Category, NavItem } from "@/types";

export type SiteNavigation = {
  /** Primary header links (categories, shop all, collections). */
  items: NavItem[];
  /** Category-only links for the mobile/tablet strip. */
  categoryItems: NavItem[];
};

function categoryToNavItem(category: Category): NavItem {
  const label = navCategoryLabel(category.name, category.slug);
  const href = `/collections/${category.slug}`;

  return {
    label,
    href,
    banner: category.image
      ? {
          title: label,
          subtitle: `${category.productCount} ${
            category.productCount === 1 ? "product" : "products"
          }`,
          image: category.image,
          href,
        }
      : undefined,
  };
}

/** Build header nav from DB categories (no hardcoded collection catalog). */
export function buildSiteNavigation(categories: Category[]): SiteNavigation {
  const active = [...categories]
    .filter((c) => c.productCount > 0)
    .sort((a, b) => b.productCount - a.productCount);

  const categoryItems = active.map(categoryToNavItem);

  const shopChildren = active.map((c) => ({
    label: navCategoryLabel(c.name, c.slug),
    href: `/collections/${c.slug}`,
    productCount: c.productCount,
  }));

  const featured = active[0];
  const shop: NavItem = {
    label: "Shop all",
    href: "/collections",
    children: shopChildren.length > 0 ? shopChildren : undefined,
    banner: featured?.image
      ? {
          title: navCategoryLabel(featured.name, featured.slug),
          subtitle: `${featured.productCount} ${
            featured.productCount === 1 ? "product" : "products"
          }`,
          image: featured.image,
          href: `/collections/${featured.slug}`,
        }
      : undefined,
  };

  const items: NavItem[] = [
    ...categoryItems,
    shop,
    { label: "Best Sellers", href: "/collections/best-sellers" },
    { label: "New Arrivals", href: "/collections/new-arrivals" },
  ];

  return { items, categoryItems };
}
