import { isDatabaseReady } from "@/lib/db-ready";
import { getPrisma } from "@/lib/prisma";
import { sendAbandonedCartEmail } from "@/services/email";
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

export async function processAbandonedCartReminders() {
  if (!(await isDatabaseReady())) return { sent: 0, mock: true };

  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - 1);

  const carts = await getPrisma().abandonedCart.findMany({
    where: {
      recovered: false,
      remindedAt: null,
      updatedAt: { lte: cutoff },
      email: { not: null },
    },
    take: 20,
  });

  let sent = 0;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  for (const cart of carts) {
    if (!cart.email) continue;
    const items = cart.items as CartItem[];
    const result = await sendAbandonedCartEmail({
      to: cart.email,
      items: items.map((i) => ({ name: i.name, quantity: i.quantity })),
      subtotal: cart.subtotal,
      recoveryUrl: `${siteUrl}/checkout`,
    });
    if (result.ok) {
      await getPrisma().abandonedCart.update({
        where: { id: cart.id },
        data: { remindedAt: new Date() },
      });
      sent++;
    }
  }

  return { sent };
}
