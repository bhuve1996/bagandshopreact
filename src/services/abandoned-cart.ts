import { isDatabaseReady } from "@/lib/db-ready";
import { cronConfig, getSiteUrl } from "@/lib/cron-config";
import { getPrisma } from "@/lib/prisma";
import { sendAbandonedCartFollowUpEmail } from "@/services/email";
import type { CartItem } from "@/types";

export async function saveAbandonedCart(params: {
  userId?: string;
  email?: string;
  items: CartItem[];
  subtotal: number;
}) {
  if (!params.items.length) return null;
  if (!(await isDatabaseReady())) {
    if (process.env.NODE_ENV === "development") {
      console.log("[abandoned-cart:mock]", params.email, params.items.length);
    }
    return { id: "mock", mock: true };
  }

  const itemsJson = JSON.parse(JSON.stringify(params.items));

  if (params.userId) {
    const existing = await getPrisma().abandonedCart.findFirst({
      where: { userId: params.userId, recovered: false },
      orderBy: { updatedAt: "desc" },
    });
    if (existing) {
      return getPrisma().abandonedCart.update({
        where: { id: existing.id },
        data: { items: itemsJson, subtotal: params.subtotal, email: params.email },
      });
    }
  }

  if (params.email) {
    const existing = await getPrisma().abandonedCart.findFirst({
      where: { email: params.email, recovered: false },
      orderBy: { updatedAt: "desc" },
    });
    if (existing) {
      return getPrisma().abandonedCart.update({
        where: { id: existing.id },
        data: { items: itemsJson, subtotal: params.subtotal, userId: params.userId },
      });
    }
  }

  return getPrisma().abandonedCart.create({
    data: {
      userId: params.userId,
      email: params.email,
      items: itemsJson,
      subtotal: params.subtotal,
    },
  });
}

export async function markCartRecovered(userId?: string, email?: string) {
  if (!(await isDatabaseReady())) return;
  await getPrisma().abandonedCart.updateMany({
    where: {
      recovered: false,
      OR: [
        ...(userId ? [{ userId }] : []),
        ...(email ? [{ email }] : []),
      ],
    },
    data: { recovered: true },
  });
}

function reminderDelayHours(count: number) {
  const { firstDelayHours, secondDelayHours, thirdDelayHours } =
    cronConfig.abandonedCart;
  if (count === 0) return firstDelayHours;
  if (count === 1) return secondDelayHours;
  return thirdDelayHours;
}

export async function processAbandonedCartReminders() {
  if (!(await isDatabaseReady())) return { sent: 0, mock: true };

  const { maxReminders, batchSize } = cronConfig.abandonedCart;
  const siteUrl = getSiteUrl();
  const now = new Date();

  const candidates = await getPrisma().abandonedCart.findMany({
    where: {
      recovered: false,
      reminderCount: { lt: maxReminders },
      email: { not: null },
    },
    take: batchSize * 2,
    orderBy: { updatedAt: "asc" },
  });

  let sent = 0;

  for (const cart of candidates) {
    if (sent >= batchSize) break;
    if (!cart.email) continue;

    const count = cart.reminderCount;
    const delayHours = reminderDelayHours(count);
    const cutoff = new Date(now);
    cutoff.setHours(cutoff.getHours() - delayHours);

    const readyAt = count === 0 ? cart.updatedAt : cart.remindedAt;
    if (!readyAt || readyAt > cutoff) continue;

    const items = cart.items as CartItem[];
    const result = await sendAbandonedCartFollowUpEmail({
      to: cart.email,
      items: items.map((i) => ({ name: i.name, quantity: i.quantity })),
      subtotal: cart.subtotal,
      recoveryUrl: `${siteUrl}/checkout`,
      stage: count,
    });

    if (result.ok) {
      await getPrisma().abandonedCart.update({
        where: { id: cart.id },
        data: {
          remindedAt: new Date(),
          reminderCount: count + 1,
        },
      });
      sent++;
    }
  }

  return { sent };
}
