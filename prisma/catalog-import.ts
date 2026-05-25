import "dotenv/config";
import fs from "fs";
import path from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";

import { getPgConnectionString } from "../src/lib/pg-connection";

const pool = new Pool({ connectionString: getPgConnectionString() });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEFAULT_CATEGORY_IMAGE = "/products/_placeholders/category.jpg";
const CATALOG_PATH = path.join(process.cwd(), "prisma", "catalog.json");
const PRODUCTS_PUBLIC = path.join(process.cwd(), "public", "products");

type CatalogVariant = {
  name: string;
  color: string | null;
  price: number;
  compareAtPrice: number | null;
  sku: string | null;
  stock: number;
  image: string;
};

type CatalogProduct = {
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  categorySlug: string;
  tags: string[];
  images: string[];
  hoverImage: string | null;
  variants: CatalogVariant[];
};

type Catalog = {
  categories: { slug: string; name: string; description: string }[];
  products: CatalogProduct[];
};

const MARKETING_COLLECTIONS = [
  {
    slug: "best-sellers",
    name: "Best Sellers",
    description: "Customer favorites from our catalog",
  },
  {
    slug: "new-arrivals",
    name: "New Arrivals",
    description: "Fresh picks from Bag & Shop",
  },
  {
    slug: "work-anywhere",
    name: "Work From Anywhere",
    description: "Desk, bags & tech for modern work",
  },
  {
    slug: "gift-sets",
    name: "Gift Sets",
    description: "Curated gifts ready to delight",
  },
] as const;

function loadCatalog(): Catalog {
  if (!fs.existsSync(CATALOG_PATH)) {
    throw new Error(`Catalog not found: ${CATALOG_PATH}`);
  }
  return JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8")) as Catalog;
}

function imageSortKey(filename: string): number {
  if (filename.startsWith("main.")) return 0;
  if (filename.startsWith("gallery-")) {
    return 1 + parseInt(filename.match(/gallery-(\d+)/)?.[1] ?? "99", 10);
  }
  if (filename.startsWith("variant-")) return 200;
  return 50;
}

/** Resolve gallery images from committed files under public/products/{slug}/ */
function discoverProductImages(slug: string): string[] {
  const dir = path.join(PRODUCTS_PUBLIC, slug);
  if (!fs.existsSync(dir)) return [];

  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp|gif|svg|avif)$/i.test(f))
    .filter((f) => !f.startsWith("variant-"))
    .sort((a, b) => imageSortKey(a) - imageSortKey(b) || a.localeCompare(b));

  return files.map((f) => `/products/${slug}/${f}`);
}

function resolveProductImages(product: CatalogProduct): string[] {
  const existing = product.images.filter((url) => {
    const rel = url.replace(/^\/products\//, "");
    return fs.existsSync(path.join(PRODUCTS_PUBLIC, rel));
  });
  if (existing.length > 0) return existing;
  return discoverProductImages(product.slug);
}

function tagFlags(tags: string[]) {
  const joined = tags.join(" ");
  return {
    isNew:
      joined.includes("new") ||
      joined.includes("arrival") ||
      joined.includes("latest"),
    isBestseller:
      joined.includes("best") ||
      joined.includes("bestseller") ||
      joined.includes("popular"),
  };
}

async function purgeStaleCatalog(importSlugs: Set<string>) {
  const orderProductIds = new Set(
    (
      await prisma.orderItem.findMany({
        select: { productId: true },
        distinct: ["productId"],
      })
    ).map((o) => o.productId)
  );

  const existing = await prisma.product.findMany({
    select: { id: true, slug: true },
  });

  let removed = 0;
  for (const row of existing) {
    if (importSlugs.has(row.slug)) continue;
    if (orderProductIds.has(row.id)) {
      console.warn(`  · keeping legacy product (orders exist): ${row.slug}`);
      continue;
    }
    await prisma.wishlistItem.deleteMany({ where: { productId: row.id } });
    await prisma.review.deleteMany({ where: { productId: row.id } });
    await prisma.productVariant.deleteMany({ where: { productId: row.id } });
    await prisma.product.delete({ where: { id: row.id } });
    removed++;
  }

  await prisma.category.deleteMany({
    where: { products: { none: {} } },
  });

  await prisma.collection.deleteMany({});

  console.log(`Removed ${removed} products not in catalog · cleared collections`);
}

async function syncCollections() {
  const all = await prisma.product.findMany({
    select: {
      id: true,
      slug: true,
      images: true,
      category: { select: { slug: true } },
      isNew: true,
      isBestseller: true,
      tags: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (all.length === 0) return;

  const pickImage = (predicate: (p: (typeof all)[0]) => boolean) => {
    const p = all.find(predicate);
    return p?.images[0] ?? all[0].images[0];
  };

  for (const col of MARKETING_COLLECTIONS) {
    let image = all[0].images[0];
    if (col.slug === "best-sellers") {
      image = pickImage((p) => p.isBestseller) ?? image;
    } else if (col.slug === "new-arrivals") {
      image = pickImage((p) => p.isNew) ?? image;
    } else if (col.slug === "work-anywhere") {
      image =
        pickImage((p) =>
          ["desk", "bags", "tech", "travel"].includes(p.category.slug)
        ) ?? image;
    } else if (col.slug === "gift-sets") {
      image =
        pickImage((p) =>
          p.tags.some((t) => t.includes("gift") || t.includes("set"))
        ) ?? image;
    }

    await prisma.collection.create({
      data: {
        slug: col.slug,
        name: col.name,
        description: col.description,
        image,
      },
    });
  }

  const workSlugs = new Set(["desk", "bags", "tech", "travel"]);
  for (const p of all) {
    const flags = tagFlags(p.tags);
    let collectionSlug: string | null = null;
    if (flags.isBestseller) collectionSlug = "best-sellers";
    else if (flags.isNew) collectionSlug = "new-arrivals";
    else if (workSlugs.has(p.category.slug)) collectionSlug = "work-anywhere";
    else if (
      p.tags.some((t) => t.includes("gift") || t.includes("set"))
    ) {
      collectionSlug = "gift-sets";
    }

    await prisma.product.update({
      where: { id: p.id },
      data: {
        isNew: flags.isNew,
        isBestseller: flags.isBestseller,
        collectionSlug,
      },
    });
  }

  const topRated = [...all]
    .filter((p) => !p.isBestseller)
    .slice(0, 6);
  for (const p of topRated) {
    await prisma.product.update({
      where: { id: p.id },
      data: { isBestseller: true, collectionSlug: "best-sellers" },
    });
  }

  const newest = [...all]
    .filter((p) => !p.isNew)
    .slice(0, 6);
  for (const p of newest) {
    await prisma.product.update({
      where: { id: p.id },
      data: { isNew: true, collectionSlug: "new-arrivals" },
    });
  }
}

async function syncCategoryImages() {
  const categories = await prisma.category.findMany({
    include: { products: { take: 1, orderBy: { createdAt: "desc" } } },
  });
  for (const cat of categories) {
    const img = cat.products[0]?.images[0];
    if (img) {
      await prisma.category.update({
        where: { id: cat.id },
        data: { image: img },
      });
    }
  }
}

/** Upsert catalog from prisma/catalog.json + public/products into Postgres. */
export async function importCatalogFromRepo() {
  const catalog = loadCatalog();
  const importSlugs = new Set(catalog.products.map((p) => p.slug));

  console.log(
    `Catalog: ${catalog.products.length} products · ${catalog.categories.length} categories`
  );

  await purgeStaleCatalog(importSlugs);

  const categoryImage = fs.existsSync(
    path.join(PRODUCTS_PUBLIC, "_placeholders", "category.jpg")
  )
    ? DEFAULT_CATEGORY_IMAGE
    : DEFAULT_CATEGORY_IMAGE;

  for (const cat of catalog.categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: {
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        image: categoryImage,
      },
    });
  }

  const categoryMap = Object.fromEntries(
    (await prisma.category.findMany()).map((c) => [c.slug, c.id])
  );

  let imported = 0;
  for (const p of catalog.products) {
    const categoryId =
      categoryMap[p.categorySlug] ??
      categoryMap.general ??
      Object.values(categoryMap)[0];
    if (!categoryId) continue;

    const localImages = resolveProductImages(p);
    if (localImages.length === 0) {
      console.warn(`No images in public/products/${p.slug}, skipping`);
      continue;
    }

    const flags = tagFlags(p.tags);
    const hoverImage = p.hoverImage ?? localImages[1] ?? null;

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? undefined,
        images: localImages,
        hoverImage: hoverImage ?? undefined,
        tags: p.tags,
        categoryId,
        stock: 100,
        isNew: flags.isNew,
        isBestseller: flags.isBestseller,
        collectionSlug: null,
        collectionId: null,
      },
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? undefined,
        images: localImages,
        hoverImage: hoverImage ?? undefined,
        tags: p.tags,
        rating: 4.5,
        reviewCount: 0,
        categoryId,
        stock: 100,
        isNew: flags.isNew,
        isBestseller: flags.isBestseller,
      },
    });

    await prisma.productVariant.deleteMany({ where: { productId: product.id } });

    for (const v of p.variants) {
      const variantPath = v.image
        ? path.join(process.cwd(), "public", v.image.replace(/^\//, ""))
        : null;
      const variantImage =
        variantPath && fs.existsSync(variantPath) ? v.image : localImages[0];

      await prisma.productVariant.create({
        data: {
          productId: product.id,
          name: v.name,
          color: v.color ?? undefined,
          image: variantImage,
          price: v.price,
          compareAtPrice: v.compareAtPrice ?? undefined,
          stock: v.stock,
          sku: v.sku ?? undefined,
        },
      });
    }
    imported++;
    console.log(`  ✓ ${p.slug}`);
  }

  await syncCategoryImages();
  await syncCollections();

  console.log(
    `Catalog import: ${imported} products · ${catalog.categories.length} categories · ${MARKETING_COLLECTIONS.length} collections`
  );
}

export async function disconnectCatalogImport() {
  await prisma.$disconnect();
  await pool.end();
}
