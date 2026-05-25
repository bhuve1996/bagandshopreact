import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CollectionPLP } from "@/features/collection/collection-plp";
import {
  getCategoryBySlug,
  getCollectionBySlug,
} from "@/services/products";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  const col = await getCollectionBySlug(slug);
  const title = cat?.name ?? col?.name ?? slug.replace(/-/g, " ");
  return { title: title.charAt(0).toUpperCase() + title.slice(1) };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  const collection = await getCollectionBySlug(slug);

  const knownSlugs = ["best-sellers", "new-arrivals"];
  if (!category && !collection && !knownSlugs.includes(slug)) {
    notFound();
  }

  const heading =
    category?.name ??
    collection?.name ??
    slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

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
        slug={slug}
        heading={heading}
        description={category?.description ?? collection?.description}
      />
    </>
  );
}
