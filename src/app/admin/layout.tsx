import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { authOptions } from "@/lib/auth";
import { getAdminNavHrefsForRole } from "@/lib/admin-permissions";
import { isAdminRole } from "@/lib/roles";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/admin");
  if (!isAdminRole(session.user.role)) redirect("/account");

  const allowedHrefs = getAdminNavHrefsForRole(session.user.role ?? "CUSTOMER");

  return <AdminShell allowedHrefs={allowedHrefs}>{children}</AdminShell>;
}
