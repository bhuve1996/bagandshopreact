import { staticPageMetadata } from "@/lib/seo/config";
import { getSiteBrand } from "@/lib/site-brand";

export async function generateMetadata() {
  const brand = await getSiteBrand();
  return staticPageMetadata("/about", {
    title: "About",
    description: `Learn about ${brand.name} — design-led lifestyle accessories from India.`,
  });
}

export default async function AboutPage() {
  const brand = await getSiteBrand();

  return (
    <div className="section-padding">
      <div className="container-page max-w-2xl prose prose-stone">
        <h1 className="text-3xl font-semibold tracking-tight">About {brand.name}</h1>
        <p className="mt-6 text-muted leading-relaxed">
          We create design-led lifestyle accessories for modern life — minimal,
          functional, and beautifully made. Every product is chosen to elevate
          your everyday carry, desk, and travel.
        </p>
      </div>
    </div>
  );
}
