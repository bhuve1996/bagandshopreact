import { BestSellers } from "@/components/home/best-sellers";
import { CollectionsShowcase } from "@/components/home/collections-showcase";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { VideoCarousel } from "@/components/home/video-carousel";
import { InstagramSection } from "@/components/home/instagram-section";
import { LifestyleBanners } from "@/components/home/lifestyle-banners";
import { Newsletter } from "@/components/home/newsletter";
import { RecentlyViewed } from "@/features/home/recently-viewed";
import { ShopByCategory } from "@/components/home/shop-by-category";
import { Testimonials } from "@/components/home/testimonials";
import { TrendingProducts } from "@/components/home/trending-products";
import { getFeaturedReviews } from "@/services/reviews";
import { getStorefrontSettings } from "@/services/storefront-settings";
import { getActiveSiteVideos } from "@/services/site-videos";
import {
  getCategories,
  getCollections,
  getCategoryShowcase,
  getProducts,
} from "@/services/products";
import type { Collection, Product } from "@/types";

export default async function HomePage() {
  const [
    bestsellers,
    trending,
    categories,
    collections,
    categoryShowcase,
    spotlight,
    featuredReviews,
    siteVideos,
    storefront,
  ] = await Promise.all([
    getProducts({ isBestseller: true, limit: 6 }),
    getProducts({ sort: "popular", limit: 8 }),
    getCategories(),
    getCollections(),
    getCategoryShowcase(6),
    getProducts({ limit: 6 }),
    getFeaturedReviews(3),
    getActiveSiteVideos(),
    getStorefrontSettings(),
  ]);

  const { homepage, labels } = storefront;

  const lifestyle = pickLifestyleBanners(collections);

  return (
    <>
      <HeroCarousel />
      <VideoCarousel initialSlides={siteVideos} />
      <FeaturedCategories
        categories={categories}
        section={homepage.featuredCategories}
        labels={labels}
      />
      <TrendingProducts
        products={trending.items}
        section={homepage.trending}
      />
      <CollectionsShowcase
        collections={collections}
        section={homepage.collections}
        labels={labels}
      />
      <LifestyleBanners banners={lifestyle} discoverLabel={labels.discover} />
      <ShopByCategory
        categories={categoryShowcase}
        section={homepage.shopByCategory}
        labels={labels}
      />
      <BestSellers
        products={bestsellers.items}
        section={homepage.bestSellers}
      />
      <Testimonials reviews={featuredReviews} />
      <InstagramSection
        images={spotlightImages(spotlight.items)}
        section={homepage.instagram}
      />
      <RecentlyViewed />
      <Newsletter />
    </>
  );
}

function pickLifestyleBanners(collections: Collection[]) {
  const picks = collections.filter((c) =>
    ["work-anywhere", "gift-sets", "everyday", "new-arrivals"].includes(c.slug)
  );
  const source = picks.length >= 2 ? picks : collections;
  return source.slice(0, 2).map((c) => ({
    title: c.name,
    subtitle: c.description,
    href: `/collections/${c.slug}`,
    image: c.image,
  }));
}

function spotlightImages(products: Product[]) {
  const urls = products.flatMap((p) => p.images).filter(Boolean);
  return urls.slice(0, 6);
}
