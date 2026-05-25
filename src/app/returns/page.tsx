import { StaticPageLayout } from "@/components/content/static-page-layout";
import { staticPageMetadata } from "@/lib/seo/config";

export async function generateMetadata() {
  return staticPageMetadata("/returns", {
    title: "Returns",
    description:
      "15-day returns policy and how to return Bag & Shop products.",
  });
}

export default function ReturnsPage() {
  return (
    <StaticPageLayout title="Returns & exchanges">
      <p>
        We offer a 15-day easy return policy on unused items in original
        packaging with tags attached.
      </p>
      <p>
        To start a return, email us with your order number. Refunds are
        processed within 5–7 business days after we receive the item.
      </p>
      <p>
        Sale items and personalized products may not be eligible unless
        defective.
      </p>
    </StaticPageLayout>
  );
}
