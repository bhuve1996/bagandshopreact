import { requireAdmin } from "@/lib/admin-auth";
import { adminListOrders } from "@/services/admin";

export async function GET() {
  const auth = await requireAdmin("orders");
  if (auth.error) return auth.error;
  const orders = await adminListOrders();
  return Response.json(orders);
}
