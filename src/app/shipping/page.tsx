import { StaticPageLayout } from "@/components/content/static-page-layout";

export const metadata = { title: "Shipping" };

export default function ShippingPage() {
  return (
    <StaticPageLayout title="Shipping">
      <p>
        We ship across India. Orders are processed within 1–2 business days.
        Standard delivery takes 2–5 business days depending on your pin code.
      </p>
      <p>
        Free shipping applies on orders above ₹999. You will receive tracking
        details by email once your order ships.
      </p>
      <p>
        For order status, visit{" "}
        <a href="/track-order" className="text-foreground underline">
          Track order
        </a>{" "}
        or check your account orders after signing in.
      </p>
    </StaticPageLayout>
  );
}
