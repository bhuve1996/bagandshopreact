import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import {
  adminListCorporateInquiries,
  adminUpdateCorporateInquiryStatus,
} from "@/services/corporate";

export async function GET() {
  const auth = await requireAdmin("content");
  if (auth.error) return auth.error;
  return NextResponse.json(await adminListCorporateInquiries());
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin("content");
  if (auth.error) return auth.error;
  try {
    const { id, status } = z
      .object({
        id: z.string(),
        status: z.enum(["NEW", "CONTACTED", "CLOSED"]),
      })
      .parse(await request.json());
    const row = await adminUpdateCorporateInquiryStatus(id, status);
    return NextResponse.json(row);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
