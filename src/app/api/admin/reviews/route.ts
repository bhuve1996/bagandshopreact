import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { adminListReviews, moderateReview } from "@/services/reviews";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const pending = request.nextUrl.searchParams.get("pending") === "true";
  return NextResponse.json(await adminListReviews(pending));
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  try {
    const { id, approved } = (await request.json()) as {
      id: string;
      approved: boolean;
    };
    const review = await moderateReview(id, approved);
    return NextResponse.json(review);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
