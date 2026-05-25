import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { trackEvent } from "@/services/analytics";

const schema = z.object({
  type: z.string(),
  path: z.string().optional(),
  productId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json());
    await trackEvent(body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }
}
