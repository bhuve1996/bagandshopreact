import { staticPageMetadata } from "@/lib/seo/config";
import { TrackOrderView } from "@/features/orders/track-order-view";

export async function generateMetadata() {
  return staticPageMetadata("/track-order", {
    title: "Track order",
    description:
      "Track your Bag & Shop order status with your order number.",
  });
}

export default function TrackOrderPage() {
  return <TrackOrderView />;
}
