import { isDatabaseReady } from "@/lib/db-ready";
import { getPrisma } from "@/lib/prisma";
import { heroSlides } from "@/lib/mock-data";

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
    return heroSlides.map((s) => ({
      id: s.id,
      title: s.title,
      subtitle: s.subtitle,
      cta: s.cta,
      href: s.href,
      image: s.image,
    }));
  }
  const rows = await getPrisma().banner.findMany({
    where: { active: true, position },
    orderBy: { sortOrder: "asc" },
  });
  if (rows.length === 0) {
    return heroSlides.map((s) => ({
      id: s.id,
      title: s.title,
      subtitle: s.subtitle,
      cta: s.cta,
      href: s.href,
      image: s.image,
    }));
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
