import type { Metadata } from "next";
import Link from "next/link";
import { CollectionPLP } from "@/features/collection/collection-plp";
import {
  formatSlugTitle,
  normalizeCollectionSlug,
  resolveCollectionSlug,
} from "@/lib/collection-slugs";
import {
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
  return { title };
}

export default async function CollectionPage({ params }: Props) {
  const { slug: raw } = await params;
  const slug = normalizeCollectionSlug(raw);
  const category = await getCategoryBySlug(slug);
  const collection = await getCollectionBySlug(slug);
  const resolved = resolveCollectionSlug(raw);

  const heading =
    category?.name ??
    collection?.name ??
    resolved.label ??
    formatSlugTitle(slug);

  return (
    <>
      <div className="container-page pt-8">
        <nav className="text-sm text-muted">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span>{heading}</span>
        </nav>
      </div>
      <CollectionPLP
        slug={raw}
        heading={heading}
        description={category?.description ?? collection?.description}
      />
    </>
  );
}
