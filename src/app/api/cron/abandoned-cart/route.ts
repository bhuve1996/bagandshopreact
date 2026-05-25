import { NextRequest, NextResponse } from "next/server";
import { processAbandonedCartReminders } from "@/services/abandoned-cart";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await processAbandonedCartReminders();
  return NextResponse.json(result);
}
