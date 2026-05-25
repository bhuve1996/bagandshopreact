import { isDatabaseReady } from "@/lib/db-ready";
import { getPrisma } from "@/lib/prisma";

export async function subscribeStockAlert(params: {
  email: string;
  productId: string;
  userId?: string;
}) {
  if (!(await isDatabaseReady())) {
    return { id: "mock", mock: true };
  }

  return getPrisma().stockAlert.upsert({
    where: {
      email_productId: {
        email: params.email.toLowerCase(),
        productId: params.productId,
      },
    },
    create: {
      email: params.email.toLowerCase(),
      productId: params.productId,
      userId: params.userId,
    },
    update: {
      notifiedAt: null,
      userId: params.userId,
    },
  });
}
