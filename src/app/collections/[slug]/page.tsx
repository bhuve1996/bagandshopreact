import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { buildCollectionBreadcrumbs } from "@/lib/breadcrumbs";
import { BreadcrumbJsonLd } from "@/lib/seo/json-ld";
import { getSeoSettings } from "@/lib/seo/config";
import { pageMetadata } from "@/lib/seo/metadata-helpers";
import { CollectionPLP } from "@/features/collection/collection-plp";
import {
  formatSlugTitle,
  normalizeCollectionSlug,
  resolveCollectionSlug,
} from "@/lib/collection-slugs";
import {
  getCategories,
  getCategoryBySlug,
  getCollectionBySlug,
} from "@/services/products";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: raw } = await params;
  const slug = normalizeCollectionSlug(raw);
  const cat = await getCategoryBySlug(slug);
  const col = await getCollectionBySlug(slug);
  const resolved = resolveCollectionSlug(raw);
  const title =
    cat?.name ?? col?.name ?? resolved.label ?? formatSlugTitle(slug);
  const description =
    cat?.description ??
    col?.description ??
    `Shop ${title} at Bag & Shop — design-led lifestyle accessories.`;
  const image = cat?.image ?? col?.image;

  const seo = await getSeoSettings();
  return pageMetadata({
    title,
    description,
    path: `/collections/${raw}`,
    image: image ?? seo.defaultOgImage,
  });
}

export default async function CollectionPage({ params }: Props) {
  const { slug: raw } = await params;
  const slug = normalizeCollectionSlug(raw);
  const [category, collection, categories] = await Promise.all([
    getCategoryBySlug(slug),
    getCollectionBySlug(slug),
    getCategories(),
  ]);
  const resolved = resolveCollectionSlug(raw);

  const heading =
    category?.name ??
    collection?.name ??
    resolved.label ??
    formatSlugTitle(slug);

  const breadcrumbItems = buildCollectionBreadcrumbs(raw, heading, categories);

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <div className="container-page pt-8">
        <Breadcrumbs items={breadcrumbItems} />
      </div>
      <CollectionPLP
        slug={raw}
        heading={heading}
        description={category?.description ?? collection?.description}
      />
    </>
  );
}
