import { WishlistView } from "@/features/wishlist/wishlist-view";
import { staticPageMetadata } from "@/lib/seo/config";

export async function generateMetadata() {
  const meta = await staticPageMetadata("/wishlist", {
    title: "Wishlist",
    description: "Your saved Bag & Shop products.",
  });
  return { ...meta, robots: { index: false, follow: true } };
}

export default function WishlistPage() {
  return (
    <div className="section-padding">
      <div className="container-page">
        <h1 className="text-3xl font-semibold tracking-tight">Wishlist</h1>
        <div className="mt-12">
          <WishlistView />
        </div>
      </div>
    </div>
  );
}
