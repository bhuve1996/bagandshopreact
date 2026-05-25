import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site-url";
import { getAllProductSitemapEntries } from "@/lib/seo/sitemap-products";
import { getAllBlogSitemapEntries } from "@/services/blog";
import { getCategories, getCollections } from "@/services/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/collections",
    "/about",
    "/contact",
    "/faq",
    "/shipping",
    "/returns",
    "/privacy",
    "/terms",
    "/blog",
    "/careers",
    "/track-order",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : path === "/collections" ? 0.9 : 0.7,
  }));

  const [categories, collections, products, blogPosts] = await Promise.all([
    getCategories(),
    getCollections(),
    getAllProductSitemapEntries(),
    getAllBlogSitemapEntries(),
  ]);

  const seen = new Set<string>(staticRoutes.map((e) => e.url));

  function pushUnique(
    entries: MetadataRoute.Sitemap,
    path: string,
    opts: Omit<MetadataRoute.Sitemap[number], "url">
  ) {
    const url = `${base}${path}`;
    if (seen.has(url)) return;
    seen.add(url);
    entries.push({ url, ...opts });
  }

  const dynamic: MetadataRoute.Sitemap = [];

  for (const c of categories) {
    pushUnique(dynamic, `/collections/${c.slug}`, {
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    });
  }

  for (const c of collections) {
    pushUnique(dynamic, `/collections/${c.slug}`, {
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.75,
    });
  }

  for (const p of products) {
    pushUnique(dynamic, `/products/${p.slug}`, {
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.9,
    });
  }

  for (const post of blogPosts) {
    pushUnique(dynamic, `/blog/${post.slug}`, {
      lastModified: post.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return [...staticRoutes, ...dynamic];
}
