import { isDatabaseReady } from "@/lib/db-ready";
import { getPrisma } from "@/lib/prisma";
import { mapProduct } from "@/lib/mappers";
import { sendShippingUpdateEmail } from "@/services/email";
import { products as mockProducts } from "@/lib/mock-data";

export async function adminListProducts() {
  if (!(await isDatabaseReady())) {
    return mockProducts.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      stock: 100,
      category: p.category,
      isNew: p.isNew,
      isBestseller: p.isBestseller,
    }));
  }
  return getPrisma().product.findMany({
    include: { category: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function adminGetProduct(id: string) {
  if (!(await isDatabaseReady())) {
    const p = mockProducts.find((x) => x.id === id || x.slug === id);
    return p ? { ...p, stock: 100, categoryId: "" } : null;
  }
  const row = await getPrisma().product.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: { category: true },
  });
  return row;
}

export async function adminCreateProduct(data: {
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  tags: string[];
  categoryId: string;
  stock?: number;
  isNew?: boolean;
  isBestseller?: boolean;
}) {
  if (!(await isDatabaseReady())) throw new Error("Database required for admin writes");
  const row = await getPrisma().product.create({
    data: {
      slug: data.slug,
      name: data.name,
      description: data.description,
      price: data.price,
      compareAtPrice: data.compareAtPrice,
      images: data.images,
      tags: data.tags,
      categoryId: data.categoryId,
      stock: data.stock ?? 100,
      isNew: data.isNew ?? false,
      isBestseller: data.isBestseller ?? false,
    },
    include: { category: true },
  });
  return mapProduct(row);
}

export async function adminUpdateProduct(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    price: number;
    compareAtPrice: number | null;
    images: string[];
    tags: string[];
    stock: number;
    isNew: boolean;
    isBestseller: boolean;
  }>
) {
  if (!(await isDatabaseReady())) throw new Error("Database required");
  return getPrisma().product.update({ where: { id }, data });
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
    include: { items: true, user: true },
  });
}

export async function adminUpdateOrderStatus(
  id: string,
  status: string,
  paymentStatus?: string
) {
  if (!(await isDatabaseReady())) throw new Error("Database required");
  const order = await getPrisma().order.update({
    where: { id },
    data: {
      status: status as "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED",
      ...(paymentStatus
        ? {
            paymentStatus: paymentStatus as "PENDING" | "PAID" | "FAILED" | "REFUNDED",
          }
        : {}),
    },
    include: { user: true },
  });
  if (
    ["SHIPPED", "DELIVERED"].includes(status) &&
    order.user?.email
  ) {
    await sendShippingUpdateEmail({
      to: order.user.email,
      orderNumber: order.orderNumber,
      status,
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
    return [
      {
        id: "b1",
        title: "Spring Collection",
        subtitle: "New arrivals",
        image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800",
        href: "/collections/new-arrivals",
        position: "homepage",
        active: true,
        sortOrder: 0,
      },
    ];
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

export async function adminListCategories() {
  if (!(await isDatabaseReady())) return [];
  return getPrisma().category.findMany({ orderBy: { name: "asc" } });
}
