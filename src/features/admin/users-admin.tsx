"use client";

import { useQuery } from "@tanstack/react-query";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  _count?: { orders: number };
};

export function UsersAdmin() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () =>
      fetch("/api/admin/users").then((r) => r.json() as Promise<UserRow[]>),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Users</h1>
      {isLoading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <div className="card-premium overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="p-4">Email</th>
                <th className="p-4">Name</th>
                <th className="p-4">Role</th>
                <th className="p-4">Orders</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((u) => (
                <tr key={u.id} className="border-b border-border">
                  <td className="p-4">{u.email}</td>
                  <td className="p-4">{u.name ?? "—"}</td>
                  <td className="p-4">{u.role}</td>
                  <td className="p-4">{u._count?.orders ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
