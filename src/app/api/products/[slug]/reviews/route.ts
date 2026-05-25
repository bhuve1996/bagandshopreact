import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import {
  createReview,
  getApprovedReviews,
  getProductIdBySlug,
} from "@/services/reviews";

type Props = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Props) {
  const { slug } = await params;
  const productId = await getProductIdBySlug(slug);
  if (!productId) {
    return NextResponse.json({ reviews: [] });
  }
  const reviews = await getApprovedReviews(productId);
  return NextResponse.json({ reviews });
}

const createSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  content: z.string().min(10),
});

export async function POST(request: NextRequest, { params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to review" }, { status: 401 });
  }
  const { slug } = await params;
  const productId = await getProductIdBySlug(slug);
  if (!productId) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  try {
    const body = createSchema.parse(await request.json());
    const review = await createReview({
      productId,
      userId: session.user.id,
      ...body,
    });
    return NextResponse.json(
      { message: "Review submitted for moderation", id: review.id },
      { status: 201 }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
