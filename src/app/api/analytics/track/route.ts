import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AnalyticsEventType } from "@/lib/analytics-events";
import { trackEvent } from "@/services/analytics";

const knownTypes = Object.values(AnalyticsEventType);

const schema = z.object({
  type: z.string().min(1).max(64),
  path: z.string().max(512).optional(),
  productId: z.string().max(64).optional(),
  orderId: z.string().max(64).optional(),
  userId: z.string().max(64).optional(),
  metadata: z
    .record(
      z.string(),
      z.union([z.string(), z.number(), z.boolean(), z.null()])
    )
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json());
    if (
      !knownTypes.includes(body.type as (typeof knownTypes)[number]) &&
      !body.type.startsWith("custom_")
    ) {
      return NextResponse.json({ error: "Unknown event type" }, { status: 400 });
    }
    await trackEvent(body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
