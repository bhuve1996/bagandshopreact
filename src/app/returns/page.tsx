import { StaticPageLayout } from "@/components/content/static-page-layout";

export const metadata = { title: "Returns" };

export default function ReturnsPage() {
  return (
    <StaticPageLayout title="Returns & exchanges">
      <p>
        We offer a 15-day easy return policy on unused items in original
        packaging with tags attached.
      </p>
      <p>
        To start a return, email support with your order number. Refunds are
        processed to your original payment method within 5–7 business days after
        we receive the item.
      </p>
      <p>
        Exchanges are subject to stock availability. See our{" "}
        <a href="/faq" className="text-foreground underline">
          FAQ
        </a>{" "}
        for more details.
      </p>
    </StaticPageLayout>
  );
}
