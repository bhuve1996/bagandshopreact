"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ReferralPanel() {
  const { data } = useQuery({
    queryKey: ["referral"],
    queryFn: () =>
      fetch("/api/account/referral").then(
        (r) => r.json() as Promise<{ code: string; link: string }>
      ),
  });
  const [copied, setCopied] = useState(false);

  if (!data?.code) return null;

  return (
    <div className="card-premium mt-8 p-6">
      <h2 className="text-sm font-semibold">Refer friends</h2>
      <p className="mt-1 text-sm text-muted">
        Share your code — friends save ₹150 on their first order.
      </p>
      <p className="mt-4 font-mono text-lg font-semibold">{data.code}</p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={() => {
          navigator.clipboard.writeText(data.link);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? "Copied!" : "Copy invite link"}
      </Button>
    </div>
  );
}
