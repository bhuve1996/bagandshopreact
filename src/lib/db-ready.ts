import { getPrisma } from "@/lib/prisma";

let cached: boolean | null = null;

export async function isDatabaseReady(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  if (cached !== null) return cached;
  try {
    await getPrisma().$queryRaw`SELECT 1`;
    cached = true;
  } catch {
    cached = false;
  }
  return cached;
}

export function resetDbReadyCache() {
  cached = null;
}
