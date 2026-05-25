import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { adminCreateCategory, adminListCategories } from "@/services/admin";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  return Response.json(await adminListCategories());
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  try {
    const body = z
      .object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        image: z.string().min(1),
      })
      .parse(await request.json());
    const category = await adminCreateCategory(body);
    return NextResponse.json(category, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
