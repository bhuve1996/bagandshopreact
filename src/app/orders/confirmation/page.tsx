"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";

function ConfirmationContent() {
  const params = useSearchParams();
  const orderNumber = params.get("order");

  return (
    <div className="card-premium mx-auto max-w-lg p-10 text-center">
      <h1 className="text-2xl font-semibold">Thank you!</h1>
      <p className="mt-2 text-muted">Your order has been placed.</p>
      {orderNumber && (
        <p className="mt-4 font-mono text-sm">
          Order #{orderNumber}
        </p>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href={`/track-order?order=${orderNumber ?? ""}`}>
            Track order
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/collections">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <div className="section-padding">
      <Suspense>
        <ConfirmationContent />
      </Suspense>
    </div>
  );
}
