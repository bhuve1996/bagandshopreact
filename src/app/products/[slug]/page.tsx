import type { Metadata } from "next";
import { ProductDetail } from "@/features/product/product-detail";
import { ProductJsonLd } from "@/lib/seo/json-ld";
import { getProductBySlug } from "@/services/products";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: product.description,
    openGraph: { images: [product.images[0]] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return (
    <>
      {product && <ProductJsonLd product={product} />}
      <ProductDetail slug={slug} />
    </>
  );
}
