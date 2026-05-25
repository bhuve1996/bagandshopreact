"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ReviewView } from "@/services/reviews";

export function ProductReviews({ slug }: { slug: string }) {
  const { data: session } = useSession();
  const qc = useQueryClient();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [msg, setMsg] = useState("");

  const { data } = useQuery<{ reviews: ReviewView[] }>({
    queryKey: ["reviews", slug],
    queryFn: async () => {
      const res = await fetch(`/api/products/${slug}/reviews`);
      return res.json() as Promise<{ reviews: ReviewView[] }>;
    },
  });

  const reviews: ReviewView[] = data?.reviews ?? [];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch(`/api/products/${slug}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, title, content }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(j.error ?? "Could not submit review");
      return;
    }
    setMsg("Thanks! Your review will appear after approval.");
    setContent("");
    setTitle("");
    qc.invalidateQueries({ queryKey: ["reviews", slug] });
  }

  return (
    <section className="mt-16 border-t border-border pt-12" id="reviews">
      <h2 className="text-xl font-semibold tracking-tight">
        Customer reviews
      </h2>
      <ul className="mt-6 space-y-6">
        {reviews.map((r) => (
          <li key={r.id} className="border-b border-border pb-6 last:border-0">
            <div className="flex items-center gap-2">
              <span className="text-amber-600">{"★".repeat(r.rating)}</span>
              <span className="text-sm text-muted">{r.userName}</span>
            </div>
            {r.title && <p className="mt-1 font-medium">{r.title}</p>}
            <p className="mt-1 text-sm text-muted leading-relaxed">{r.content}</p>
          </li>
        ))}
      </ul>

      {session ? (
        <form onSubmit={submit} className="card-premium mt-8 max-w-lg space-y-3 p-6">
          <p className="text-sm font-medium">Write a review</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={n <= rating ? "text-amber-600" : "text-muted"}
              >
                ★
              </button>
            ))}
          </div>
          <input
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-10 w-full rounded-lg border border-border px-3 text-sm"
          />
          <textarea
            required
            minLength={10}
            placeholder="Your experience…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
          {msg && <p className="text-sm text-muted">{msg}</p>}
          <Button type="submit" size="sm">
            Submit review
          </Button>
        </form>
      ) : (
        <p className="mt-6 text-sm text-muted">
          <Link href="/login" className="underline">
            Sign in
          </Link>{" "}
          to leave a review.
        </p>
      )}
    </section>
  );
}
