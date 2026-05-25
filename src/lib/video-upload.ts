import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "videos");
const MAX_BYTES = 80 * 1024 * 1024;

const ALLOWED_MIME = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/ogg",
]);

const EXT_BY_MIME: Record<string, string> = {
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
  "video/ogg": ".ogv",
};

export async function saveUploadedVideo(file: File): Promise<string> {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error("Unsupported video format. Use MP4, WebM, MOV, or OGG.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Video must be 80 MB or smaller.");
  }

  const ext = EXT_BY_MIME[file.type] ?? ".mp4";
  const filename = `${randomUUID()}${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return `/uploads/videos/${filename}`;
}

export async function deleteVideoFile(publicSrc: string) {
  if (!publicSrc.startsWith("/uploads/videos/")) return;
  const diskPath = path.join(process.cwd(), "public", publicSrc);
  try {
    await unlink(diskPath);
  } catch {
    /* file may already be gone */
  }
}
