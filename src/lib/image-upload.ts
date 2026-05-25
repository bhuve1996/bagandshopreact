import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import {
  deleteBlobByUrl,
  isBlobMediaUrl,
  isBlobStorageEnabled,
  putPublicBlob,
} from "@/lib/blob-storage";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "images");
const MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

export async function saveUploadedImage(file: File): Promise<string> {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error("Unsupported image format. Use JPEG, PNG, WebP, GIF, or AVIF.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 10 MB or smaller.");
  }

  const ext = EXT_BY_MIME[file.type] ?? ".jpg";
  const filename = `${randomUUID()}${ext}`;

  if (isBlobStorageEnabled()) {
    return putPublicBlob(
      `uploads/images/${filename}`,
      file,
      file.type || "application/octet-stream"
    );
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return `/uploads/images/${filename}`;
}

export async function deleteImageFile(publicSrc: string) {
  if (isBlobMediaUrl(publicSrc)) {
    await deleteBlobByUrl(publicSrc);
    return;
  }
  if (!publicSrc.startsWith("/uploads/images/")) return;
  const diskPath = path.join(process.cwd(), "public", publicSrc);
  try {
    await unlink(diskPath);
  } catch {
    /* file may already be gone */
  }
}
