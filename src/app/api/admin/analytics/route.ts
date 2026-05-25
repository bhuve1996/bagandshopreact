import { requireAdmin } from "@/lib/admin-auth";
import { getDashboardStats } from "@/services/analytics";

export async function GET() {
  const auth = await requireAdmin("analytics");
  if (auth.error) return auth.error;
  const stats = await getDashboardStats();
  return Response.json(stats);
}
