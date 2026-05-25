import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { adminDeleteBanner } from "@/services/admin";

type Props = { params: Promise<{ id: string }> };

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
