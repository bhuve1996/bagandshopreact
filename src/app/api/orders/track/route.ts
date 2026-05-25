import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit } from "@/lib/security/rate-limit";
import { getOrderForTracking } from "@/services/orders";

export async function GET(request: NextRequest) {
  const limited = applyRateLimit(request, "orders-track", {
    limit: 30,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const orderNumber = request.nextUrl.searchParams.get("order")?.trim();
  const email = request.nextUrl.searchParams.get("email")?.trim();
  if (!orderNumber || !email) {
    return NextResponse.json(
      { error: "Order number and email are required" },
      { status: 400 }
    );
  }
  const order = await getOrderForTracking(orderNumber, email);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json(order);
}
