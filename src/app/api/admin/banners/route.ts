import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { adminListBanners, adminUpsertBanner } from "@/services/admin";

export async function GET() {
  const auth = await requireAdmin("promotions");
  if (auth.error) return auth.error;
  return NextResponse.json(await adminListBanners());
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin("promotions");
  if (auth.error) return auth.error;
  try {
    const body = z
      .object({
        id: z.string().optional(),
        title: z.string(),
        subtitle: z.string().optional(),
        image: z.string().min(1),
        href: z.string(),
        position: z.string().optional(),
        active: z.boolean().optional(),
        showContent: z.boolean().optional(),
        sortOrder: z.number().optional(),
      })
      .parse(await request.json());
    const banner = await adminUpsertBanner(body);
    return NextResponse.json(banner, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
