import { requireAdmin } from "@/lib/admin-auth";
import { syncProductsToAlgolia, isAlgoliaConfigured } from "@/lib/search";
import { getProducts } from "@/services/products";

export async function POST() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  if (!isAlgoliaConfigured()) {
    return Response.json(
      { error: "Algolia not configured" },
      { status: 503 }
    );
  }
  const { items } = await getProducts({ limit: 200, page: 1 });
  const result = await syncProductsToAlgolia(items);
  return Response.json(result);
}
