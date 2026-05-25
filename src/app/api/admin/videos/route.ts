import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { saveUploadedVideo } from "@/lib/video-upload";
import {
  adminCreateSiteVideo,
  adminListSiteVideos,
} from "@/services/admin";

export async function GET() {
  const auth = await requireAdmin("content");
  if (auth.error) return auth.error;
  return NextResponse.json(await adminListSiteVideos());
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin("content");
  if (auth.error) return auth.error;

  try {
    const form = await request.formData();
    const file = form.get("file");
    const title = String(form.get("title") ?? "").trim();
    const poster = String(form.get("poster") ?? "").trim() || undefined;
    const href = String(form.get("href") ?? "").trim() || undefined;
    const active = form.get("active") !== "false";

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Video file is required" }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const src = await saveUploadedVideo(file);
    const video = await adminCreateSiteVideo({
      title,
      src,
      poster,
      href,
      active,
    });
    return NextResponse.json(video, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
