import type { MetadataRoute } from "next";
import { getCollections, getCategories, getProducts } from "@/services/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/collections",
    "/search",
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
    "/wishlist",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const [categories, collections, { items: products }] = await Promise.all([
    getCategories(),
    getCollections(),
    getProducts({ limit: 100, page: 1 }),
  ]);

  const categoryUrls = categories.map((c) => ({
    url: `${base}/collections/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const collectionUrls = collections.map((c) => ({
    url: `${base}/collections/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const productUrls = products.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...categoryUrls, ...collectionUrls, ...productUrls];
}
