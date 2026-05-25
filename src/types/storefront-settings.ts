export type ShareChannel =
  | "copy"
  | "whatsapp"
  | "email"
  | "facebook"
  | "twitter"
  | "native";

export type HomepageSectionCopy = {
  eyebrow: string;
  title: string;
  description?: string;
  linkText?: string;
  linkHref?: string;
};

export type HomepageCopy = {
  videos: HomepageSectionCopy & { learnMore: string };
  featuredCategories: HomepageSectionCopy;
  trending: HomepageSectionCopy;
  collections: HomepageSectionCopy & { exploreCta: string };
  shopByCategory: HomepageSectionCopy;
  bestSellers: HomepageSectionCopy;
  testimonials: HomepageSectionCopy;
  instagram: HomepageSectionCopy & { instagramHandle: string };
  newsletter: HomepageSectionCopy & {
    subscribeButton: string;
    successMessage: string;
    emailPlaceholder: string;
  };
};

export type BrandCopy = {
  name: string;
  tagline: string;
  announcement: string;
  announcementLinkText: string;
  announcementHref: string;
};

export type LabelsCopy = {
  addToCart: string;
  outOfStock: string;
  learnMore: string;
  shopNow: string;
  viewAll: string;
  viewAllCategories: string;
  viewAllBestSellers: string;
  shopTrending: string;
  exploreCollection: string;
  productsCount: string;
  productCount: string;
  newBadge: string;
  bestsellerBadge: string;
  subscribe: string;
  discover: string;
};

export type FaqItem = { q: string; a: string };

export type SeoPageOverride = {
  path: string;
  title: string;
  description: string;
  noIndex?: boolean;
};

/** Meta tags, Open Graph defaults, verification codes, FAQ schema content. */
export type SeoSettings = {
  homeTitle: string;
  defaultDescription: string;
  defaultOgImage: string;
  ogLocale: string;
  twitterHandle?: string;
  googleSiteVerification?: string;
  allowIndexing: boolean;
  organizationLogo: string;
  faqMetaTitle: string;
  faqMetaDescription: string;
  faqItems: FaqItem[];
  pageOverrides: SeoPageOverride[];
};

export type StorefrontSettings = {
  brand: BrandCopy;
  homepage: HomepageCopy;
  labels: LabelsCopy;
  seo: SeoSettings;
  support: {
    email: string;
    phone?: string;
    whatsappNumber?: string;
    hours?: string;
  };
  share: {
    enabled: boolean;
    channels: ShareChannel[];
    productMessageTemplate: string;
  };
  assistant: {
    enabled: boolean;
    title: string;
    greeting: string;
    quickReplies: { label: string; query: string }[];
    faqRules: { keywords: string[]; answer: string }[];
    showWhatsAppLink: boolean;
  };
  delivery: {
    showOnPdp: boolean;
    estimateText: string;
  };
};

export const STOREFRONT_SETTINGS_KEY = "storefront";

export const DEFAULT_HOMEPAGE_COPY: HomepageCopy = {
  videos: {
    eyebrow: "In motion",
    title: "See Bag & Shop in action",
    description: "Short clips from our latest collections and drops.",
    learnMore: "Learn more",
  },
  featuredCategories: {
    eyebrow: "Shop by category",
    title: "Find your fit",
    linkText: "View all",
    linkHref: "/collections",
  },
  trending: {
    eyebrow: "Trending now",
    title: "Most loved this week",
    linkText: "Shop trending",
    linkHref: "/collections/best-sellers",
  },
  collections: {
    eyebrow: "Curated collections",
    title: "Stories worth carrying",
    exploreCta: "Explore →",
  },
  shopByCategory: {
    eyebrow: "Shop by category",
    title: "Explore the catalog",
    description:
      "Beauty, home, travel, tech, and everyday essentials — all in one place.",
    linkText: "View all categories",
    linkHref: "/collections",
  },
  bestSellers: {
    eyebrow: "Best sellers",
    title: "Customer favorites",
    linkText: "View all best sellers",
    linkHref: "/collections/best-sellers",
  },
  testimonials: {
    eyebrow: "Loved by customers",
    title: "What our community says",
  },
  instagram: {
    eyebrow: "@bagandshop",
    title: "Follow the lifestyle",
    instagramHandle: "@bagandshop",
    linkText: "View on Instagram",
    linkHref: "https://instagram.com",
  },
  newsletter: {
    eyebrow: "Newsletter",
    title: "Early access to drops & offers",
    description: "Join 50,000+ design lovers. Unsubscribe anytime.",
    subscribeButton: "Subscribe",
    successMessage: "Thanks — you're on the list.",
    emailPlaceholder: "you@email.com",
  },
};

export const DEFAULT_LABELS: LabelsCopy = {
  addToCart: "Add to cart",
  outOfStock: "Out of stock",
  learnMore: "Learn more",
  shopNow: "Shop now",
  viewAll: "View all",
  viewAllCategories: "View all categories",
  viewAllBestSellers: "View all best sellers",
  shopTrending: "Shop trending",
  exploreCollection: "Explore →",
  productsCount: "{{count}} products",
  productCount: "{{count}} product",
  newBadge: "New",
  bestsellerBadge: "Best seller",
  subscribe: "Subscribe",
  discover: "Discover",
};

export const DEFAULT_BRAND: BrandCopy = {
  name: "Bag & Shop",
  tagline: "Design-led lifestyle accessories",
  announcement: "Free shipping on orders above ₹999 · Shop the latest drops",
  announcementLinkText: "Shop now",
  announcementHref: "/collections/new-arrivals",
};

export const DEFAULT_SEO: SeoSettings = {
  homeTitle: "Bag & Shop — Design-led lifestyle accessories",
  defaultDescription:
    "Premium design-led lifestyle accessories. Bags, tech cases, desk essentials, and travel gear with minimal luxury aesthetics.",
  defaultOgImage: "/bagnshop_brand_assets/primary-logo.png",
  ogLocale: "en_IN",
  twitterHandle: "",
  googleSiteVerification: "",
  allowIndexing: true,
  organizationLogo: "/bagnshop_brand_assets/primary-logo.png",
  faqMetaTitle: "FAQ",
  faqMetaDescription:
    "Returns, shipping, and payment FAQs for Bag & Shop orders in India.",
  faqItems: [
    {
      q: "What is your return policy?",
      a: "15-day easy returns on unused items in original packaging.",
    },
    {
      q: "How long does shipping take?",
      a: "2–5 business days. Free shipping on orders above ₹999.",
    },
    {
      q: "Which payment methods do you accept?",
      a: "COD, UPI, and Razorpay (cards, wallets, netbanking).",
    },
  ],
  pageOverrides: [
    {
      path: "/about",
      title: "About",
      description: "Learn about Bag & Shop — design-led lifestyle accessories from India.",
    },
    {
      path: "/shipping",
      title: "Shipping",
      description: "Shipping times, free delivery threshold, and tracking for Bag & Shop orders.",
    },
    {
      path: "/returns",
      title: "Returns",
      description: "15-day returns policy and how to return Bag & Shop products.",
    },
    {
      path: "/privacy",
      title: "Privacy policy",
      description:
        "How Bag & Shop collects, uses, and protects your personal information.",
    },
    {
      path: "/terms",
      title: "Terms of service",
      description: "Terms and conditions for shopping at Bag & Shop.",
    },
    {
      path: "/blog",
      title: "Blog",
      description:
        "Design, carry, and workspace stories from Bag & Shop.",
    },
    {
      path: "/careers",
      title: "Careers",
      description: "Join the Bag & Shop team — open roles and how to apply.",
    },
    {
      path: "/contact",
      title: "Contact",
      description: "Get in touch with Bag & Shop customer support.",
    },
    {
      path: "/track-order",
      title: "Track order",
      description:
        "Track your Bag & Shop order status with your order number.",
    },
    {
      path: "/wishlist",
      title: "Wishlist",
      description: "Your saved Bag & Shop products.",
      noIndex: true,
    },
  ],
};

export const DEFAULT_STOREFRONT_SETTINGS: StorefrontSettings = {
  brand: DEFAULT_BRAND,
  homepage: DEFAULT_HOMEPAGE_COPY,
  labels: DEFAULT_LABELS,
  seo: DEFAULT_SEO,
  support: {
    email: "hello@bagandshop.com",
    phone: "",
    whatsappNumber: "",
    hours: "Mon–Sat, 10am–6pm IST. We typically reply within 24 hours.",
  },
  share: {
    enabled: true,
    channels: ["copy", "whatsapp", "email", "native"],
    productMessageTemplate:
      "Check out {{name}} on {{site}}: {{url}}",
  },
  assistant: {
    enabled: true,
    title: "Shop assistant",
    greeting:
      "Hi! I'm your Bag & Shop assistant. Ask about shipping, returns, or this product.",
    quickReplies: [
      { label: "Shipping", query: "How does shipping work?" },
      { label: "Returns", query: "What is your return policy?" },
      { label: "Track order", query: "How do I track my order?" },
      { label: "Payments", query: "What payment methods do you accept?" },
    ],
    faqRules: [
      {
        keywords: ["ship", "delivery", "deliver"],
        answer:
          "We offer free shipping on orders above ₹999. Delivery usually takes 2–5 business days.",
      },
      {
        keywords: ["return", "refund", "exchange"],
        answer:
          "You can return unused items within 15 days in original packaging.",
      },
      {
        keywords: ["track", "order status", "where is"],
        answer:
          "Use the Track Order page with your order number (starts with BS).",
      },
      {
        keywords: ["pay", "cod", "upi", "razorpay", "card"],
        answer:
          "We accept COD, UPI, and Razorpay (cards & wallets).",
      },
      {
        keywords: ["contact", "human", "agent", "support", "help me"],
        answer:
          "Email us or use WhatsApp from the help section — we're happy to assist.",
      },
    ],
    showWhatsAppLink: true,
  },
  delivery: {
    showOnPdp: true,
    estimateText: "Estimated delivery: 2–5 business days across India",
  },
};

function mergeSection<T extends object>(defaults: T, partial?: Partial<T>): T {
  return { ...defaults, ...partial };
}

export function mergeStorefrontSettings(
  partial: Partial<StorefrontSettings> | null | undefined
): StorefrontSettings {
  if (!partial) return DEFAULT_STOREFRONT_SETTINGS;

  const hp = partial.homepage;

  return {
    brand: mergeSection(DEFAULT_BRAND, partial.brand),
    labels: mergeSection(DEFAULT_LABELS, partial.labels),
    seo: {
      ...DEFAULT_SEO,
      ...partial.seo,
      faqItems:
        partial.seo?.faqItems?.length
          ? partial.seo.faqItems
          : DEFAULT_SEO.faqItems,
      pageOverrides:
        partial.seo?.pageOverrides?.length
          ? partial.seo.pageOverrides
          : DEFAULT_SEO.pageOverrides,
    },
    homepage: {
      videos: mergeSection(DEFAULT_HOMEPAGE_COPY.videos, hp?.videos),
      featuredCategories: mergeSection(
        DEFAULT_HOMEPAGE_COPY.featuredCategories,
        hp?.featuredCategories
      ),
      trending: mergeSection(DEFAULT_HOMEPAGE_COPY.trending, hp?.trending),
      collections: mergeSection(DEFAULT_HOMEPAGE_COPY.collections, hp?.collections),
      shopByCategory: mergeSection(
        DEFAULT_HOMEPAGE_COPY.shopByCategory,
        hp?.shopByCategory
      ),
      bestSellers: mergeSection(DEFAULT_HOMEPAGE_COPY.bestSellers, hp?.bestSellers),
      testimonials: mergeSection(
        DEFAULT_HOMEPAGE_COPY.testimonials,
        hp?.testimonials
      ),
      instagram: mergeSection(DEFAULT_HOMEPAGE_COPY.instagram, hp?.instagram),
      newsletter: mergeSection(DEFAULT_HOMEPAGE_COPY.newsletter, hp?.newsletter),
    },
    support: { ...DEFAULT_STOREFRONT_SETTINGS.support, ...partial.support },
    share: { ...DEFAULT_STOREFRONT_SETTINGS.share, ...partial.share },
    assistant: {
      ...DEFAULT_STOREFRONT_SETTINGS.assistant,
      ...partial.assistant,
      quickReplies:
        partial.assistant?.quickReplies?.length
          ? partial.assistant.quickReplies
          : DEFAULT_STOREFRONT_SETTINGS.assistant.quickReplies,
      faqRules:
        partial.assistant?.faqRules?.length
          ? partial.assistant.faqRules
          : DEFAULT_STOREFRONT_SETTINGS.assistant.faqRules,
    },
    delivery: { ...DEFAULT_STOREFRONT_SETTINGS.delivery, ...partial.delivery },
  };
}
