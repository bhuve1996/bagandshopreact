import { del, list, put } from "@vercel/blob";

export function isBlobStorageEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function isBlobMediaUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

/** Admin uploads stored in Vercel Blob (production) or under public/uploads (local). */
export function isManagedUploadUrl(url: string): boolean {
  return (
    url.startsWith("/uploads/images/") ||
    url.startsWith("/uploads/videos/") ||
    isBlobMediaUrl(url)
  );
}

export async function putPublicBlob(
  pathname: string,
  body: Buffer | File,
  contentType: string
): Promise<string> {
  const blob = await put(pathname, body, {
    access: "public",
    contentType,
    addRandomSuffix: false,
  });
  return blob.url;
}

export async function deleteBlobByUrl(url: string): Promise<void> {
  if (!isBlobMediaUrl(url)) return;
  await del(url);
}

export async function listUploadBlobs(): Promise<
  { url: string; pathname: string; size: number }[]
> {
  if (!isBlobStorageEnabled()) return [];

  const out: { url: string; pathname: string; size: number }[] = [];
  let cursor: string | undefined;

  do {
    const page = await list({
      prefix: "uploads/",
      cursor,
      limit: 1000,
    });
    for (const blob of page.blobs) {
      out.push({
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
      });
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return out;
}
