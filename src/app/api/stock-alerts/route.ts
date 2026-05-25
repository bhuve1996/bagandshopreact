import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { isDatabaseReady } from "@/lib/db-ready";
import { getProductBySlug } from "@/services/products";
import { subscribeStockAlert } from "@/services/stock-alerts";

const bodySchema = z.object({
  email: z.string().email(),
  productSlug: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const body = bodySchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!(await isDatabaseReady())) {
    return NextResponse.json({ ok: true, mock: true });
  }

  const product = await getProductBySlug(body.data.productSlug);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const session = await getServerSession(authOptions);
  await subscribeStockAlert({
    email: body.data.email,
    productId: product.id,
    userId: session?.user?.id,
  });

  return NextResponse.json({ ok: true });
}
