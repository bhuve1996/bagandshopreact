import { isDatabaseReady } from "@/lib/db-ready";
import { getPrisma } from "@/lib/prisma";
import {
  PRODUCT_PLACEHOLDER_IMAGE,
  giftBundleImageUrl,
} from "@/lib/product-placeholder";
import type {
  CorporateBundle,
  CorporateBundleItem,
  CorporateInquiryInput,
  GiftBundleKind,
} from "@/types/corporate";

type BundleRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  tagline: string | null;
  image: string;
  kind: GiftBundleKind;
  priceOverride: number | null;
  minOrderQty: number;
  featured: boolean;
  items: {
    productId: string;
    quantity: number;
    product: {
      id: string;
      slug: string;
      name: string;
      price: number;
      compareAtPrice: number | null;
      images: string[];
    };
  }[];
};

function mapBundleItem(row: BundleRow["items"][number]): CorporateBundleItem {
  const p = row.product;
  return {
    productId: row.productId,
    quantity: row.quantity,
    product: {
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? undefined,
      images: p.images,
    },
  };
}

function bundlePricing(items: CorporateBundleItem[], priceOverride: number | null) {
  const subtotal = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );
  const compareTotal = items.reduce(
    (sum, i) =>
      sum +
      (i.product.compareAtPrice ?? i.product.price) * i.quantity,
    0
  );
  const fromPrice = priceOverride ?? subtotal;
  const compareAtPrice =
    compareTotal > fromPrice ? compareTotal : undefined;
  return { fromPrice, compareAtPrice };
}

function mapBundle(row: BundleRow): CorporateBundle {
  const items = row.items.map(mapBundleItem);
  const { fromPrice, compareAtPrice } = bundlePricing(
    items,
    row.priceOverride
  );
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    tagline: row.tagline ?? undefined,
    image: giftBundleImageUrl(row.image),
    kind: row.kind,
    priceOverride: row.priceOverride ?? undefined,
    minOrderQty: row.minOrderQty,
    featured: row.featured,
    items,
    fromPrice,
    compareAtPrice,
  };
}

const bundleInclude = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          slug: true,
          name: true,
          price: true,
          compareAtPrice: true,
          images: true,
        },
      },
    },
    orderBy: { quantity: "desc" as const },
  },
};

export async function getGiftBundles(options?: {
  kind?: GiftBundleKind;
  featuredOnly?: boolean;
  limit?: number;
}): Promise<CorporateBundle[]> {
  if (!(await isDatabaseReady())) return [];
  const rows = await getPrisma().corporateBundle.findMany({
    where: {
      active: true,
      ...(options?.kind ? { kind: options.kind } : {}),
      ...(options?.featuredOnly ? { featured: true } : {}),
    },
    include: bundleInclude,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    take: options?.limit,
  });
  return rows.map(mapBundle);
}

export async function getCorporateBundles(options?: {
  featuredOnly?: boolean;
  limit?: number;
}): Promise<CorporateBundle[]> {
  return getGiftBundles({ ...options, kind: "CORPORATE" });
}

export async function getGiftingBundles(options?: {
  featuredOnly?: boolean;
  limit?: number;
}): Promise<CorporateBundle[]> {
  return getGiftBundles({ ...options, kind: "GIFTING" });
}

export async function getGiftBundleBySlug(
  slug: string,
  kind?: GiftBundleKind
): Promise<CorporateBundle | null> {
  if (!(await isDatabaseReady())) return null;
  const row = await getPrisma().corporateBundle.findFirst({
    where: { slug, active: true, ...(kind ? { kind } : {}) },
    include: bundleInclude,
  });
  return row ? mapBundle(row) : null;
}

export async function getCorporateBundleBySlug(slug: string) {
  return getGiftBundleBySlug(slug, "CORPORATE");
}

export async function submitCorporateInquiry(
  input: CorporateInquiryInput
) {
  if (!(await isDatabaseReady())) {
    throw new Error("Database unavailable");
  }
  if (input.bundleId) {
    const bundle = await getPrisma().corporateBundle.findFirst({
      where: { id: input.bundleId, active: true },
    });
    if (!bundle) throw new Error("Selected bundle not found");
  }
  return getPrisma().corporateInquiry.create({
    data: {
      companyName: input.companyName.trim(),
      contactName: input.contactName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() || null,
      bundleId: input.bundleId || null,
      quantity: input.quantity ?? null,
      message: input.message?.trim() || null,
    },
  });
}

/** Admin: list all bundles including inactive */
export async function adminListCorporateBundles(kind?: GiftBundleKind) {
  if (!(await isDatabaseReady())) return [];
  return getPrisma().corporateBundle.findMany({
    where: kind ? { kind } : undefined,
    include: {
      ...bundleInclude,
      _count: { select: { inquiries: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export type AdminBundleItemInput = {
  productId: string;
  quantity: number;
};

export async function adminUpsertCorporateBundle(data: {
  id?: string;
  slug: string;
  name: string;
  description: string;
  tagline?: string;
  image: string;
  kind?: GiftBundleKind;
  priceOverride?: number | null;
  minOrderQty?: number;
  active?: boolean;
  featured?: boolean;
  sortOrder?: number;
  items: AdminBundleItemInput[];
}) {
  if (!(await isDatabaseReady())) throw new Error("Database required");

  const bundleKind = data.kind ?? "CORPORATE";
  const defaultMinQty = bundleKind === "GIFTING" ? 1 : 10;

  const payload = {
    slug: data.slug,
    name: data.name,
    description: data.description,
    tagline: data.tagline?.trim() || null,
    image: data.image,
    kind: bundleKind,
    priceOverride: data.priceOverride ?? null,
    minOrderQty: data.minOrderQty ?? defaultMinQty,
    active: data.active ?? true,
    featured: data.featured ?? false,
    sortOrder: data.sortOrder ?? 0,
  };

  if (data.id) {
    await getPrisma().corporateBundleItem.deleteMany({
      where: { bundleId: data.id },
    });
    const row = await getPrisma().corporateBundle.update({
      where: { id: data.id },
      data: {
        ...payload,
        items: {
          create: data.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        },
      },
      include: bundleInclude,
    });
    return mapBundle(row);
  }

  const row = await getPrisma().corporateBundle.create({
    data: {
      ...payload,
      items: {
        create: data.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      },
    },
    include: bundleInclude,
  });
  return mapBundle(row);
}

export async function adminDeleteCorporateBundle(id: string) {
  if (!(await isDatabaseReady())) throw new Error("Database required");
  await getPrisma().corporateBundle.delete({ where: { id } });
}

export async function adminListCorporateInquiries() {
  if (!(await isDatabaseReady())) return [];
  return getPrisma().corporateInquiry.findMany({
    include: { bundle: { select: { id: true, name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function adminUpdateCorporateInquiryStatus(
  id: string,
  status: "NEW" | "CONTACTED" | "CLOSED"
) {
  if (!(await isDatabaseReady())) throw new Error("Database required");
  return getPrisma().corporateInquiry.update({
    where: { id },
    data: { status },
  });
}

/** Default card image for gift/corporate bundles (not a product gallery photo). */
export async function resolveBundleImageFromProducts(
  _productIds: string[]
): Promise<string> {
  return PRODUCT_PLACEHOLDER_IMAGE;
}
