import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import {
  hasAdminPermission,
  type AdminPermission,
} from "@/lib/admin-permissions";
import { ADMIN_ROLES, type AdminRole, isAdminRole } from "@/lib/roles";

export { ADMIN_ROLES, isAdminRole };
export type { AdminRole };

export async function requireAdmin(permission?: AdminPermission) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const role = session.user.role ?? "CUSTOMER";
  if (!isAdminRole(role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  if (permission && !hasAdminPermission(role, permission)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session, role };
}
