import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import {
  categories,
  collections,
  products,
} from "../src/lib/mock-data";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        image: cat.image,
      },
      create: {
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        image: cat.image,
      },
    });
  }

  for (const col of collections) {
    await prisma.collection.upsert({
      where: { slug: col.slug },
      update: {
        name: col.name,
        description: col.description,
        image: col.image,
        accent: col.accent,
      },
      create: {
        slug: col.slug,
        name: col.name,
        description: col.description,
        image: col.image,
        accent: col.accent,
      },
    });
  }

  const categoryMap = Object.fromEntries(
    (await prisma.category.findMany()).map((c) => [c.slug, c.id])
  );
  const collectionMap = Object.fromEntries(
    (await prisma.collection.findMany()).map((c) => [c.slug, c.id])
  );

  for (const p of products) {
    const categoryId = categoryMap[p.category];
    if (!categoryId) continue;

    const collectionId = p.collection
      ? collectionMap[p.collection]
      : undefined;

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        images: p.images,
        hoverImage: p.hoverImage,
        tags: p.tags,
        rating: p.rating,
        reviewCount: p.reviewCount,
        device: p.device,
        isNew: !!p.isNew,
        isBestseller: !!p.isBestseller,
        collectionSlug: p.collection,
        categoryId,
        collectionId,
      },
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        images: p.images,
        hoverImage: p.hoverImage,
        tags: p.tags,
        rating: p.rating,
        reviewCount: p.reviewCount,
        device: p.device,
        isNew: !!p.isNew,
        isBestseller: !!p.isBestseller,
        collectionSlug: p.collection,
        categoryId,
        collectionId,
      },
    });
  }

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

  await prisma.user.upsert({
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

  await prisma.banner.upsert({
    where: { id: "seed-hero-1" },
    update: {},
    create: {
      id: "seed-hero-1",
      title: "Spring Collection",
      subtitle: "Design-led accessories",
      image:
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
      href: "/collections/new-arrivals",
      position: "homepage",
      sortOrder: 0,
    },
  });

  console.log("Seed complete.");
  console.log("  customer@test.com / password123");
  console.log("  admin@test.com / admin123");
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
