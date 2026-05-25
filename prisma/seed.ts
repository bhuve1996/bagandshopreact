import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { importCatalogFromRepo } from "./catalog-import";
import { seedBlogPosts } from "./seed-data/blog-posts";
import { seedSiteVideos } from "./seed-data/site-videos";
import { seedCorporateBundles } from "./seed-data/corporate-bundles";
import { seedProductFaqsBySlug } from "./seed-data/product-faqs";
import { seedProductFaqsFromMap } from "../src/lib/product-faqs";
import { seedGiftingBundles } from "./seed-data/gifting-bundles";
import { seedGiftBundles } from "./seed-data/seed-gift-bundles";
import {
  DEFAULT_STOREFRONT_SETTINGS,
  STOREFRONT_SETTINGS_KEY,
} from "../src/types/storefront-settings";

import { getPgConnectionString } from "../src/lib/pg-connection";

const pool = new Pool({ connectionString: getPgConnectionString() });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SEED_REVIEWS = [
  {
    id: "seed-review-1",
    rating: 5,
    title: "Exactly as described",
    content:
      "Quality is great for the price. Packaging was secure and delivery was quick.",
  },
  {
    id: "seed-review-2",
    rating: 5,
    title: "Worth it",
    content:
      "Bought this as a gift — they loved it. Would shop here again.",
  },
  {
    id: "seed-review-3",
    rating: 4,
    title: "Solid purchase",
    content:
      "Works well daily. Only wish there were more colour options.",
  },
] as const;

async function seedFeaturedReviews(
  customerId: string,
  productIds: string[]
) {
  if (productIds.length === 0) return;

  for (let i = 0; i < SEED_REVIEWS.length; i++) {
    const seed = SEED_REVIEWS[i];
    const productId = productIds[i % productIds.length];
    await prisma.review.upsert({
      where: { id: seed.id },
      update: {
        rating: seed.rating,
        title: seed.title,
        content: seed.content,
        approved: true,
      },
      create: {
        id: seed.id,
        productId,
        userId: customerId,
        rating: seed.rating,
        title: seed.title,
        content: seed.content,
        approved: true,
      },
    });
  }

  for (const productId of productIds) {
    const stats = await prisma.review.aggregate({
      where: { productId, approved: true },
      _avg: { rating: true },
      _count: true,
    });
    if (stats._count > 0) {
      await prisma.product.update({
        where: { id: productId },
        data: {
          rating: stats._avg.rating ?? 0,
          reviewCount: stats._count,
        },
      });
    }
  }
}

async function main() {
  console.log("Importing catalog into database…");
  await importCatalogFromRepo();

  console.log("Seeding users, coupons, banner, videos, and featured reviews...");

  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      description: "10% off your first order",
      type: "PERCENT",
      value: 10,
      minOrder: 500,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "FLAT200" },
    update: {},
    create: {
      code: "FLAT200",
      description: "₹200 off orders above ₹1500",
      type: "FIXED",
      value: 200,
      minOrder: 1500,
    },
  });

  const password = await bcrypt.hash("password123", 10);
  const adminPassword = await bcrypt.hash("admin123", 10);

  const customer = await prisma.user.upsert({
    where: { email: "customer@test.com" },
    update: { referralCode: "CUST2024" },
    create: {
      email: "customer@test.com",
      name: "Demo Customer",
      passwordHash: password,
      role: "CUSTOMER",
      referralCode: "CUST2024",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: { referralCode: "ADMIN2024" },
    create: {
      email: "admin@test.com",
      name: "Admin User",
      passwordHash: adminPassword,
      role: "SUPER_ADMIN",
      referralCode: "ADMIN2024",
    },
  });

  const featured = await prisma.product.findFirst({
    orderBy: { createdAt: "desc" },
  });
  const homepageHeroImage = "/banners/smart-shopping-banner.png";

  await prisma.banner.upsert({
    where: { id: "seed-hero-1" },
    update: {
      title: "Shop Bag & Shop",
      subtitle: "Lifestyle products for home, travel & more",
      image: homepageHeroImage,
      href: featured ? `/products/${featured.slug}` : "/collections",
      showContent: false,
    },
    create: {
      id: "seed-hero-1",
      title: "Shop Bag & Shop",
      subtitle: "Lifestyle products for home, travel & more",
      image: homepageHeroImage,
      href: featured ? `/products/${featured.slug}` : "/collections",
      position: "homepage",
      sortOrder: 0,
      active: true,
      showContent: false,
    },
  });

  for (const post of seedBlogPosts) {
    await prisma.blogPost.upsert({
      where: { id: post.id },
      update: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        coverImage: post.coverImage,
        published: post.published,
        publishedAt: post.publishedAt,
        author: post.author,
      },
      create: post,
    });
  }

  for (const video of seedSiteVideos) {
    await prisma.siteVideo.upsert({
      where: { id: video.id },
      update: {
        title: video.title,
        src: video.src,
        poster: video.poster,
        href: video.href,
        sortOrder: video.sortOrder,
        active: video.active,
      },
      create: video,
    });
  }

  const products = await prisma.product.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  await seedFeaturedReviews(
    customer.id,
    products.map((p) => p.id)
  );

  console.log("Seeding product FAQs...");
  const faqCount = await seedProductFaqsFromMap(prisma, seedProductFaqsBySlug);

  console.log("Seeding gift bundles (corporate + perfect gifting)...");
  await seedGiftBundles(prisma, [...seedCorporateBundles, ...seedGiftingBundles]);

  await prisma.siteSetting.upsert({
    where: { key: STOREFRONT_SETTINGS_KEY },
    create: {
      key: STOREFRONT_SETTINGS_KEY,
      value: DEFAULT_STOREFRONT_SETTINGS as object,
    },
    update: { value: DEFAULT_STOREFRONT_SETTINGS as object },
  });

  console.log("Seed complete.");
  console.log(`  ${seedBlogPosts.length} blog posts`);
  console.log(`  ${seedSiteVideos.length} homepage videos (sample clips)`);
  console.log(`  ${faqCount} product FAQ entries (sample)`);
  console.log(
    `  ${seedCorporateBundles.length} corporate + ${seedGiftingBundles.length} gifting bundles (sample)`
  );
  console.log("  customer@test.com / password123");
  console.log("  admin@test.com / admin123");
  if (products.length === 0) {
    console.warn("  No products in DB — check prisma/catalog.json and public/products/");
  } else {
    console.log(`  ${SEED_REVIEWS.length} approved homepage reviews`);
  }
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
