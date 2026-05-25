import { isDatabaseReady } from "@/lib/db-ready";
import { getPrisma } from "@/lib/prisma";

const SITEMAP_PAGE_SIZE = 500;

export type SitemapProductEntry = {
  slug: string;
  updatedAt: Date;
};

/** Loads every product slug for sitemap generation (paginated DB reads). */
export async function getAllProductSitemapEntries(): Promise<
  SitemapProductEntry[]
> {
  if (!(await isDatabaseReady())) return [];

  const prisma = getPrisma();
  const entries: SitemapProductEntry[] = [];
  let page = 1;

  while (true) {
    const batch = await prisma.product.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * SITEMAP_PAGE_SIZE,
      take: SITEMAP_PAGE_SIZE,
    });
    entries.push(...batch);
    if (batch.length < SITEMAP_PAGE_SIZE) break;
    page += 1;
  }

  return entries;
}
