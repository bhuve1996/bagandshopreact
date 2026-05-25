import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { submitCorporateInquiry } from "@/services/corporate";

const schema = z.object({
  companyName: z.string().min(1).max(200),
  contactName: z.string().min(1).max(120),
  email: z.string().email().max(200),
  phone: z.string().max(30).optional(),
  bundleId: z.string().optional(),
  quantity: z.number().int().min(1).max(100000).optional(),
  message: z.string().max(2000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json());
    const inquiry = await submitCorporateInquiry(body);
    return NextResponse.json({ ok: true, id: inquiry.id }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to submit inquiry";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
