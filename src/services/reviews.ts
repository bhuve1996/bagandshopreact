import { isDatabaseReady } from "@/lib/db-ready";
import { getPrisma } from "@/lib/prisma";

export type ReviewView = {
  id: string;
  rating: number;
  title?: string | null;
  content: string;
  createdAt: string;
  userName: string;
  productName?: string;
  productSlug?: string;
};

export async function getFeaturedReviews(limit = 3): Promise<ReviewView[]> {
  if (!(await isDatabaseReady())) return [];
  const rows = await getPrisma().review.findMany({
    where: { approved: true },
    include: {
      user: { select: { name: true } },
      product: { select: { name: true, slug: true } },
    },
    orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
  return rows.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    content: r.content,
    createdAt: r.createdAt.toISOString(),
    userName: r.user.name ? formatReviewerName(r.user.name) : "Customer",
    productName: r.product.name,
    productSlug: r.product.slug,
  }));
}

function formatReviewerName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

export async function getApprovedReviews(productId: string) {
  if (!(await isDatabaseReady())) return [];
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
    userName: r.user.name ? formatReviewerName(r.user.name) : "Customer",
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
