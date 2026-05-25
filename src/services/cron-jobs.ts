import { isDatabaseReady } from "@/lib/db-ready";
import { cronConfig, getCronAdminEmail, getSiteUrl } from "@/lib/cron-config";
import { getPrisma } from "@/lib/prisma";
import {
  sendAbandonedCartFollowUpEmail,
  sendBackInStockEmail,
  sendCouponExpiryAdminEmail,
  sendLowStockAdminEmail,
  sendPaymentReminderEmail,
  sendReviewRequestEmail,
} from "@/services/email";
function hoursAgo(hours: number) {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d;
}

function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

export async function processReviewRequestReminders() {
  if (!(await isDatabaseReady())) return { sent: 0, mock: true };

  const cutoff = daysAgo(cronConfig.reviewRequest.daysAfterDelivery);
  const siteUrl = getSiteUrl();

  const orders = await getPrisma().order.findMany({
    where: {
      status: "DELIVERED",
      reviewReminderSentAt: null,
      OR: [
        { deliveredAt: { lte: cutoff } },
        { deliveredAt: null, updatedAt: { lte: cutoff } },
      ],
      AND: [
        {
          OR: [
            { customerEmail: { not: null } },
            { user: { isNot: null } },
          ],
        },
      ],
    },
    include: {
      user: { select: { email: true } },
      items: { include: { product: { select: { slug: true } } }, take: 1 },
    },
    take: cronConfig.reviewRequest.batchSize,
  });

  let sent = 0;
  for (const order of orders) {
    const email = order.customerEmail ?? order.user?.email;
    if (!email) continue;
    const slug = order.items[0]?.product?.slug;
    const reviewUrl = slug
      ? `${siteUrl}/products/${slug}#reviews`
      : `${siteUrl}/account/orders`;

    const result = await sendReviewRequestEmail({
      to: email,
      orderNumber: order.orderNumber,
      reviewUrl,
    });
    if (result.ok) {
      await getPrisma().order.update({
        where: { id: order.id },
        data: { reviewReminderSentAt: new Date() },
      });
      sent++;
    }
  }

  return { sent };
}

export async function processExpiredCoupons() {
  if (!(await isDatabaseReady())) return { deactivated: 0, mock: true };

  const now = new Date();
  const expiring = await getPrisma().coupon.findMany({
    where: {
      active: true,
      expiresAt: { lte: now },
    },
  });

  if (expiring.length === 0) return { deactivated: 0 };

  await getPrisma().coupon.updateMany({
    where: { id: { in: expiring.map((c) => c.id) } },
    data: { active: false },
  });

  const adminEmail = getCronAdminEmail();
  if (adminEmail) {
    await sendCouponExpiryAdminEmail({
      to: adminEmail,
      coupons: expiring.map((c) => ({
        code: c.code,
        expiresAt: c.expiresAt?.toISOString() ?? now.toISOString(),
      })),
    });
  }

  return { deactivated: expiring.length };
}

export async function processLowStockAlerts() {
  if (!(await isDatabaseReady())) return { notified: 0, mock: true };

  const adminEmail = getCronAdminEmail();
  if (!adminEmail) return { notified: 0, skipped: "no_admin_email" };

  const threshold = cronConfig.lowStock.threshold;
  await getPrisma().product.updateMany({
    where: {
      stock: { gt: threshold },
      lowStockNotifiedAt: { not: null },
    },
    data: { lowStockNotifiedAt: null },
  });

  const products = await getPrisma().product.findMany({
    where: {
      stock: { lte: cronConfig.lowStock.threshold, gt: 0 },
      lowStockNotifiedAt: null,
    },
    select: { id: true, name: true, stock: true, slug: true },
    take: cronConfig.lowStock.batchSize,
  });

  if (products.length === 0) return { notified: 0 };

  const siteUrl = getSiteUrl();
  const result = await sendLowStockAdminEmail({
    to: adminEmail,
    products,
    adminUrl: `${siteUrl}/admin`,
  });

  if (result.ok) {
    await getPrisma().product.updateMany({
      where: { id: { in: products.map((p) => p.id) } },
      data: { lowStockNotifiedAt: new Date() },
    });
  }

  return { notified: result.ok ? products.length : 0 };
}

export async function processBackInStockAlerts() {
  if (!(await isDatabaseReady())) return { sent: 0, mock: true };

  const siteUrl = getSiteUrl();
  const alerts = await getPrisma().stockAlert.findMany({
    where: { notifiedAt: null },
    include: {
      product: { select: { id: true, name: true, slug: true, stock: true } },
    },
    take: cronConfig.backInStock.batchSize,
  });

  let sent = 0;
  for (const alert of alerts) {
    if (alert.product.stock <= 0) continue;

    const result = await sendBackInStockEmail({
      to: alert.email,
      productName: alert.product.name,
      productUrl: `${siteUrl}/products/${alert.product.slug}`,
    });
    if (result.ok) {
      await getPrisma().stockAlert.update({
        where: { id: alert.id },
        data: { notifiedAt: new Date() },
      });
      sent++;
    }
  }

  return { sent };
}

export async function processPaymentPendingReminders() {
  if (!(await isDatabaseReady())) return { sent: 0, mock: true };

  const cutoff = hoursAgo(cronConfig.paymentPending.minAgeHours);
  const siteUrl = getSiteUrl();

  const orders = await getPrisma().order.findMany({
    where: {
      paymentMethod: "RAZORPAY",
      paymentStatus: "PENDING",
      status: { notIn: ["CANCELLED", "REFUNDED"] },
      paymentReminderSentAt: null,
      createdAt: { lte: cutoff },
      OR: [
        { customerEmail: { not: null } },
        { user: { email: { not: "" } } },
      ],
    },
    include: { user: { select: { email: true } } },
    take: cronConfig.paymentPending.batchSize,
  });

  let sent = 0;
  for (const order of orders) {
    const email = order.customerEmail ?? order.user?.email;
    if (!email) continue;

    const result = await sendPaymentReminderEmail({
      to: email,
      orderNumber: order.orderNumber,
      total: order.total,
      checkoutUrl: `${siteUrl}/checkout?order=${order.orderNumber}`,
    });
    if (result.ok) {
      await getPrisma().order.update({
        where: { id: order.id },
        data: { paymentReminderSentAt: new Date() },
      });
      sent++;
    }
  }

  return { sent };
}

export async function runAllCronJobs() {
  const [
    abandonedCart,
    reviewRequests,
    coupons,
    lowStock,
    backInStock,
    paymentPending,
  ] = await Promise.all([
    (await import("@/services/abandoned-cart")).processAbandonedCartReminders(),
    processReviewRequestReminders(),
    processExpiredCoupons(),
    processLowStockAlerts(),
    processBackInStockAlerts(),
    processPaymentPendingReminders(),
  ]);

  return {
    abandonedCart,
    reviewRequests,
    coupons,
    lowStock,
    backInStock,
    paymentPending,
  };
}
