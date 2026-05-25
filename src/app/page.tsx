import { BestSellers } from "@/components/home/best-sellers";
import { CollectionsShowcase } from "@/components/home/collections-showcase";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { InstagramSection } from "@/components/home/instagram-section";
import { LifestyleBanners } from "@/components/home/lifestyle-banners";
import { Newsletter } from "@/components/home/newsletter";
import { RecentlyViewed } from "@/features/home/recently-viewed";
import { ShopByDevice } from "@/components/home/shop-by-device";
import { Testimonials } from "@/components/home/testimonials";
import { TrendingProducts } from "@/components/home/trending-products";

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <FeaturedCategories />
      <TrendingProducts />
      <CollectionsShowcase />
      <LifestyleBanners />
      <ShopByDevice />
      <BestSellers />
      <Testimonials />
      <InstagramSection />
      <RecentlyViewed />
      <Newsletter />
    </>
  );
}
