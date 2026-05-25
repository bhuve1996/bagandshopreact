import { isDatabaseReady } from "@/lib/db-ready";
import { AnalyticsEventType } from "@/lib/analytics-events";
import { getPrisma } from "@/lib/prisma";

export type DashboardStats = {
  revenue: number;
  orders: number;
  paidOrders: number;
  aov: number;
  customers: number;
  conversionRate: number;
  revenueByDay: { date: string; revenue: number }[];
  topProducts: { name: string; revenue: number; units: number }[];
  ordersByStatus: { status: string; count: number }[];
  engagement: EngagementStats;
};

export type EngagementStats = {
  eventsByType: { type: string; count: number }[];
  topViewedProducts: { productId: string; name: string; views: number }[];
  shareByChannel: { channel: string; count: number }[];
  funnel: {
    productViews: number;
    addToCart: number;
    beginCheckout: number;
    purchases: number;
    viewToCartRate: number;
    cartToPurchaseRate: number;
    viewToPurchaseRate: number;
  };
  assistant: {
    opens: number;
    messages: number;
    quickReplies: number;
  };
  abandonedCarts: number;
  pageViewsByDay: { date: string; count: number }[];
};

function emptyEngagement(): EngagementStats {
  return {
    eventsByType: [],
    topViewedProducts: [],
    shareByChannel: [],
    funnel: {
      productViews: 0,
      addToCart: 0,
      beginCheckout: 0,
      purchases: 0,
      viewToCartRate: 0,
      cartToPurchaseRate: 0,
      viewToPurchaseRate: 0,
    },
    assistant: { opens: 0, messages: 0, quickReplies: 0 },
    abandonedCarts: 0,
    pageViewsByDay: [],
  };
}

function mockEngagement(): EngagementStats {
  return {
    eventsByType: [
      { type: AnalyticsEventType.PAGE_VIEW, count: 1240 },
      { type: AnalyticsEventType.PRODUCT_VIEW, count: 680 },
      { type: AnalyticsEventType.ADD_TO_CART, count: 142 },
      { type: AnalyticsEventType.PRODUCT_SHARE, count: 58 },
      { type: AnalyticsEventType.ASSISTANT_OPEN, count: 89 },
    ],
    topViewedProducts: [],
    shareByChannel: [
      { channel: "copy", count: 24 },
      { channel: "whatsapp", count: 31 },
    ],
    funnel: {
      productViews: 680,
      addToCart: 142,
      beginCheckout: 98,
      purchases: 52,
      viewToCartRate: 20.9,
      cartToPurchaseRate: 36.6,
      viewToPurchaseRate: 7.6,
    },
    assistant: { opens: 89, messages: 210, quickReplies: 64 },
    abandonedCarts: 17,
    pageViewsByDay: [
      { date: "Mon", count: 180 },
      { date: "Tue", count: 165 },
      { date: "Wed", count: 192 },
      { date: "Thu", count: 178 },
      { date: "Fri", count: 210 },
      { date: "Sat", count: 198 },
      { date: "Sun", count: 117 },
    ],
  };
}

function mockStats(): DashboardStats {
  return {
    revenue: 248500,
    orders: 86,
    paidOrders: 72,
    aov: 2890,
    customers: 64,
    conversionRate: 7.6,
    revenueByDay: [
      { date: "Mon", revenue: 32000 },
      { date: "Tue", revenue: 28000 },
      { date: "Wed", revenue: 41000 },
      { date: "Thu", revenue: 36000 },
      { date: "Fri", revenue: 52000 },
      { date: "Sat", revenue: 38000 },
      { date: "Sun", revenue: 21500 },
    ],
    topProducts: [],
    ordersByStatus: [
      { status: "DELIVERED", count: 42 },
      { status: "PROCESSING", count: 18 },
      { status: "SHIPPED", count: 14 },
      { status: "PENDING", count: 12 },
    ],
    engagement: mockEngagement(),
  };
}

function rate(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

export async function getEngagementStats(
  since: Date
): Promise<EngagementStats> {
  if (!(await isDatabaseReady())) return mockEngagement();

  const prisma = getPrisma();

  const [events, abandonedCarts, products] = await Promise.all([
    prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: since } },
      select: {
        type: true,
        productId: true,
        metadata: true,
        createdAt: true,
      },
    }),
    prisma.abandonedCart.count({
      where: {
        createdAt: { gte: since },
        recovered: false,
      },
    }),
    prisma.product.findMany({
      select: { id: true, name: true },
    }),
  ]);

  const productNames = new Map(products.map((p) => [p.id, p.name]));

  const typeCounts = new Map<string, number>();
  const productViewCounts = new Map<string, number>();
  const shareChannels = new Map<string, number>();

  let productViews = 0;
  let addToCart = 0;
  let beginCheckout = 0;
  let purchases = 0;
  let assistantOpens = 0;
  let assistantMessages = 0;
  let assistantQuickReplies = 0;

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const pageViewsByDayMap = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    pageViewsByDayMap.set(dayLabels[d.getDay()], 0);
  }

  for (const ev of events) {
    typeCounts.set(ev.type, (typeCounts.get(ev.type) ?? 0) + 1);

    switch (ev.type) {
      case AnalyticsEventType.PRODUCT_VIEW:
        productViews++;
        if (ev.productId) {
          productViewCounts.set(
            ev.productId,
            (productViewCounts.get(ev.productId) ?? 0) + 1
          );
        }
        break;
      case AnalyticsEventType.ADD_TO_CART:
        addToCart++;
        break;
      case AnalyticsEventType.BEGIN_CHECKOUT:
        beginCheckout++;
        break;
      case AnalyticsEventType.PURCHASE:
        purchases++;
        break;
      case AnalyticsEventType.ASSISTANT_OPEN:
        assistantOpens++;
        break;
      case AnalyticsEventType.ASSISTANT_MESSAGE:
        assistantMessages++;
        break;
      case AnalyticsEventType.ASSISTANT_QUICK_REPLY:
        assistantQuickReplies++;
        break;
      case AnalyticsEventType.PRODUCT_SHARE: {
        const meta = ev.metadata as { channel?: string } | null;
        const channel = meta?.channel ?? "unknown";
        shareChannels.set(channel, (shareChannels.get(channel) ?? 0) + 1);
        break;
      }
      case AnalyticsEventType.PAGE_VIEW: {
        const label = dayLabels[ev.createdAt.getDay()];
        pageViewsByDayMap.set(
          label,
          (pageViewsByDayMap.get(label) ?? 0) + 1
        );
        break;
      }
    }
  }

  const topViewedProducts = [...productViewCounts.entries()]
    .map(([productId, views]) => ({
      productId,
      name: productNames.get(productId) ?? "Unknown product",
      views,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);

  return {
    eventsByType: [...typeCounts.entries()]
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count),
    topViewedProducts,
    shareByChannel: [...shareChannels.entries()]
      .map(([channel, count]) => ({ channel, count }))
      .sort((a, b) => b.count - a.count),
    funnel: {
      productViews,
      addToCart,
      beginCheckout,
      purchases,
      viewToCartRate: rate(addToCart, productViews),
      cartToPurchaseRate: rate(purchases, addToCart),
      viewToPurchaseRate: rate(purchases, productViews),
    },
    assistant: {
      opens: assistantOpens,
      messages: assistantMessages,
      quickReplies: assistantQuickReplies,
    },
    abandonedCarts,
    pageViewsByDay: [...pageViewsByDayMap.entries()].map(([date, count]) => ({
      date,
      count,
    })),
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!(await isDatabaseReady())) return mockStats();

  const prisma = getPrisma();
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [orders, paidOrders, users, items, allOrders, engagement] =
    await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: since }, paymentStatus: "PAID" },
        include: { items: true },
      }),
      prisma.order.count({
        where: { createdAt: { gte: since }, paymentStatus: "PAID" },
      }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.orderItem.findMany({
        where: { order: { createdAt: { gte: since }, paymentStatus: "PAID" } },
        include: { product: true },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: since } },
      }),
      getEngagementStats(since),
    ]);

  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const orderCount = allOrders.length;
  const aov =
    paidOrders > 0 ? Math.round(revenue / paidOrders) : 0;

  const productMap = new Map<
    string,
    { name: string; revenue: number; units: number }
  >();
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

  const conversionRate = engagement.funnel.viewToPurchaseRate;

  return {
    revenue,
    orders: orderCount,
    paidOrders,
    aov,
    customers: users,
    conversionRate,
    revenueByDay,
    topProducts: [...productMap.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5),
    ordersByStatus: [...statusMap.entries()].map(([status, count]) => ({
      status,
      count,
    })),
    engagement,
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
