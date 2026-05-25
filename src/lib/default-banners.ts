import type { BannerSlide } from "@/services/banners";

/** Fallback hero when DB has no banners (no mock product catalog). */
export const defaultBanners: BannerSlide[] = [
  {
    id: "default-1",
    title: "Bag & Shop",
    subtitle: "Design-led lifestyle accessories",
    cta: "Shop collections",
    href: "/collections",
    image: "/products/_placeholders/category.jpg",
  },
];
