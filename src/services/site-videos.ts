import { isDatabaseReady } from "@/lib/db-ready";
import { getPrisma } from "@/lib/prisma";

export type SiteVideoSlide = {
  id: string;
  title: string;
  src: string;
  poster?: string;
  href?: string;
};

export async function getActiveSiteVideos(): Promise<SiteVideoSlide[]> {
  if (!(await isDatabaseReady())) {
    return [];
  }
  const rows = await getPrisma().siteVideo.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((v) => ({
    id: v.id,
    title: v.title,
    src: v.src,
    poster: v.poster ?? undefined,
    href: v.href ?? undefined,
  }));
}
