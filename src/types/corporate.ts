import type { Product } from "@/types";

export type GiftBundleKind = "CORPORATE" | "GIFTING";

export type CorporateBundleItem = {
  productId: string;
  quantity: number;
  product: Pick<
    Product,
    "id" | "slug" | "name" | "price" | "compareAtPrice" | "images"
  >;
};

export type CorporateBundle = {
  id: string;
  slug: string;
  name: string;
  description: string;
  tagline?: string;
  image: string;
  kind: GiftBundleKind;
  priceOverride?: number;
  minOrderQty: number;
  featured: boolean;
  items: CorporateBundleItem[];
  /** Sum of line items, or priceOverride when set */
  fromPrice: number;
  compareAtPrice?: number;
};

export type CorporateInquiryInput = {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  bundleId?: string;
  quantity?: number;
  message?: string;
};
