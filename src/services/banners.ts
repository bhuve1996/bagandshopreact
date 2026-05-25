import { isDatabaseReady } from "@/lib/db-ready";
import { getPrisma } from "@/lib/prisma";

export type BannerSlide = {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  image: string;
  showContent: boolean;
};

export async function getActiveBanners(position = "homepage"): Promise<BannerSlide[]> {
  if (!(await isDatabaseReady())) {
    return [];
  }
  const rows = await getPrisma().banner.findMany({
    where: { active: true, position },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((b) => ({
    id: b.id,
    title: b.title,
    subtitle: b.subtitle ?? "",
    cta: "Shop now",
    href: b.href,
    image: b.image,
    showContent: b.showContent,
  }));
}
