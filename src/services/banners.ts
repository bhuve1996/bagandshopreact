import { isDatabaseReady } from "@/lib/db-ready";
import { defaultBanners } from "@/lib/default-banners";
import { getPrisma } from "@/lib/prisma";

export type BannerSlide = {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  image: string;
};

export async function getActiveBanners(position = "homepage"): Promise<BannerSlide[]> {
  if (!(await isDatabaseReady())) {
    return defaultBanners;
  }
  const rows = await getPrisma().banner.findMany({
    where: { active: true, position },
    orderBy: { sortOrder: "asc" },
  });
  if (rows.length === 0) {
    return defaultBanners;
  }
  return rows.map((b) => ({
    id: b.id,
    title: b.title,
    subtitle: b.subtitle ?? "",
    cta: "Shop now",
    href: b.href,
    image: b.image,
  }));
}
