import { NextRequest, NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/cron-auth";
import { processAbandonedCartReminders } from "@/services/abandoned-cart";

export async function GET(request: NextRequest) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;
  const result = await processAbandonedCartReminders();
  return NextResponse.json(result);
}
