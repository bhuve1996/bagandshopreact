import { isDatabaseReady } from "@/lib/db-ready";
import { getPrisma } from "@/lib/prisma";

export type ReviewView = {
  id: string;
  rating: number;
  title?: string | null;
  content: string;
  createdAt: string;
  userName: string;
};

const MOCK_REVIEWS: ReviewView[] = [
  {
    id: "m1",
    rating: 5,
    title: "Perfect everyday bag",
    content: "Quality is excellent and shipping was fast.",
    createdAt: new Date().toISOString(),
    userName: "Priya S.",
  },
  {
    id: "m2",
    rating: 4,
    title: "Great design",
    content: "Minimal look, exactly as shown in photos.",
    createdAt: new Date().toISOString(),
    userName: "Arjun M.",
  },
];

export async function getApprovedReviews(productId: string) {
  if (!(await isDatabaseReady())) return MOCK_REVIEWS;
  const rows = await getPrisma().review.findMany({
    where: { productId, approved: true },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return rows.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    content: r.content,
    createdAt: r.createdAt.toISOString(),
    userName: r.user.name ? `${r.user.name.split(" ")[0]}.` : "Customer",
  }));
}

export async function getProductIdBySlug(slug: string) {
  if (!(await isDatabaseReady())) return slug;
  const p = await getPrisma().product.findUnique({
    where: { slug },
    select: { id: true },
  });
  return p?.id ?? null;
}

export async function createReview(input: {
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  content: string;
}) {
  if (!(await isDatabaseReady())) throw new Error("Database required");
  const review = await getPrisma().review.create({
    data: {
      productId: input.productId,
      userId: input.userId,
      rating: input.rating,
      title: input.title,
      content: input.content,
      approved: false,
    },
  });
  const stats = await getPrisma().review.aggregate({
    where: { productId: input.productId, approved: true },
    _avg: { rating: true },
    _count: true,
  });
  if (stats._count > 0) {
    await getPrisma().product.update({
      where: { id: input.productId },
      data: {
        rating: stats._avg.rating ?? 0,
        reviewCount: stats._count,
      },
    });
  }
  return review;
}

export async function adminListReviews(pendingOnly = false) {
  if (!(await isDatabaseReady())) return [];
  return getPrisma().review.findMany({
    where: pendingOnly ? { approved: false } : undefined,
    include: {
      user: { select: { email: true, name: true } },
      product: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function moderateReview(id: string, approved: boolean) {
  if (!(await isDatabaseReady())) throw new Error("Database required");
  const review = await getPrisma().review.update({
    where: { id },
    data: { approved },
  });
  const stats = await getPrisma().review.aggregate({
    where: { productId: review.productId, approved: true },
    _avg: { rating: true },
    _count: true,
  });
  await getPrisma().product.update({
    where: { id: review.productId },
    data: {
      rating: stats._avg.rating ?? 0,
      reviewCount: stats._count,
    },
  });
  return review;
}
