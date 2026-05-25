import { NextRequest, NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/cron-auth";
import { processBackInStockAlerts } from "@/services/cron-jobs";

export async function GET(request: NextRequest) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;
  return NextResponse.json(await processBackInStockAlerts());
}
