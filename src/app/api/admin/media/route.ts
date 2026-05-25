import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { deleteImageFile, saveUploadedImage } from "@/lib/image-upload";
import { isBlobMediaUrl } from "@/lib/blob-storage";
import {
  isDeletableMediaUrl,
  listMediaAssets,
  normalizePublicMediaPath,
} from "@/lib/media-gallery";
import { deleteVideoFile } from "@/lib/video-upload";

export async function GET() {
  const auth = await requireAdmin("catalog");
  if (auth.error) return auth.error;
  const assets = await listMediaAssets();
  return NextResponse.json(assets);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin("catalog");
  if (auth.error) return auth.error;

  try {
    const form = await request.formData();
    const files = form.getAll("file").filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length === 0) {
      return NextResponse.json({ error: "At least one image file is required" }, { status: 400 });
    }

    const urls: string[] = [];
    for (const file of files) {
      urls.push(await saveUploadedImage(file));
    }
    return NextResponse.json({ urls }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

const deleteSchema = z.object({ url: z.string().min(1) });

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin("catalog");
  if (auth.error) return auth.error;

  try {
    const body = deleteSchema.parse(await request.json());
    const url = normalizePublicMediaPath(body.url);
    if (!url || !isDeletableMediaUrl(url)) {
      return NextResponse.json(
        { error: "Only admin uploads (local /uploads or Vercel Blob) can be deleted" },
        { status: 400 }
      );
    }
    if (isBlobMediaUrl(url)) {
      await deleteImageFile(url);
    } else if (url.startsWith("/uploads/images/")) {
      await deleteImageFile(url);
    } else {
      await deleteVideoFile(url);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
