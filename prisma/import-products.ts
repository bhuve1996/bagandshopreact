import "dotenv/config";
import fs from "fs";
import path from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { parseShopifyProductsCsv } from "../src/lib/shopify-csv-parser";
import {
  assignProductImages,
  loadScrapedImageIndex,
  resolveScrapedLocalPath,
} from "../src/lib/scraped-image-index";
import { PrismaClient } from "../src/generated/prisma/client";

import { getPgConnectionString } from "../src/lib/pg-connection";

const pool = new Pool({ connectionString: getPgConnectionString() });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEFAULT_CATEGORY_IMAGE = "/products/_placeholders/category.jpg";

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

  console.log(`Removed ${removed} products not in CSV · cleared collections`);
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

async function main() {
  const csvPath =
    process.argv[2] ??
    path.join(process.cwd(), "data", "products_export.csv");

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found: ${csvPath}`);
    process.exit(1);
  }

  const imageIndex = loadScrapedImageIndex();
  const csv = fs.readFileSync(csvPath, "utf8");
  const { products, categories } = parseShopifyProductsCsv(csv);
  const importSlugs = new Set(products.map((p) => p.slug));

  console.log(
    `Parsed ${products.length} products · scraped handles: ${imageIndex.handleToUrls.size}`
  );

  await purgeStaleCatalog(importSlugs);

  const placeholderDir = path.join(
    process.cwd(),
    "public",
    "products",
    "_placeholders"
  );
  fs.mkdirSync(placeholderDir, { recursive: true });
  const placeholderSrc = path.join(
    process.cwd(),
    "data",
    "scraped-data",
    "assets",
    "images",
    "image_45.jpg"
  );
  if (fs.existsSync(placeholderSrc)) {
    fs.copyFileSync(placeholderSrc, path.join(placeholderDir, "category.jpg"));
  }
  const categoryImage = fs.existsSync(
    path.join(placeholderDir, "category.jpg")
  )
    ? DEFAULT_CATEGORY_IMAGE
    : DEFAULT_CATEGORY_IMAGE;

  for (const cat of categories) {
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
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const categoryId =
      categoryMap[p.categorySlug] ?? categoryMap.general ?? Object.values(categoryMap)[0];
    if (!categoryId) continue;

    const localImages = assignProductImages(imageIndex, p.slug, p.images, i);
    if (localImages.length === 0) {
      console.warn(`No local images for ${p.slug}, skipping`);
      continue;
    }

    const flags = tagFlags(p.tags);
    const hoverImage = localImages[1];

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description.slice(0, 8000),
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        images: localImages,
        hoverImage,
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
        description: p.description.slice(0, 8000),
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        images: localImages,
        hoverImage,
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
      let variantImagePath: string | undefined;
      if (v.image) {
        const local = resolveScrapedLocalPath(imageIndex, v.image);
        if (local && fs.existsSync(local)) {
          const ext = path.extname(local) || ".jpg";
          const safeName = v.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
          const outDir = path.join(imageIndex.publicRoot, p.slug);
          fs.mkdirSync(outDir, { recursive: true });
          const dest = path.join(outDir, `variant-${safeName}${ext}`);
          fs.copyFileSync(local, dest);
          variantImagePath = `/products/${p.slug}/variant-${safeName}${ext}`;
        }
      }
      if (!variantImagePath) variantImagePath = localImages[0];

      await prisma.productVariant.create({
        data: {
          productId: product.id,
          name: v.name,
          color: v.color,
          image: variantImagePath,
          price: v.price,
          compareAtPrice: v.compareAtPrice,
          stock: v.stock,
          sku: v.sku,
        },
      });
    }
    imported++;
    console.log(`  ✓ ${p.slug}`);
  }

  await syncCategoryImages();
  await syncCollections();

  console.log(
    `Done: ${imported} products · ${categories.length} categories · ${MARKETING_COLLECTIONS.length} collections`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
