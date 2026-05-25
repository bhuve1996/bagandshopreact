import { isDatabaseReady } from "@/lib/db-ready";
import { getPrisma } from "@/lib/prisma";
import { syncProductFaqs } from "@/lib/product-faqs";
import { sendShippingUpdateEmail } from "@/services/email";

export async function adminListProducts() {
  if (!(await isDatabaseReady())) {
    return [];
  }
  return getPrisma().product.findMany({
    include: {
      category: true,
      collection: true,
      _count: { select: { variants: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function adminGetProduct(id: string) {
  if (!(await isDatabaseReady())) {
    return null;
  }
  const row = await getPrisma().product.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      category: true,
      collection: true,
      variants: { orderBy: { name: "asc" } },
      faqs: { orderBy: { sortOrder: "asc" } },
    },
  });
  return row;
}

export type AdminVariantInput = {
  id?: string;
  name: string;
  color?: string;
  image?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  sku?: string;
};

export type AdminFaqInput = {
  question: string;
  answer: string;
};

async function resolveCollectionLink(collectionSlug?: string | null) {
  if (collectionSlug === undefined) return undefined;
  if (!collectionSlug) return { collectionId: null, collectionSlug: null };
  const col = await getPrisma().collection.findUnique({
    where: { slug: collectionSlug },
  });
  return {
    collectionSlug,
    collectionId: col?.id ?? null,
  };
}

function normalizeSeoField(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function adminCreateProduct(data: {
  slug: string;
  name: string;
  description: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  price: number;
  compareAtPrice?: number;
  images: string[];
  hoverImage?: string;
  tags: string[];
  categoryId: string;
  stock?: number;
  isNew?: boolean;
  isBestseller?: boolean;
  device?: string;
  collectionSlug?: string;
  variants?: AdminVariantInput[];
  faqs?: AdminFaqInput[];
}) {
  if (!(await isDatabaseReady())) throw new Error("Database required for admin writes");
  const collectionLink = await resolveCollectionLink(data.collectionSlug ?? null);
  const { faqs, ...createData } = data;
  const row = await getPrisma().product.create({
    data: {
      slug: createData.slug,
      name: createData.name,
      description: createData.description,
      metaTitle: normalizeSeoField(createData.metaTitle),
      metaDescription: normalizeSeoField(createData.metaDescription),
      ogImage: normalizeSeoField(createData.ogImage),
      price: createData.price,
      compareAtPrice: createData.compareAtPrice,
      images: createData.images,
      hoverImage: createData.hoverImage ?? createData.images[1],
      tags: createData.tags,
      categoryId: createData.categoryId,
      stock: createData.stock ?? 100,
      isNew: createData.isNew ?? false,
      isBestseller: createData.isBestseller ?? false,
      device: createData.device || null,
      collectionSlug: collectionLink?.collectionSlug ?? null,
      collectionId: collectionLink?.collectionId ?? null,
      variants: createData.variants?.length
        ? {
            create: createData.variants.map((v) => ({
              name: v.name,
              color: v.color,
              image: v.image,
              price: v.price,
              compareAtPrice: v.compareAtPrice,
              stock: v.stock,
              sku: v.sku,
            })),
          }
        : undefined,
    },
    include: { category: true, variants: true, faqs: true },
  });
  if (faqs !== undefined) {
    await syncProductFaqs(getPrisma(), row.id, faqs);
    const withFaqs = await adminGetProduct(row.id);
    if (withFaqs) return withFaqs;
  }
  return row;
}

export async function adminUpdateProduct(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    metaTitle: string | null;
    metaDescription: string | null;
    ogImage: string | null;
    price: number;
    compareAtPrice: number | null;
    images: string[];
    hoverImage: string | null;
    tags: string[];
    stock: number;
    isNew: boolean;
    isBestseller: boolean;
    device: string | null;
    categoryId: string;
    collectionSlug: string | null;
    variants: AdminVariantInput[];
    faqs: AdminFaqInput[];
  }>
) {
  if (!(await isDatabaseReady())) throw new Error("Database required");

  const collectionLink =
    data.collectionSlug !== undefined
      ? await resolveCollectionLink(data.collectionSlug)
      : undefined;

  const { variants, faqs, ...productFields } = data;

  return getPrisma().$transaction(async (tx) => {
    const product = await tx.product.update({
      where: { id },
      data: {
        ...productFields,
        ...(collectionLink ?? {}),
      },
      include: { category: true, collection: true, variants: true, faqs: true },
    });

    if (variants !== undefined) {
      await tx.productVariant.deleteMany({ where: { productId: id } });
      if (variants.length > 0) {
        await tx.productVariant.createMany({
          data: variants.map((v) => ({
            productId: id,
            name: v.name,
            color: v.color,
            image: v.image,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            stock: v.stock,
            sku: v.sku,
          })),
        });
      }
    }

    if (faqs !== undefined) {
      await syncProductFaqs(tx, id, faqs);
    }

    if (variants !== undefined || faqs !== undefined) {
      return tx.product.findUnique({
        where: { id },
        include: {
          category: true,
          collection: true,
          variants: true,
          faqs: { orderBy: { sortOrder: "asc" } },
        },
      });
    }

    return product;
  });
}

export async function adminDeleteProduct(id: string) {
  if (!(await isDatabaseReady())) throw new Error("Database required");
  return getPrisma().product.delete({ where: { id } });
}

export async function adminListOrders() {
  if (!(await isDatabaseReady())) return [];
  return getPrisma().order.findMany({
    include: { items: true, user: { select: { email: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function adminGetOrder(id: string) {
  if (!(await isDatabaseReady())) return null;
  return getPrisma().order.findFirst({
    where: { OR: [{ id }, { orderNumber: id }] },
    include: {
      items: { include: { product: { select: { id: true, slug: true } } } },
      user: true,
    },
  });
}

export async function adminUpdateOrder(
  id: string,
  updates: { status?: string; paymentStatus?: string }
) {
  if (!(await isDatabaseReady())) throw new Error("Database required");
  const data: {
    status?: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
    paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  } = {};
  if (updates.status) {
    data.status = updates.status as typeof data.status;
  }
  if (updates.paymentStatus) {
    data.paymentStatus = updates.paymentStatus as typeof data.paymentStatus;
  }
  if (Object.keys(data).length === 0) {
    throw new Error("No updates provided");
  }

  const existing = await getPrisma().order.findFirst({
    where: { OR: [{ id }, { orderNumber: id }] },
    select: { id: true },
  });
  if (!existing) throw new Error("Order not found");

  const order = await getPrisma().order.update({
    where: { id: existing.id },
    data: {
      ...data,
      ...(updates.status === "DELIVERED" ? { deliveredAt: new Date() } : {}),
    },
    include: { user: true, items: true },
  });
  if (
    updates.status &&
    ["SHIPPED", "DELIVERED"].includes(updates.status) &&
    order.user?.email
  ) {
    await sendShippingUpdateEmail({
      to: order.user.email,
      orderNumber: order.orderNumber,
      status: updates.status,
    });
  }
  return order;
}

export async function adminListCoupons() {
  if (!(await isDatabaseReady())) {
    return [
      { id: "1", code: "WELCOME10", type: "PERCENT", value: 10, minOrder: 500, active: true },
      { id: "2", code: "FLAT200", type: "FIXED", value: 200, minOrder: 1500, active: true },
    ];
  }
  return getPrisma().coupon.findMany({ orderBy: { createdAt: "desc" } });
}

export async function adminCreateCoupon(data: {
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minOrder?: number;
  description?: string;
}) {
  if (!(await isDatabaseReady())) throw new Error("Database required");
  return getPrisma().coupon.create({
    data: {
      code: data.code.toUpperCase(),
      type: data.type,
      value: data.value,
      minOrder: data.minOrder ?? 0,
      description: data.description,
    },
  });
}

export async function adminToggleCoupon(id: string, active: boolean) {
  if (!(await isDatabaseReady())) throw new Error("Database required");
  return getPrisma().coupon.update({ where: { id }, data: { active } });
}

export async function adminListUsers() {
  if (!(await isDatabaseReady())) return [];
  return getPrisma().user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function adminListBanners() {
  if (!(await isDatabaseReady())) {
    return [];
  }
  return getPrisma().banner.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function adminUpsertBanner(
  data: {
    id?: string;
    title: string;
    subtitle?: string;
    image: string;
    href: string;
    position?: string;
    active?: boolean;
    sortOrder?: number;
  }
) {
  if (!(await isDatabaseReady())) throw new Error("Database required");
  if (data.id) {
    return getPrisma().banner.update({
      where: { id: data.id },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        image: data.image,
        href: data.href,
        position: data.position ?? "homepage",
        active: data.active ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }
  return getPrisma().banner.create({
    data: {
      title: data.title,
      subtitle: data.subtitle,
      image: data.image,
      href: data.href,
      position: data.position ?? "homepage",
      active: data.active ?? true,
      sortOrder: data.sortOrder ?? 0,
    },
  });
}

export async function adminDeleteBanner(id: string) {
  if (!(await isDatabaseReady())) throw new Error("Database required");
  return getPrisma().banner.delete({ where: { id } });
}

export async function adminListSiteVideos() {
  if (!(await isDatabaseReady())) {
    return [];
  }
  return getPrisma().siteVideo.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function adminCreateSiteVideo(data: {
  title: string;
  src: string;
  poster?: string;
  href?: string;
  active?: boolean;
  sortOrder?: number;
}) {
  if (!(await isDatabaseReady())) throw new Error("Database required");
  const maxOrder = await getPrisma().siteVideo.aggregate({
    _max: { sortOrder: true },
  });
  return getPrisma().siteVideo.create({
    data: {
      title: data.title,
      src: data.src,
      poster: data.poster,
      href: data.href,
      active: data.active ?? true,
      sortOrder: data.sortOrder ?? (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });
}

export async function adminUpdateSiteVideo(
  id: string,
  data: Partial<{
    title: string;
    poster: string | null;
    href: string | null;
    active: boolean;
    sortOrder: number;
  }>
) {
  if (!(await isDatabaseReady())) throw new Error("Database required");
  return getPrisma().siteVideo.update({ where: { id }, data });
}

export async function adminDeleteSiteVideo(id: string) {
  if (!(await isDatabaseReady())) throw new Error("Database required");
  return getPrisma().siteVideo.delete({ where: { id } });
}

export async function adminListCategories() {
  if (!(await isDatabaseReady())) return [];
  return getPrisma().category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
}

export async function adminCreateCategory(data: {
  name: string;
  slug: string;
  description?: string;
  image: string;
}) {
  if (!(await isDatabaseReady())) throw new Error("Database required");
  return getPrisma().category.create({ data });
}

export async function adminUpdateCategory(
  id: string,
  data: Partial<{ name: string; slug: string; description: string; image: string }>
) {
  if (!(await isDatabaseReady())) throw new Error("Database required");
  return getPrisma().category.update({ where: { id }, data });
}

export async function adminDeleteCategory(id: string) {
  if (!(await isDatabaseReady())) throw new Error("Database required");
  const category = await getPrisma().category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) throw new Error("Category not found");
  if (category._count.products > 0) {
    throw new Error(
      `Cannot delete: ${category._count.products} product(s) still use this category`
    );
  }
  return getPrisma().category.delete({ where: { id } });
}

export async function adminListCollections() {
  if (!(await isDatabaseReady())) return [];
  return getPrisma().collection.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
}

export async function adminCreateCollection(data: {
  name: string;
  slug: string;
  description: string;
  image: string;
  accent?: string | null;
}) {
  if (!(await isDatabaseReady())) throw new Error("Database required");
  return getPrisma().collection.create({ data });
}

export async function adminUpdateCollection(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string;
    image: string;
    accent: string | null;
  }>
) {
  if (!(await isDatabaseReady())) throw new Error("Database required");
  return getPrisma().collection.update({ where: { id }, data });
}

export async function adminDeleteCollection(id: string) {
  if (!(await isDatabaseReady())) throw new Error("Database required");
  const collection = await getPrisma().collection.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!collection) throw new Error("Collection not found");
  if (collection._count.products > 0) {
    throw new Error(
      `Cannot delete: ${collection._count.products} product(s) still linked to this collection`
    );
  }
  return getPrisma().collection.delete({ where: { id } });
}

export async function adminListBlogPosts() {
  if (!(await isDatabaseReady())) return [];
  return getPrisma().blogPost.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function adminCreateBlogPost(data: {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  author?: string | null;
  published?: boolean;
}) {
  if (!(await isDatabaseReady())) throw new Error("Database required");
  const published = data.published ?? false;
  return getPrisma().blogPost.create({
    data: {
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      coverImage: data.coverImage ?? null,
      metaTitle: data.metaTitle ?? null,
      metaDescription: data.metaDescription ?? null,
      ogImage: data.ogImage ?? null,
      author: data.author ?? null,
      published,
      publishedAt: published ? new Date() : null,
    },
  });
}

export async function adminUpdateBlogPost(
  id: string,
  data: Partial<{
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    coverImage: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
    ogImage: string | null;
    author: string | null;
    published: boolean;
  }>
) {
  if (!(await isDatabaseReady())) throw new Error("Database required");
  const existing = await getPrisma().blogPost.findUnique({ where: { id } });
  if (!existing) throw new Error("Blog post not found");

  let publishedAt = existing.publishedAt;
  if (data.published === true && !existing.publishedAt) {
    publishedAt = new Date();
  }

  return getPrisma().blogPost.update({
    where: { id },
    data: {
      ...data,
      ...(data.published !== undefined ? { publishedAt } : {}),
    },
  });
}

export async function adminDeleteBlogPost(id: string) {
  if (!(await isDatabaseReady())) throw new Error("Database required");
  return getPrisma().blogPost.delete({ where: { id } });
}
