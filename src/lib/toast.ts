import { toast as sonner } from "sonner";

/** Customer-facing toast helpers — use for actions and errors on the storefront. */
export const toast = {
  success: (message: string, description?: string) =>
    sonner.success(message, description ? { description } : undefined),

  error: (message: string, description?: string) =>
    sonner.error(message, description ? { description } : undefined),

  info: (message: string, description?: string) =>
    sonner.info(message, description ? { description } : undefined),

  addedToCart: (name: string, quantity = 1) => {
    const label =
      quantity > 1 ? `${name} (×${quantity})` : name;
    sonner.success("Added to cart", { description: label });
  },

  wishlist: (added: boolean, name?: string) => {
    if (added) {
      sonner.success("Saved to wishlist", name ? { description: name } : undefined);
    } else {
      sonner.info("Removed from wishlist", name ? { description: name } : undefined);
    }
  },

  removedFromCart: (name?: string) => {
    sonner.info("Removed from cart", name ? { description: name } : undefined);
  },
};
