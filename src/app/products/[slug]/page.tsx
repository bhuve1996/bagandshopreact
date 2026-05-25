import type { Metadata } from "next";
import { ProductDetail } from "@/features/product/product-detail";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  ProductJsonLd,
} from "@/lib/seo/json-ld";
import { getSeoSettings } from "@/lib/seo/config";
import { resolveProductSeoFields } from "@/lib/seo/product-metadata";
import { pageMetadata } from "@/lib/seo/metadata-helpers";
import { getSiteBrand } from "@/lib/site-brand";
import { buildProductBreadcrumbs } from "@/lib/breadcrumbs";
import { getProductBySlug } from "@/services/products";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [product, seo] = await Promise.all([
    getProductBySlug(slug),
    getSeoSettings(),
  ]);
  if (!product) return { title: "Product not found" };

  const meta = resolveProductSeoFields(product);

  return pageMetadata({
    title: meta.title,
    description: meta.description,
    path: `/products/${product.slug}`,
    image: meta.image ?? seo.defaultOgImage,
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, brand] = await Promise.all([
    getProductBySlug(slug),
    getSiteBrand(),
  ]);
  const breadcrumbs = product ? buildProductBreadcrumbs(product) : [];

  return (
    <>
      {product && (
        <>
          <ProductJsonLd product={product} brandName={brand.name} />
          <BreadcrumbJsonLd items={breadcrumbs} />
          {product.faqs && product.faqs.length > 0 && (
            <FaqJsonLd
              faqs={product.faqs.map((f) => ({ q: f.question, a: f.answer }))}
            />
          )}
        </>
      )}
      <ProductDetail slug={slug} />
    </>
  );
}
