/** Sample corporate gift bundles — product slugs must exist in catalog. */
export const seedCorporateBundles: {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  kind: "CORPORATE";
  minOrderQty: number;
  featured: boolean;
  sortOrder: number;
  priceOverride?: number;
  items: { productSlug: string; quantity: number }[];
}[] = [
  {
    id: "seed-corp-welcome-kit",
    kind: "CORPORATE",
    slug: "corp-welcome-kit",
    name: "Employee Welcome Kit",
    tagline: "Onboarding gifts that feel premium",
    description:
      "A curated mix of desk and lifestyle essentials — ideal for new hires, client welcome packs, or team milestones.",
    minOrderQty: 25,
    featured: true,
    sortOrder: 0,
    priceOverride: 349900,
    items: [
      { productSlug: "multifold-led-makeup-mirror", quantity: 1 },
      { productSlug: "portable-camping-gas-stove", quantity: 1 },
    ],
  },
  {
    id: "seed-corp-festive-hamper",
    kind: "CORPORATE",
    slug: "corp-festive-hamper",
    name: "Festive Corporate Hamper",
    tagline: "Seasonal gifting made simple",
    description:
      "Ready-to-ship hamper concept for Diwali, year-end, or appreciation drives. Custom branding and note cards on request.",
    minOrderQty: 50,
    featured: true,
    sortOrder: 1,
    items: [
      { productSlug: "multifold-led-makeup-mirror", quantity: 1 },
      { productSlug: "wireless-portable-magnetic-speaker", quantity: 1 },
    ],
  },
  {
    id: "seed-corp-wellness-pack",
    kind: "CORPORATE",
    slug: "corp-wellness-pack",
    name: "Wellness & Self-Care Pack",
    tagline: "Thoughtful gifts for distributed teams",
    description:
      "Beauty and home picks bundled for HR wellness programs, women's day campaigns, or executive gifting.",
    minOrderQty: 20,
    featured: false,
    sortOrder: 2,
    items: [
      { productSlug: "portable-cosmetic-organizer-with-led-mirror", quantity: 1 },
      { productSlug: "multifold-led-makeup-mirror", quantity: 1 },
    ],
  },
];
