import type {
  Category,
  Collection,
  DeviceCategory,
  NavItem,
  Product,
  Testimonial,
} from "@/types";

const img = (id: string, w = 800, h = 1000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const siteConfig = {
  name: "Bag & Shop",
  tagline: "Design-led lifestyle accessories",
  announcement: "Free shipping on orders above ₹999 · New Spring Collection live",
  currency: "INR",
};

export const navigation: NavItem[] = [
  {
    label: "Bags",
    href: "/collections/bags",
    children: [
      { label: "Tote Bags", href: "/collections/tote-bags" },
      { label: "Crossbody", href: "/collections/crossbody" },
      { label: "Laptop Bags", href: "/collections/laptop-bags" },
      { label: "Travel", href: "/collections/travel" },
    ],
    banner: {
      title: "Everyday Carry",
      subtitle: "Minimal forms, maximum function",
      image: img("photo-1590874103328-eac38a683ce7", 600, 400),
      href: "/collections/bags",
    },
  },
  {
    label: "Tech",
    href: "/collections/tech",
    children: [
      { label: "Phone Cases", href: "/collections/phone-cases" },
      { label: "AirPods Cases", href: "/collections/airpods" },
      { label: "Watch Bands", href: "/collections/watch-bands" },
      { label: "Chargers", href: "/collections/chargers" },
    ],
    banner: {
      title: "Device Essentials",
      subtitle: "Protection that looks premium",
      image: img("photo-1611186874728-291b8a01a7d5", 600, 400),
      href: "/collections/tech",
    },
  },
  {
    label: "Desk",
    href: "/collections/desk",
    children: [
      { label: "Organizers", href: "/collections/organizers" },
      { label: "Mouse Pads", href: "/collections/mouse-pads" },
      { label: "Stands", href: "/collections/stands" },
      { label: "Cables", href: "/collections/cables" },
    ],
  },
  {
    label: "Travel",
    href: "/collections/travel",
    children: [
      { label: "Passport Holders", href: "/collections/passport" },
      { label: "Packing Cubes", href: "/collections/packing" },
      { label: "Luggage Tags", href: "/collections/luggage-tags" },
    ],
  },
  {
    label: "Collections",
    href: "/collections",
    children: [
      { label: "New Arrivals", href: "/collections/new-arrivals" },
      { label: "Best Sellers", href: "/collections/best-sellers" },
      { label: "Work From Anywhere", href: "/collections/wfa" },
      { label: "Gift Sets", href: "/collections/gifts" },
    ],
  },
];

export const products: Product[] = [
  {
    id: "1",
    slug: "vegan-leather-tote",
    name: "Vegan Leather Tote",
    description: "Spacious everyday tote with magnetic closure.",
    price: 2499,
    compareAtPrice: 2999,
    images: [img("photo-1590874103328-eac38a683ce7")],
    hoverImage: img("photo-1548036328-c9fa89d128fa"),
    category: "bags",
    collection: "everyday",
    tags: ["bestseller", "vegan"],
    rating: 4.8,
    reviewCount: 324,
    isBestseller: true,
  },
  {
    id: "2",
    slug: "matte-phone-case",
    name: "Matte Snap Case",
    description: "Slim protection with soft-touch finish.",
    price: 899,
    images: [img("photo-1601784551446-20c9e07cdbdb")],
    hoverImage: img("photo-1511707171634-5f897ff02aa9"),
    category: "tech",
    tags: ["new"],
    rating: 4.6,
    reviewCount: 189,
    device: "iPhone 16",
    isNew: true,
  },
  {
    id: "3",
    slug: "desk-organizer-set",
    name: "Desk Organizer Set",
    description: "Three-piece modular desk system.",
    price: 1799,
    images: [img("photo-1586023492125-27b2c045efd7")],
    category: "desk",
    tags: ["bundle"],
    rating: 4.9,
    reviewCount: 97,
    isBestseller: true,
  },
  {
    id: "4",
    slug: "crossbody-mini",
    name: "Crossbody Mini",
    description: "Compact crossbody with adjustable strap.",
    price: 1599,
    images: [img("photo-1548036328-c9fa89d128fa")],
    hoverImage: img("photo-1590874103328-eac38a683ce7"),
    category: "bags",
    tags: ["crossbody"],
    rating: 4.7,
    reviewCount: 212,
  },
  {
    id: "5",
    slug: "wireless-charging-pad",
    name: "Wireless Charging Pad",
    description: "15W fast charge with aluminum base.",
    price: 1299,
    compareAtPrice: 1599,
    images: [img("photo-1591290619762-c588f1e1ebb4")],
    category: "tech",
    tags: ["charging"],
    rating: 4.5,
    reviewCount: 156,
  },
  {
    id: "6",
    slug: "travel-pouch-set",
    name: "Travel Pouch Set",
    description: "Water-resistant pouches in three sizes.",
    price: 999,
    images: [img("photo-1553062407-98eeb64c6a62")],
    category: "travel",
    tags: ["travel"],
    rating: 4.8,
    reviewCount: 88,
    isNew: true,
  },
  {
    id: "7",
    slug: "laptop-sleeve-pro",
    name: "Laptop Sleeve Pro",
    description: "Felt-lined sleeve for 14–16 inch laptops.",
    price: 1899,
    images: [img("photo-1523275335684-37898b6baf30")],
    category: "bags",
    tags: ["laptop"],
    rating: 4.7,
    reviewCount: 143,
  },
  {
    id: "8",
    slug: "premium-mouse-pad",
    name: "Premium Mouse Pad",
    description: "Micro-textured surface with cork base.",
    price: 699,
    images: [img("photo-1615663244697-0beff09a7ad7")],
    category: "desk",
    tags: ["desk"],
    rating: 4.4,
    reviewCount: 67,
  },
];

export const categories: Category[] = [
  {
    id: "bags",
    slug: "bags",
    name: "Bags",
    description: "Carry essentials with intention",
    image: img("photo-1590874103328-eac38a683ce7", 600, 750),
    productCount: 42,
  },
  {
    id: "tech",
    slug: "tech",
    name: "Tech",
    description: "Device protection & accessories",
    image: img("photo-1611186874728-291b8a01a7d5", 600, 750),
    productCount: 68,
  },
  {
    id: "desk",
    slug: "desk",
    name: "Desk",
    description: "Elevate your workspace",
    image: img("photo-1586023492125-27b2c045efd7", 600, 750),
    productCount: 35,
  },
  {
    id: "travel",
    slug: "travel",
    name: "Travel",
    description: "Move light, stay organized",
    image: img("photo-1553062407-98eeb64c6a62", 600, 750),
    productCount: 28,
  },
];

export const collections: Collection[] = [
  {
    id: "new-arrivals",
    slug: "new-arrivals",
    name: "New Arrivals",
    description: "Fresh drops for the season",
    image: img("photo-1523275335684-37898b6baf30", 1200, 800),
    accent: "#C4A77D",
  },
  {
    id: "work-anywhere",
    slug: "work-anywhere",
    name: "Work From Anywhere",
    description: "Desk & carry essentials",
    image: img("photo-1497366216548-37526070297c", 1200, 800),
    accent: "#8B9A8B",
  },
  {
    id: "gift-sets",
    slug: "gift-sets",
    name: "Curated Gift Sets",
    description: "Ready-to-gift bundles",
    image: img("photo-1549465220-1a0b3a0e5c0e", 1200, 800),
    accent: "#A67C52",
  },
];

export const devices: DeviceCategory[] = [
  {
    id: "iphone",
    name: "iPhone",
    slug: "iphone",
    image: img("photo-1511707171634-5f897ff02aa9", 400, 400),
  },
  {
    id: "samsung",
    name: "Samsung",
    slug: "samsung",
    image: img("photo-1610945265064-0e34e5519bbf", 400, 400),
  },
  {
    id: "macbook",
    name: "MacBook",
    slug: "macbook",
    image: img("photo-1517336714731-489689fd1ca8", 400, 400),
  },
  {
    id: "ipad",
    name: "iPad",
    slug: "ipad",
    image: img("photo-1544244015-0df4b3ffc6b0", 400, 400),
  },
  {
    id: "airpods",
    name: "AirPods",
    slug: "airpods",
    image: img("photo-1606220945770-b5b6c2c55bf1", 400, 400),
  },
  {
    id: "watch",
    name: "Apple Watch",
    slug: "watch",
    image: img("photo-1434493789847-2f02dc6ca35d", 400, 400),
  },
];

export const heroSlides = [
  {
    id: "spring",
    title: "Spring Collection",
    subtitle: "Design-led accessories for everyday life",
    cta: "Shop Collection",
    href: "/collections/new-arrivals",
    image: img("photo-1490481651871-ab68de25d43d", 1920, 1080),
  },
  {
    id: "desk",
    title: "Desk Essentials",
    subtitle: "Minimal workspace upgrades",
    cta: "Explore Desk",
    href: "/collections/desk",
    image: img("photo-1586023492125-27b2c045efd7", 1920, 1080),
  },
  {
    id: "travel",
    title: "Travel Light",
    subtitle: "Organized journeys start here",
    cta: "Shop Travel",
    href: "/collections/travel",
    image: img("photo-1553062407-98eeb64c6a62", 1920, 1080),
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Priya Sharma",
    role: "Product Designer",
    content:
      "The quality feels premium without being loud. My tote has survived daily commutes and still looks new.",
    rating: 5,
  },
  {
    id: "2",
    name: "Arjun Mehta",
    role: "Founder",
    content:
      "Finally accessories that match a minimal aesthetic. Checkout was fast and packaging was beautiful.",
    rating: 5,
  },
  {
    id: "3",
    name: "Neha Kapoor",
    role: "Creative Director",
    content:
      "Love the device-specific shop flow. Found the exact case for my phone in seconds.",
    rating: 5,
  },
];

export const trendingSearches = [
  "iPhone 16 case",
  "laptop sleeve",
  "desk organizer",
  "tote bag",
  "gift set",
];

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getBestsellers() {
  return products.filter((p) => p.isBestseller);
}

export function getTrending() {
  return products.slice(0, 6);
}

export function getNewArrivals() {
  return products.filter((p) => p.isNew || p.id === "6");
}
