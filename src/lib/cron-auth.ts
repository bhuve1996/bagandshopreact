import { NextRequest, NextResponse } from "next/server";

export function verifyCronRequest(request: NextRequest): NextResponse | null {
  const secret = request.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
