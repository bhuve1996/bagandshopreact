import { NextRequest, NextResponse } from "next/server";
import { areCronJobsEnabled } from "@/lib/cron-config";

export function verifyCronRequest(request: NextRequest): NextResponse | null {
  if (!areCronJobsEnabled()) {
    return NextResponse.json(
      { error: "Cron jobs are disabled (set CRON_JOBS_ENABLED=true)" },
      { status: 503 }
    );
  }
  const secret = request.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
