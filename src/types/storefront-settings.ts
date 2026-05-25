export type ShareChannel =
  | "copy"
  | "whatsapp"
  | "email"
  | "facebook"
  | "twitter"
  | "native";

export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "twitter"
  | "youtube"
  | "linkedin"
  | "tiktok"
  | "pinterest"
  | "threads";

export type SocialLink = {
  platform: SocialPlatform;
  url: string;
  enabled: boolean;
};

export type TrustBenefitIconKey =
  | "truck"
  | "banknote"
  | "rotate-ccw"
  | "shield-check"
  | "headphones"
  | "package"
  | "gift"
  | "clock";

export type TrustBenefitConfig = {
  id: string;
  title: string;
  subtitle: string;
  icon: TrustBenefitIconKey;
  enabled: boolean;
};

export const TRUST_BENEFIT_ICON_KEYS: TrustBenefitIconKey[] = [
  "truck",
  "banknote",
  "rotate-ccw",
  "shield-check",
  "headphones",
  "package",
  "gift",
  "clock",
];

export const DEFAULT_TRUST_BENEFIT_ITEMS: TrustBenefitConfig[] = [
  {
    id: "fast-delivery",
    title: "Fast Delivery",
    subtitle: "No Extra Cost",
    icon: "truck",
    enabled: true,
  },
  {
    id: "cod",
    title: "Cash On Delivery",
    subtitle: "Quick & Trusted Payment",
    icon: "banknote",
    enabled: true,
  },
  {
    id: "easy-return",
    title: "Easy Return",
    subtitle: "Return with Ease",
    icon: "rotate-ccw",
    enabled: true,
  },
  {
    id: "secure-payment",
    title: "Secure Payment",
    subtitle: "Safe & Protected",
    icon: "shield-check",
    enabled: true,
  },
  {
    id: "quick-support",
    title: "Quick Support",
    subtitle: "Whatsapp & Email",
    icon: "headphones",
    enabled: true,
  },
];

export function isTrustBenefitIconKey(
  value: string
): value is TrustBenefitIconKey {
  return (TRUST_BENEFIT_ICON_KEYS as string[]).includes(value);
}

export function mergeTrustBenefitItems(
  partial?: TrustBenefitConfig[] | null
): TrustBenefitConfig[] {
  if (!partial?.length) return DEFAULT_TRUST_BENEFIT_ITEMS;

  const defaultsById = new Map(
    DEFAULT_TRUST_BENEFIT_ITEMS.map((item) => [item.id, item])
  );

  return partial.map((item) => {
    const fallback = defaultsById.get(item.id);
    const icon = isTrustBenefitIconKey(item.icon)
      ? item.icon
      : (fallback?.icon ?? "truck");
    return {
      id: item.id || fallback?.id || `benefit-${Date.now()}`,
      title: item.title?.trim() || fallback?.title || "Benefit",
      subtitle: item.subtitle?.trim() ?? fallback?.subtitle ?? "",
      icon,
      enabled: item.enabled ?? fallback?.enabled ?? true,
    };
  });
}

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
  corporate: HomepageSectionCopy & { ctaText: string };
  gifting: HomepageSectionCopy & { ctaText: string };
  shopByCategory: HomepageSectionCopy;
  bestSellers: HomepageSectionCopy;
  testimonials: HomepageSectionCopy;
  blog: HomepageSectionCopy;
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

/** Promotional lines on product pages (e.g. free gift above order value). */
export type ProductPromoOffer = {
  id: string;
  /** Shown to shoppers, e.g. "Free Duffle Bag on all orders above ₹3999". */
  text: string;
  /** Minimum cart subtotal (INR) — optional; shown when set and no custom text covers it. */
  minOrderAmount?: number;
  /** Optional coupon code shoppers can apply at checkout. */
  couponCode?: string;
  active: boolean;
  sortOrder: number;
};

export type ProductOffersSettings = {
  enabled: boolean;
  /** Section heading on the product page. */
  title: string;
  showOnPdp: boolean;
  items: ProductPromoOffer[];
};

export type AssistantQuickReplyAction = "whatsapp" | "contact" | "track-order";

export type AssistantQuickReply = {
  label: string;
  query: string;
  action?: AssistantQuickReplyAction;
};

const QUICK_REPLY_ACTIONS: AssistantQuickReplyAction[] = [
  "whatsapp",
  "contact",
  "track-order",
];

export function parseAssistantQuickReplyLine(
  line: string
): AssistantQuickReply | null {
  const parts = line.split("|").map((p) => p.trim());
  const label = parts[0];
  if (!label) return null;
  const query = parts[1] || label;
  const actionRaw = parts[2]?.toLowerCase();
  const action = QUICK_REPLY_ACTIONS.find((a) => a === actionRaw);
  return action ? { label, query, action } : { label, query };
}

export function formatAssistantQuickReplyLine(q: AssistantQuickReply): string {
  return q.action ? `${q.label}|${q.query}|${q.action}` : `${q.label}|${q.query}`;
}

export type PolicyPageSlug = "privacy" | "shipping" | "returns" | "terms";

export type PolicyPageContent = {
  title: string;
  description: string;
  /** Paragraphs separated by a blank line. */
  body: string;
};

export type PolicyPagesSettings = Record<PolicyPageSlug, PolicyPageContent>;

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
  policyPages: PolicyPagesSettings;
  seo: SeoSettings;
  support: {
    email: string;
    phone?: string;
    whatsappNumber?: string;
    whatsappDefaultMessage?: string;
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
    quickReplies: AssistantQuickReply[];
    faqRules: { keywords: string[]; answer: string }[];
    showWhatsAppLink: boolean;
    /** Label on the floating chat launcher (e.g. "Chat with us"). */
    floatingChatLabel: string;
    /** Green WhatsApp button stacked above the chat launcher. */
    showFloatingWhatsApp: boolean;
  };
  delivery: {
    showOnPdp: boolean;
    estimateText: string;
    countdown: {
      enabled: boolean;
      /** Local time hour (0–23) for same-day dispatch cutoff */
      cutoffHour: number;
      cutoffMinute: number;
      minDays: number;
      maxDays: number;
    };
    trustBadges: {
      enabled: boolean;
      showOnHomepage: boolean;
      showOnPdp: boolean;
      showOnCheckout: boolean;
      items: TrustBenefitConfig[];
    };
  };
  productOffers: ProductOffersSettings;
  social: {
    links: SocialLink[];
  };
};

export const STOREFRONT_SETTINGS_KEY = "storefront";

export const SOCIAL_PLATFORM_ORDER: SocialPlatform[] = [
  "instagram",
  "facebook",
  "twitter",
  "youtube",
  "linkedin",
  "tiktok",
  "pinterest",
  "threads",
];

export function mergeSocialLinks(
  partial?: SocialLink[] | null
): SocialLink[] {
  const byPlatform = new Map(
    (partial ?? []).map((link) => [link.platform, link])
  );
  return SOCIAL_PLATFORM_ORDER.map((platform) => {
    const existing = byPlatform.get(platform);
    return {
      platform,
      url: existing?.url?.trim() ?? "",
      enabled: existing?.enabled ?? false,
    };
  });
}

export const DEFAULT_SOCIAL_LINKS: SocialLink[] = mergeSocialLinks([
  {
    platform: "instagram",
    url: "https://instagram.com",
    enabled: true,
  },
]);

export const DEFAULT_HOMEPAGE_COPY: HomepageCopy = {
  videos: {
    eyebrow: "In motion",
    title: "See BagnShop in action",
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
  corporate: {
    eyebrow: "Corporate gifting",
    title: "Custom packages for teams & clients",
    description:
      "Build branded gift bundles from our catalog. Sample kits ready to quote — contact us for bulk orders and packaging.",
    linkText: "Explore corporate gifting",
    linkHref: "/corporate",
    ctaText: "Request a quote",
  },
  gifting: {
    eyebrow: "Perfect gifting",
    title: "Ready-made gift sets",
    description:
      "Curated bundles for birthdays, housewarmings, and everyday surprises — add the full set to cart in one tap.",
    linkText: "Shop all gift sets",
    linkHref: "/gifting",
    ctaText: "Add set to cart",
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
  blog: {
    eyebrow: "From the blog",
    title: "Stories & guides",
    description: "Design, carry, and workspace ideas from our team.",
    linkText: "View all articles",
    linkHref: "/blog",
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
  name: "BagnShop",
  tagline: "Design-led lifestyle accessories",
  announcement: "Free shipping on orders above ₹999 · Shop the latest drops",
  announcementLinkText: "Shop now",
  announcementHref: "/collections/new-arrivals",
};

export const DEFAULT_POLICY_PAGES: PolicyPagesSettings = {
  privacy: {
    title: "Privacy Policy",
    description:
      "How BagnShop collects, uses, and protects your personal information.",
    body: `BagnShop respects your privacy. We collect information you provide at checkout and when you create an account (name, email, shipping address, order history).

We use this data to fulfill orders, send transactional emails, and improve our store. We do not sell your personal information to third parties.

Payment processing is handled by secure partners (e.g. Razorpay). Cookies may be used for cart persistence and analytics.

Questions? Email us at support@bagnshop.com or use the Contact page on our website.`,
  },
  shipping: {
    title: "Shipping Policy",
    description:
      "Shipping times, free delivery threshold, and tracking for BagnShop orders.",
    body: `We ship across India. Orders are processed within 1–2 business days. Standard delivery takes 2–5 business days depending on your pin code.

Free shipping applies on orders above ₹999. You will receive tracking details by email once your order ships.

For order status, use Track order on our website or check your account orders after signing in.`,
  },
  returns: {
    title: "Return & Refund Policy",
    description:
      "15-day returns policy and how to return BagnShop products.",
    body: `We offer a 15-day easy return policy on unused items in original packaging with tags attached.

To start a return, email support@bagnshop.com with your order number. Refunds are processed within 5–7 business days after we receive the item.

Sale items and personalized products may not be eligible unless defective.`,
  },
  terms: {
    title: "Terms & Conditions",
    description: "Terms and conditions for shopping at BagnShop.",
    body: `By using BagnShop you agree to these terms. Product images and descriptions are for illustration; minor variations may occur.

Prices are listed in INR and may change without notice. Orders are confirmed when payment is received or COD is accepted at dispatch.

We reserve the right to cancel orders affected by stock or pricing errors. Liability is limited to the amount paid for the affected order.`,
  },
};

export const DEFAULT_PRODUCT_OFFERS: ProductOffersSettings = {
  enabled: true,
  title: "EXCITING OFFERS",
  showOnPdp: true,
  items: [
    {
      id: "free-duffle-3999",
      text: "Free Duffle Bag on all orders above ₹3999",
      minOrderAmount: 3999,
      active: true,
      sortOrder: 0,
    },
  ],
};

export const DEFAULT_SEO: SeoSettings = {
  homeTitle: "BagnShop — Design-led lifestyle accessories",
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
    "Returns, shipping, and payment FAQs for BagnShop orders in India.",
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
      description: "Learn about BagnShop — design-led lifestyle accessories from India.",
    },
    {
      path: "/shipping",
      title: "Shipping Policy",
      description: "Shipping times, free delivery threshold, and tracking for BagnShop orders.",
    },
    {
      path: "/returns",
      title: "Return & Refund Policy",
      description: "15-day returns policy and how to return BagnShop products.",
    },
    {
      path: "/privacy",
      title: "Privacy Policy",
      description:
        "How BagnShop collects, uses, and protects your personal information.",
    },
    {
      path: "/terms",
      title: "Terms & Conditions",
      description: "Terms and conditions for shopping at BagnShop.",
    },
    {
      path: "/blog",
      title: "Blog",
      description:
        "Design, carry, and workspace stories from BagnShop.",
    },
    {
      path: "/careers",
      title: "Careers",
      description: "Join the BagnShop team — open roles and how to apply.",
    },
    {
      path: "/contact",
      title: "Contact",
      description: "Get in touch with BagnShop customer support.",
    },
    {
      path: "/corporate",
      title: "Corporate gifting",
      description:
        "Custom corporate gift bundles, sample packages, and bulk order inquiries for teams and clients.",
    },
    {
      path: "/gifting",
      title: "Perfect gifting",
      description:
        "Ready-made gift bundles for birthdays, housewarmings, and special occasions — shop curated sets from BagnShop.",
    },
    {
      path: "/track-order",
      title: "Track order",
      description:
        "Track your BagnShop order status with your order number.",
    },
    {
      path: "/wishlist",
      title: "Wishlist",
      description: "Your saved BagnShop products.",
      noIndex: true,
    },
  ],
};

export const DEFAULT_STOREFRONT_SETTINGS: StorefrontSettings = {
  brand: DEFAULT_BRAND,
  homepage: DEFAULT_HOMEPAGE_COPY,
  labels: DEFAULT_LABELS,
  policyPages: DEFAULT_POLICY_PAGES,
  seo: DEFAULT_SEO,
  support: {
    email: "support@bagnshop.com",
    phone: "+919108254515",
    whatsappNumber: "919108254515",
    whatsappDefaultMessage: "Hi, I'd like help from BagnShop.",
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
      "Hi! How can we help today? Ask about orders, shipping, or product details—or pick an option below.",
    quickReplies: [
      {
        label: "Track order",
        query: "How do I track my order?",
        action: "track-order",
      },
      { label: "Shipping cost", query: "What does shipping cost?" },
      { label: "Product question", query: "I have a question about a product" },
      {
        label: "Product info",
        query: "Where can I find materials, size, and product specs?",
      },
      {
        label: "Size & fit",
        query: "What sizes and dimensions are available for this product?",
      },
      { label: "Returns", query: "What is your return policy?" },
      {
        label: "Chat with us",
        query: "I'd like to speak with the team",
        action: "whatsapp",
      },
      { label: "Other", query: "I need help with something else" },
    ],
    faqRules: [
      {
        keywords: ["ship", "delivery", "deliver"],
        answer:
          "We offer free shipping on orders above ₹999. Delivery usually takes 2–5 business days.",
      },
      {
        keywords: [
          "shipping cost",
          "shipping fee",
          "delivery charge",
          "delivery cost",
          "how much ship",
        ],
        answer:
          "Shipping is free on orders above ₹999. Below that, a flat fee applies at checkout—you'll see the exact amount before you pay.",
      },
      {
        keywords: ["return", "refund", "exchange"],
        answer:
          "You can return unused items within 15 days in original packaging.",
      },
      {
        keywords: ["track", "order status", "where is my order"],
        answer:
          "Use the Track Order page with your order number (starts with BS). You can open it from the footer or the Track order quick reply.",
      },
      {
        keywords: ["pay", "cod", "upi", "razorpay", "card"],
        answer:
          "We accept COD, UPI, and Razorpay (cards & wallets).",
      },
      {
        keywords: [
          "product question",
          "about this product",
          "about a product",
          "which product",
        ],
        answer:
          "Open the product page and use \"Ask about this product\" in Need help, or tell us the product name/link and we'll assist.",
      },
      {
        keywords: [
          "product info",
          "material",
          "leather",
          "fabric",
          "made of",
          "care",
          "dimensions",
          "spec",
          "specification",
          "feature",
          "waterproof",
          "warranty",
        ],
        answer:
          "Materials, dimensions, and features are listed under Details on each product page. Share the product name or link if you want a personal recommendation.",
      },
      {
        keywords: ["size", "fit", "capacity", "liter", "inch", "cm", "measure"],
        answer:
          "Sizes and dimensions are on each product page under Details. Tell us which product you're looking at if you need help choosing a size.",
      },
      {
        keywords: ["other", "something else", "not listed"],
        answer:
          "Tell us a bit more about what you need—we'll point you in the right direction. You can also use Chat with us for WhatsApp or Contact us for email.",
      },
      {
        keywords: [
          "contact",
          "human",
          "agent",
          "support",
          "help me",
          "chat with",
          "speak with",
        ],
        answer:
          "Email support@bagnshop.com, use Chat with us for WhatsApp, or the Contact page—we'll reply as soon as we can.",
      },
    ],
    showWhatsAppLink: true,
    floatingChatLabel: "Chat with us",
    showFloatingWhatsApp: true,
  },
  delivery: {
    showOnPdp: true,
    estimateText: "Estimated delivery in 5 to 7 days",
    countdown: {
      enabled: true,
      cutoffHour: 17,
      cutoffMinute: 0,
      minDays: 5,
      maxDays: 7,
    },
    trustBadges: {
      enabled: true,
      showOnHomepage: true,
      showOnPdp: true,
      showOnCheckout: true,
      items: DEFAULT_TRUST_BENEFIT_ITEMS,
    },
  },
  productOffers: DEFAULT_PRODUCT_OFFERS,
  social: {
    links: DEFAULT_SOCIAL_LINKS,
  },
};

function mergeSection<T extends object>(defaults: T, partial?: Partial<T>): T {
  return { ...defaults, ...partial };
}

const LEGACY_DELIVERY_ESTIMATE_TEXTS = [
  "Estimated delivery: 2–5 business days across India",
  "Estimated delivery: 2-5 business days across India",
];

export function formatDeliveryEstimateText(
  minDays: number,
  maxDays: number
): string {
  return `Estimated delivery in ${minDays} to ${maxDays} days`;
}

function normalizeDeliveryEstimateText(
  text: string | undefined,
  countdown: StorefrontSettings["delivery"]["countdown"]
): string {
  const trimmed = text?.trim();
  if (trimmed && !LEGACY_DELIVERY_ESTIMATE_TEXTS.includes(trimmed)) {
    return trimmed;
  }
  return formatDeliveryEstimateText(countdown.minDays, countdown.maxDays);
}

function normalizeDeliveryCountdown(
  partial?: Partial<StorefrontSettings["delivery"]["countdown"]>
): StorefrontSettings["delivery"]["countdown"] {
  const merged = {
    ...DEFAULT_STOREFRONT_SETTINGS.delivery.countdown,
    ...partial,
  };
  if (merged.minDays === 4 && merged.maxDays === 6) {
    return { ...merged, minDays: 5, maxDays: 7 };
  }
  return merged;
}

export function mergeStorefrontSettings(
  partial: Partial<StorefrontSettings> | null | undefined
): StorefrontSettings {
  if (!partial) return DEFAULT_STOREFRONT_SETTINGS;

  const hp = partial.homepage;

  return {
    brand: (() => {
      const merged = mergeSection(DEFAULT_BRAND, partial.brand);
      return {
        ...merged,
        name:
          merged.name === "Bag & Shop" || !merged.name?.trim()
            ? DEFAULT_BRAND.name
            : merged.name,
      };
    })(),
    labels: mergeSection(DEFAULT_LABELS, partial.labels),
    policyPages: {
      privacy: mergeSection(
        DEFAULT_POLICY_PAGES.privacy,
        partial.policyPages?.privacy
      ),
      shipping: mergeSection(
        DEFAULT_POLICY_PAGES.shipping,
        partial.policyPages?.shipping
      ),
      returns: mergeSection(
        DEFAULT_POLICY_PAGES.returns,
        partial.policyPages?.returns
      ),
      terms: mergeSection(
        DEFAULT_POLICY_PAGES.terms,
        partial.policyPages?.terms
      ),
    },
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
      corporate: mergeSection(DEFAULT_HOMEPAGE_COPY.corporate, hp?.corporate),
      gifting: mergeSection(DEFAULT_HOMEPAGE_COPY.gifting, hp?.gifting),
      shopByCategory: mergeSection(
        DEFAULT_HOMEPAGE_COPY.shopByCategory,
        hp?.shopByCategory
      ),
      bestSellers: mergeSection(DEFAULT_HOMEPAGE_COPY.bestSellers, hp?.bestSellers),
      testimonials: mergeSection(
        DEFAULT_HOMEPAGE_COPY.testimonials,
        hp?.testimonials
      ),
      blog: mergeSection(DEFAULT_HOMEPAGE_COPY.blog, hp?.blog),
      instagram: mergeSection(DEFAULT_HOMEPAGE_COPY.instagram, hp?.instagram),
      newsletter: mergeSection(DEFAULT_HOMEPAGE_COPY.newsletter, hp?.newsletter),
    },
    support: {
      ...DEFAULT_STOREFRONT_SETTINGS.support,
      ...partial.support,
      email:
        !partial.support?.email ||
        partial.support.email === "hello@bagandshop.com"
          ? DEFAULT_STOREFRONT_SETTINGS.support.email
          : partial.support.email,
      phone: partial.support?.phone?.trim()
        ? partial.support.phone.trim()
        : DEFAULT_STOREFRONT_SETTINGS.support.phone,
      whatsappNumber: partial.support?.whatsappNumber?.trim()
        ? partial.support.whatsappNumber.trim()
        : DEFAULT_STOREFRONT_SETTINGS.support.whatsappNumber,
    },
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
    delivery: (() => {
      const countdown = normalizeDeliveryCountdown(partial.delivery?.countdown);
      return {
        ...DEFAULT_STOREFRONT_SETTINGS.delivery,
        ...partial.delivery,
        countdown,
        estimateText: normalizeDeliveryEstimateText(
          partial.delivery?.estimateText,
          countdown
        ),
        trustBadges: {
          ...DEFAULT_STOREFRONT_SETTINGS.delivery.trustBadges,
          ...partial.delivery?.trustBadges,
          items: mergeTrustBenefitItems(partial.delivery?.trustBadges?.items),
        },
      };
    })(),
    productOffers: {
      ...DEFAULT_PRODUCT_OFFERS,
      ...partial.productOffers,
      items:
        partial.productOffers?.items?.length
          ? partial.productOffers.items
          : DEFAULT_PRODUCT_OFFERS.items,
    },
    social: {
      links: mergeSocialLinks(partial.social?.links),
    },
  };
}

export function getActiveProductOffers(
  settings: StorefrontSettings | null | undefined
): ProductPromoOffer[] {
  const offers = settings?.productOffers;
  if (!offers?.enabled || !offers.showOnPdp) return [];
  return [...offers.items]
    .filter((o) => o.active && o.text.trim())
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
