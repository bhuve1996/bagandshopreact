import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { deleteVideoFile } from "@/lib/video-upload";
import {
  adminDeleteSiteVideo,
  adminListSiteVideos,
  adminUpdateSiteVideo,
} from "@/services/admin";

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Props) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;

  try {
    const body = z
      .object({
        title: z.string().min(1).optional(),
        poster: z.string().nullable().optional(),
        href: z.string().nullable().optional(),
        active: z.boolean().optional(),
        sortOrder: z.number().int().optional(),
      })
      .parse(await request.json());
    const video = await adminUpdateSiteVideo(id, body);
    return NextResponse.json(video);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { id } = await params;

  try {
    const rows = await adminListSiteVideos();
    const row = rows.find((v) => v.id === id);
    await adminDeleteSiteVideo(id);
    if (row?.src) {
      await deleteVideoFile(row.src);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
