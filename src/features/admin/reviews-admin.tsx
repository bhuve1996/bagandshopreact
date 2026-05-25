"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

type ReviewRow = {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  approved: boolean;
  user: { email: string; name: string | null };
  product: { name: string; slug: string };
};

export function ReviewsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: () =>
      fetch("/api/admin/reviews?pending=true").then(
        (r) => r.json() as Promise<ReviewRow[]>
      ),
  });

  async function moderate(id: string, approved: boolean) {
    await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, approved }),
    });
    qc.invalidateQueries({ queryKey: ["admin-reviews"] });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Review moderation</h1>
      <ul className="space-y-4">
        {(data ?? []).map((r) => (
          <li key={r.id} className="card-premium p-4">
            <p className="text-sm text-muted">
              {r.product.name} · {r.user.email} · {"★".repeat(r.rating)}
            </p>
            {r.title && <p className="mt-1 font-medium">{r.title}</p>}
            <p className="mt-1 text-sm">{r.content}</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => moderate(r.id, true)}>
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => moderate(r.id, false)}
              >
                Reject
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {(data ?? []).length === 0 && (
        <p className="text-muted">No pending reviews.</p>
      )}
    </div>
  );
}
