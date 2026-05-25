import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import {
  adminListCorporateBundles,
  adminUpsertCorporateBundle,
} from "@/services/corporate";

const itemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(999),
});

const bundleSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1).max(120),
  name: z.string().min(1).max(200),
  description: z.string().min(1),
  tagline: z.string().max(200).optional(),
  kind: z.enum(["CORPORATE", "GIFTING"]).optional(),
  image: z.string().min(1),
  priceOverride: z.number().int().min(0).nullable().optional(),
  minOrderQty: z.number().int().min(1).optional(),
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  items: z.array(itemSchema).min(1),
});

export async function GET(request: NextRequest) {
  const auth = await requireAdmin("content");
  if (auth.error) return auth.error;
  const kind = request.nextUrl.searchParams.get("kind");
  const parsed =
    kind === "CORPORATE" || kind === "GIFTING" ? kind : undefined;
  return NextResponse.json(await adminListCorporateBundles(parsed));
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin("content");
  if (auth.error) return auth.error;
  try {
    const body = bundleSchema.parse(await request.json());
    const bundle = await adminUpsertCorporateBundle(body);
    return NextResponse.json(bundle, { status: body.id ? 200 : 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
