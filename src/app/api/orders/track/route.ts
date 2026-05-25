import { NextRequest, NextResponse } from "next/server";
import { getOrderByNumber } from "@/services/orders";

export async function GET(request: NextRequest) {
  const orderNumber = request.nextUrl.searchParams.get("order");
  if (!orderNumber) {
    return NextResponse.json({ error: "Order number required" }, { status: 400 });
  }
  const order = await getOrderByNumber(orderNumber);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    total: order.total,
    createdAt: order.createdAt,
  });
}
