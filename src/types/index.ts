export type ProductFaq = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
};

export type ProductVariant = {
  id: string;
  name: string;
  color?: string;
  image?: string;
  price: number;
  compareAtPrice?: number;
  inStock: boolean;
  sku?: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  hoverImage?: string;
  category: string;
  categoryName?: string;
  collection?: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  variants?: ProductVariant[];
  device?: string;
  isNew?: boolean;
  isBestseller?: boolean;
  faqs?: ProductFaq[];
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image: string;
  productCount: number;
};

export type Collection = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  accent?: string;
};

export type NavItem = {
  label: string;
  href: string;
  children?: {
    label: string;
    href: string;
    productCount?: number;
    featured?: Product;
  }[];
  banner?: {
    title: string;
    subtitle: string;
    image: string;
    href: string;
  };
};

export type CartItem = {
  productId: string;
  variantId?: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  slug: string;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
};

export type DeviceCategory = {
  id: string;
  name: string;
  slug: string;
  image: string;
};
