import { requireAdmin } from "@/lib/admin-auth";
import { syncProductsToAlgolia, isAlgoliaConfigured } from "@/lib/search";
import { getAllProductsForSearch } from "@/services/products";

export async function POST() {
  const auth = await requireAdmin("search");
  if (auth.error) return auth.error;
  if (!isAlgoliaConfigured()) {
    return Response.json(
      { error: "Algolia not configured" },
      { status: 503 }
    );
  }
  const items = await getAllProductsForSearch();
  const result = await syncProductsToAlgolia(items);
  return Response.json(result);
}
