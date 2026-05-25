import type { PrismaClient } from "../../src/generated/prisma/client";
import { PRODUCT_PLACEHOLDER_IMAGE } from "../../src/lib/product-placeholder";

type BundleSeed = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  kind: "CORPORATE" | "GIFTING";
  minOrderQty: number;
  featured: boolean;
  sortOrder: number;
  priceOverride?: number;
  /** Card image; defaults to brand placeholder (not first product photo). */
  image?: string;
  items: { productSlug: string; quantity: number }[];
};

export async function seedGiftBundles(prisma: PrismaClient, bundles: BundleSeed[]) {
  for (const bundle of bundles) {
    const itemRows: { productId: string; quantity: number }[] = [];
    for (const item of bundle.items) {
      const product = await prisma.product.findUnique({
        where: { slug: item.productSlug },
        select: { id: true },
      });
      if (!product) {
        console.warn(
          `  Skip bundle "${bundle.slug}": product "${item.productSlug}" not found`
        );
        continue;
      }
      itemRows.push({ productId: product.id, quantity: item.quantity });
    }
    if (itemRows.length === 0) continue;

    const image = bundle.image ?? PRODUCT_PLACEHOLDER_IMAGE;

    await prisma.corporateBundle.upsert({
      where: { id: bundle.id },
      update: {
        slug: bundle.slug,
        name: bundle.name,
        description: bundle.description,
        tagline: bundle.tagline,
        image,
        kind: bundle.kind,
        minOrderQty: bundle.minOrderQty,
        featured: bundle.featured,
        sortOrder: bundle.sortOrder,
        priceOverride: bundle.priceOverride ?? null,
        active: true,
      },
      create: {
        id: bundle.id,
        slug: bundle.slug,
        name: bundle.name,
        description: bundle.description,
        tagline: bundle.tagline,
        image,
        kind: bundle.kind,
        minOrderQty: bundle.minOrderQty,
        featured: bundle.featured,
        sortOrder: bundle.sortOrder,
        priceOverride: bundle.priceOverride ?? null,
        active: true,
      },
    });

    await prisma.corporateBundleItem.deleteMany({
      where: { bundleId: bundle.id },
    });
    await prisma.corporateBundleItem.createMany({
      data: itemRows.map((row) => ({
        bundleId: bundle.id,
        productId: row.productId,
        quantity: row.quantity,
      })),
    });
  }
}
