import { isDatabaseReady } from "@/lib/db-ready";
import { getPrisma } from "@/lib/prisma";
import { products as mockProducts } from "@/lib/mock-data";

export type DashboardStats = {
  revenue: number;
  orders: number;
  aov: number;
  customers: number;
  conversionRate: number;
  revenueByDay: { date: string; revenue: number }[];
  topProducts: { name: string; revenue: number; units: number }[];
  ordersByStatus: { status: string; count: number }[];
};

function mockStats(): DashboardStats {
  return {
    revenue: 248500,
    orders: 86,
    aov: 2890,
    customers: 64,
    conversionRate: 3.2,
    revenueByDay: [
      { date: "Mon", revenue: 32000 },
      { date: "Tue", revenue: 28000 },
      { date: "Wed", revenue: 41000 },
      { date: "Thu", revenue: 36000 },
      { date: "Fri", revenue: 52000 },
      { date: "Sat", revenue: 38000 },
      { date: "Sun", revenue: 21500 },
    ],
    topProducts: mockProducts.slice(0, 5).map((p, i) => ({
      name: p.name,
      revenue: p.price * (12 - i * 2),
      units: 12 - i * 2,
    })),
    ordersByStatus: [
      { status: "DELIVERED", count: 42 },
      { status: "PROCESSING", count: 18 },
      { status: "SHIPPED", count: 14 },
      { status: "PENDING", count: 12 },
    ],
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!(await isDatabaseReady())) return mockStats();

  const prisma = getPrisma();
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [orders, users, items] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: since }, paymentStatus: "PAID" },
      include: { items: true },
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.orderItem.findMany({
      where: { order: { createdAt: { gte: since } } },
      include: { product: true, order: true },
    }),
  ]);

  const allOrders = await prisma.order.findMany({
    where: { createdAt: { gte: since } },
  });

  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const orderCount = allOrders.length;
  const aov = orderCount > 0 ? Math.round(revenue / Math.max(orders.length, 1)) : 0;

  const productMap = new Map<string, { name: string; revenue: number; units: number }>();
  for (const item of items) {
    const key = item.productId;
    const cur = productMap.get(key) ?? {
      name: item.name,
      revenue: 0,
      units: 0,
    };
    cur.revenue += item.price * item.quantity;
    cur.units += item.quantity;
    productMap.set(key, cur);
  }

  const statusMap = new Map<string, number>();
  for (const o of allOrders) {
    statusMap.set(o.status, (statusMap.get(o.status) ?? 0) + 1);
  }

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const revenueByDay = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = dayLabels[d.getDay()];
    const dayRev = orders
      .filter((o) => o.createdAt.toDateString() === d.toDateString())
      .reduce((s, o) => s + o.total, 0);
    return { date: label, revenue: dayRev };
  });

  await prisma.analyticsEvent.create({
    data: { type: "admin_dashboard_view" },
  }).catch(() => {});

  return {
    revenue,
    orders: orderCount,
    aov,
    customers: users,
    conversionRate: orderCount > 0 ? Math.min(8, (orders.length / orderCount) * 10) : 0,
    revenueByDay,
    topProducts: [...productMap.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5),
    ordersByStatus: [...statusMap.entries()].map(([status, count]) => ({
      status,
      count,
    })),
  };
}

export async function trackEvent(params: {
  type: string;
  path?: string;
  productId?: string;
  orderId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}) {
  if (!(await isDatabaseReady())) return;
  await getPrisma().analyticsEvent.create({
    data: {
      type: params.type,
      path: params.path,
      productId: params.productId,
      orderId: params.orderId,
      userId: params.userId,
      metadata: params.metadata
        ? (JSON.parse(JSON.stringify(params.metadata)) as object)
        : undefined,
    },
  });
}
