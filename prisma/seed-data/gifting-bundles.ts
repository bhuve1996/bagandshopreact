/** Ready-made gift sets for individual shoppers (Perfect Gifting). */
export const seedGiftingBundles: {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  kind: "GIFTING";
  minOrderQty: number;
  featured: boolean;
  sortOrder: number;
  priceOverride?: number;
  items: { productSlug: string; quantity: number }[];
}[] = [
  {
    id: "seed-gift-birthday-bliss",
    kind: "GIFTING",
    slug: "birthday-bliss",
    name: "Birthday Bliss Set",
    tagline: "Perfect for her",
    description:
      "A thoughtful pair of beauty essentials — ready to gift with minimal wrapping.",
    minOrderQty: 1,
    featured: true,
    sortOrder: 0,
    items: [
      { productSlug: "multifold-led-makeup-mirror", quantity: 1 },
      { productSlug: "portable-cosmetic-organizer-with-led-mirror", quantity: 1 },
    ],
  },
  {
    id: "seed-gift-home-comfort",
    kind: "GIFTING",
    slug: "home-comfort",
    name: "Home Comfort Hamper",
    tagline: "Housewarming favourite",
    description:
      "Practical home picks bundled for new apartments, festivals, or thank-you gifts.",
    minOrderQty: 1,
    featured: true,
    sortOrder: 1,
    items: [
      { productSlug: "wall-mount-mop-grippers", quantity: 1 },
      { productSlug: "adhesive-punch-free-socket-holder-pack-of-2", quantity: 1 },
    ],
  },
  {
    id: "seed-gift-tech-lover",
    kind: "GIFTING",
    slug: "tech-lover",
    name: "Tech Lover Duo",
    tagline: "For the gadget fan",
    description:
      "Wireless audio and charging — an easy win for birthdays, anniversaries, or Secret Santa.",
    minOrderQty: 1,
    featured: true,
    sortOrder: 2,
    items: [
      { productSlug: "wireless-portable-magnetic-speaker", quantity: 1 },
      {
        productSlug: "transparent-magnetic-wireless-charger-for-iphone",
        quantity: 1,
      },
    ],
  },
];
