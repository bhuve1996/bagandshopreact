import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { saveAbandonedCart } from "@/services/abandoned-cart";

const schema = z.object({
  email: z.string().email().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      image: z.string(),
      price: z.number(),
      quantity: z.number(),
      slug: z.string(),
    })
  ),
  subtotal: z.number(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = schema.parse(await request.json());
    if (body.items.length === 0) {
      return NextResponse.json({ ok: true });
    }
    await saveAbandonedCart({
      userId: session?.user?.id,
      email: body.email ?? session?.user?.email ?? undefined,
      items: body.items,
      subtotal: body.subtotal,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
