import { requireAdmin } from "@/lib/admin-auth";
import { adminListUsers } from "@/services/admin";

export async function GET() {
  const auth = await requireAdmin("users");
  if (auth.error) return auth.error;
  return Response.json(await adminListUsers());
}
