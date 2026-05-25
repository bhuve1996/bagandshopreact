import { requireAdmin } from "@/lib/admin-auth";
import { adminListCategories } from "@/services/admin";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  return Response.json(await adminListCategories());
}
