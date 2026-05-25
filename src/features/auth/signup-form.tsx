"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";

function SignupFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    referralCode: searchParams.get("ref") ?? "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Signup failed");
      return;
    }
    router.push("/login?registered=1");
  }

  return (
    <form onSubmit={handleSubmit} className="card-premium mx-auto max-w-md space-y-4 p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <label className="block">
        <span className="text-xs text-muted">Name</span>
        <input
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="mt-1 h-11 w-full rounded-xl border border-border px-4 text-sm"
        />
      </label>
      <label className="block">
        <span className="text-xs text-muted">Email</span>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="mt-1 h-11 w-full rounded-xl border border-border px-4 text-sm"
        />
      </label>
      <label className="block">
        <span className="text-xs text-muted">Password</span>
        <input
          type="password"
          required
          minLength={6}
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          className="mt-1 h-11 w-full rounded-xl border border-border px-4 text-sm"
        />
      </label>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating…" : "Sign up"}
      </Button>
      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Sign in
        </Link>
      </p>
      {form.referralCode && (
        <p className="text-xs text-muted">Referral: {form.referralCode}</p>
      )}
    </form>
  );
}

export function SignupForm() {
  return (
    <Suspense>
      <SignupFormInner />
    </Suspense>
  );
}
