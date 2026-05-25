import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { adminCreateCollection, adminListCollections } from "@/services/admin";

export async function GET() {
  const auth = await requireAdmin("catalog");
  if (auth.error) return auth.error;
  return Response.json(await adminListCollections());
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin("catalog");
  if (auth.error) return auth.error;
  try {
    const body = z
      .object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().min(1),
        image: z.string().min(1),
        accent: z.string().nullable().optional(),
      })
      .parse(await request.json());
    const collection = await adminCreateCollection(body);
    return NextResponse.json(collection, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
