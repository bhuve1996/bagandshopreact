import { WishlistView } from "@/features/wishlist/wishlist-view";

export const metadata = { title: "Wishlist" };

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
