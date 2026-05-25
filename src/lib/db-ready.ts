import { getPrisma } from "@/lib/prisma";

let cached: boolean | null = null;

export async function isDatabaseReady(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  if (cached !== null) return cached;
  try {
    const prisma = getPrisma();
    await prisma.$queryRaw`SELECT 1`;
    // Connection alone is not enough — schema must be migrated.
    const tables = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'Category'
      ) AS "exists"
    `;
    cached = tables[0]?.exists === true;
  } catch {
    cached = false;
  }
  return cached;
}

export function resetDbReadyCache() {
  cached = null;
}
