import { algoliasearch } from "algoliasearch";
import { getProducts } from "@/services/products";
import type { Product } from "@/types";

export function isAlgoliaConfigured() {
  return Boolean(
    process.env.ALGOLIA_APP_ID &&
      process.env.ALGOLIA_ADMIN_KEY &&
      process.env.ALGOLIA_INDEX_NAME
  );
}

function getAlgoliaClient() {
  if (!isAlgoliaConfigured()) return null;
  return algoliasearch(
    process.env.ALGOLIA_APP_ID!,
    process.env.ALGOLIA_ADMIN_KEY!
  );
}

export async function searchProducts(query: string, limit = 12): Promise<Product[]> {
  const q = query.trim();
  if (!q) return [];

  if (isAlgoliaConfigured()) {
    try {
      const client = getAlgoliaClient()!;
      const { hits } = await client.searchSingleIndex<{ slug: string }>({
        indexName: process.env.ALGOLIA_INDEX_NAME!,
        searchParams: { query: q, hitsPerPage: limit },
      });
      const slugs = hits.map((h) => h.slug).filter(Boolean);
      if (slugs.length === 0) return [];
      const result = await getProducts({ limit: 50, page: 1 });
      return result.items.filter((p) => slugs.includes(p.slug)).slice(0, limit);
    } catch (e) {
      console.error("[algolia]", e);
    }
  }

  const result = await getProducts({ search: q, limit, page: 1 });
  return result.items;
}

export async function syncProductsToAlgolia(products: Product[]) {
  if (!isAlgoliaConfigured()) return { ok: false, reason: "not_configured" };
  const client = getAlgoliaClient()!;
  await client.saveObjects({
    indexName: process.env.ALGOLIA_INDEX_NAME!,
    objects: products.map((p) => ({
      objectID: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      category: p.category,
      tags: p.tags,
      price: p.price,
      image: p.images[0],
    })),
  });
  return { ok: true, count: products.length };
}
