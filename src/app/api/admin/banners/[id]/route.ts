import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { adminDeleteBanner, adminUpdateBanner } from "@/services/admin";

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Props) {
  const auth = await requireAdmin("promotions");
  if (auth.error) return auth.error;
  const { id } = await params;

  try {
    const body = z
      .object({
        title: z.string().min(1).optional(),
        subtitle: z.string().nullable().optional(),
        image: z.string().min(1).optional(),
        href: z.string().optional(),
        position: z.string().optional(),
        active: z.boolean().optional(),
        showContent: z.boolean().optional(),
        sortOrder: z.number().int().optional(),
      })
      .parse(await request.json());
    const banner = await adminUpdateBanner(id, body);
    return NextResponse.json(banner);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const auth = await requireAdmin("promotions");
  if (auth.error) return auth.error;
  const { id } = await params;
  try {
    await adminDeleteBanner(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
