"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  createOrderApi,
  fetchActiveCouponsApi,
  type PublicCoupon,
  validateCouponApi,
} from "@/lib/api-client";
import { formatCouponOffer } from "@/lib/coupon-utils";
import { toast } from "@/lib/toast";
import { formatPrice } from "@/lib/utils";
import { AnalyticsEventType } from "@/lib/analytics-events";
import { trackAnalytics } from "@/lib/analytics-client";
import { StorefrontTrustBenefits } from "@/components/store/storefront-trust-benefits";
import { useCartStore, useCartTotals } from "@/store/cart-store";

const SHIPPING_FREE = 999;
const SHIPPING_COST = 99;

export function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { items, clearCart } = useCartStore();
  const { subtotal, itemCount } = useCartTotals();
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [referral, setReferral] = useState("");
  const [discount, setDiscount] = useState(0);
  const [referralDiscount, setReferralDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [activeCoupons, setActiveCoupons] = useState<PublicCoupon[]>([]);
  const [applyingCode, setApplyingCode] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "UPI" | "RAZORPAY">("COD");
  const [loading, setLoading] = useState(false);
  const appliedUrlCoupon = useRef(false);
  const [form, setForm] = useState({
    email: session?.user?.email ?? "",
    fullName: session?.user?.name ?? "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const shipping = subtotal >= SHIPPING_FREE ? 0 : SHIPPING_COST;
  const taxable = Math.max(0, subtotal - discount - referralDiscount);
  const tax = Math.round(taxable * 0.18);
  const total = taxable + shipping + tax;

  useEffect(() => {
    if (itemCount > 0) {
      trackAnalytics({
        type: AnalyticsEventType.BEGIN_CHECKOUT,
        metadata: { itemCount, subtotal },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per checkout visit
  }, []);

  useEffect(() => {
    fetchActiveCouponsApi()
      .then(setActiveCoupons)
      .catch(() => setActiveCoupons([]));
  }, []);

  async function applyCoupon(code?: string) {
    const codeToApply = (code ?? coupon).trim().toUpperCase();
    if (!codeToApply) {
      toast.error("Enter a coupon code");
      return;
    }
    setApplyingCode(codeToApply);
    try {
      const result = await validateCouponApi(codeToApply, subtotal);
      if (result.valid) {
        setCoupon(codeToApply);
        setAppliedCoupon(result.code ?? codeToApply);
        setDiscount(result.discount);
        setCouponMsg("");
        toast.success("Coupon applied", result.code ?? codeToApply);
      } else {
        setDiscount(0);
        setAppliedCoupon("");
        setCouponMsg("");
        toast.error(result.message ?? "Invalid coupon");
      }
    } catch {
      toast.error("Could not validate coupon", "Please try again.");
    } finally {
      setApplyingCode(null);
    }
  }

  useEffect(() => {
    const fromUrl = searchParams.get("coupon")?.trim().toUpperCase();
    if (!fromUrl || itemCount === 0 || appliedUrlCoupon.current) return;
    appliedUrlCoupon.current = true;
    setCoupon(fromUrl);
    void applyCoupon(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per visit when URL includes coupon
  }, [searchParams, itemCount]);

  async function applyReferral() {
    if (!referral.trim()) {
      toast.error("Enter a referral code");
      return;
    }
    try {
      const res = await fetch("/api/referrals/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: referral }),
      });
      const result = await res.json();
      if (result.valid) {
        setReferralDiscount(result.discount);
        setCouponMsg("");
        toast.success("Referral applied", `You save ₹${result.discount}`);
      } else {
        setReferralDiscount(0);
        setCouponMsg("");
        toast.error(result.message ?? "Invalid referral code");
      }
    } catch {
      toast.error("Could not validate referral", "Please try again.");
    }
  }

  async function placeOrder(extra?: {
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
    razorpaySignature?: string;
  }) {
    const order = await createOrderApi({
      items,
      paymentMethod,
      couponCode: discount > 0 ? appliedCoupon || coupon : undefined,
      customerEmail: form.email || undefined,
      shipping: {
        fullName: form.fullName,
        phone: form.phone,
        line1: form.line1,
        line2: form.line2,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      },
      ...extra,
    });
    clearCart();
    toast.success("Order placed!", `Order ${order.orderNumber}`);
    router.push(
      `/orders/confirmation?order=${order.orderNumber}${order.mock ? "&mock=1" : ""}`
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setLoading(true);
    setCouponMsg("");
    try {
      if (paymentMethod === "RAZORPAY") {
        const { openRazorpayCheckout } = await import("@/lib/razorpay-checkout");
        const receipt = `BS${Date.now().toString(36).toUpperCase()}`;
        const couponForOrder =
          discount > 0 ? appliedCoupon || coupon : undefined;
        await openRazorpayCheckout({
          items,
          couponCode: couponForOrder,
          receipt,
          name: form.fullName,
          email: form.email,
          phone: form.phone,
          onSuccess: async (response) => {
            await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...response, orderNumber: receipt }),
            });
            await placeOrder({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
          },
        });
        setLoading(false);
        return;
      }
      await placeOrder();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Checkout failed. Please try again.";
      setCouponMsg("");
      toast.error("Checkout failed", message);
    } finally {
      setLoading(false);
    }
  }

  if (itemCount === 0) {
    return (
      <p className="py-16 text-center text-muted">
        Your cart is empty.{" "}
        <a href="/collections" className="underline">
          Continue shopping
        </a>
      </p>
    );
  }

  return (
    <>
      <StorefrontTrustBenefits placement="checkout" className="mb-10" />
      <form onSubmit={handleSubmit} className="grid gap-12 lg:grid-cols-2">
      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold">Shipping address</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {(
              [
                ["email", "Email", "email"],
                ["fullName", "Full name", "text"],
                ["phone", "Phone", "tel"],
                ["line1", "Address line 1", "text"],
                ["line2", "Address line 2 (optional)", "text"],
                ["city", "City", "text"],
                ["state", "State", "text"],
                ["pincode", "PIN code", "text"],
              ] as const
            ).map(([key, label, type]) => (
              <label key={key} className={key === "line1" ? "sm:col-span-2" : ""}>
                <span className="text-xs text-muted">{label}</span>
                <input
                  required={key !== "line2"}
                  type={type}
                  value={form[key]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [key]: e.target.value }))
                  }
                  className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-stone-300"
                />
              </label>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Payment</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {(["COD", "UPI", "RAZORPAY"] as const).map((m) => (
              <label
                key={m}
                className={`cursor-pointer rounded-full border px-4 py-2 text-sm ${
                  paymentMethod === m
                    ? "border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900"
                    : "border-border"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  className="sr-only"
                  checked={paymentMethod === m}
                  onChange={() => setPaymentMethod(m)}
                />
                {m === "RAZORPAY" ? "Card / UPI (Razorpay)" : m}
              </label>
            ))}
          </div>
          {paymentMethod === "RAZORPAY" && (
            <p className="mt-2 text-xs text-muted">
              Razorpay keys not configured — order will be saved as pending.
            </p>
          )}
        </section>
      </div>

      <div className="card-premium h-fit space-y-4 p-6 lg:sticky lg:top-28">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={`${item.productId}-${item.variantId}`} className="flex justify-between">
              <span className="text-muted">
                {item.name} × {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted">Available offers</p>
          {activeCoupons.length > 0 ? (
            <ul className="space-y-2">
              {activeCoupons.map((c) => {
                const isApplied =
                  appliedCoupon === c.code && discount > 0;
                return (
                  <li
                    key={c.code}
                    className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-sm ${
                      isApplied
                        ? "border-green-600/40 bg-green-50 dark:bg-green-950/30"
                        : "border-border"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{c.code}</p>
                      <p className="text-xs text-muted">
                        {c.description ?? formatCouponOffer(c)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant={isApplied ? "default" : "outline"}
                      size="sm"
                      disabled={isApplied || applyingCode === c.code}
                      onClick={() => applyCoupon(c.code)}
                    >
                      {isApplied
                        ? "Applied"
                        : applyingCode === c.code
                          ? "Applying…"
                          : "Apply"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-xs text-muted">No offers available right now.</p>
          )}
          <div className="flex gap-2">
            <input
              value={coupon}
              onChange={(e) => {
                setCoupon(e.target.value.toUpperCase());
                if (appliedCoupon && e.target.value.toUpperCase() !== appliedCoupon) {
                  setAppliedCoupon("");
                  setDiscount(0);
                }
              }}
              placeholder="Or enter a coupon code"
              className="h-10 flex-1 rounded-full border border-border px-4 text-sm"
            />
            <Button
              type="button"
              variant="outline"
              disabled={!!applyingCode}
              onClick={() => applyCoupon()}
            >
              {applyingCode && !activeCoupons.some((c) => c.code === applyingCode)
                ? "Applying…"
                : "Apply"}
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            value={referral}
            onChange={(e) => setReferral(e.target.value.toUpperCase())}
            placeholder="Referral code"
            className="h-10 flex-1 rounded-full border border-border px-4 text-sm"
          />
          <Button type="button" variant="outline" onClick={applyReferral}>
            Apply
          </Button>
        </div>
        {couponMsg && (
          <p className="text-xs text-muted">{couponMsg}</p>
        )}
        <dl className="space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-700">
              <dt>Discount</dt>
              <dd>-{formatPrice(discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted">Shipping</dt>
            <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Tax (GST 18%)</dt>
            <dd>{formatPrice(tax)}</dd>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatPrice(total)}</dd>
          </div>
        </dl>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Placing order…" : "Place order"}
        </Button>
      </div>
    </form>
    </>
  );
}
