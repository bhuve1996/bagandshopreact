/** Canonical analytics event types stored in `AnalyticsEvent.type`. */
export const AnalyticsEventType = {
  PAGE_VIEW: "page_view",
  PRODUCT_VIEW: "product_view",
  ADD_TO_CART: "add_to_cart",
  BEGIN_CHECKOUT: "begin_checkout",
  PURCHASE: "purchase",
  WISHLIST_ADD: "wishlist_add",
  WISHLIST_REMOVE: "wishlist_remove",
  PRODUCT_SHARE: "product_share",
  ASSISTANT_OPEN: "assistant_open",
  ASSISTANT_MESSAGE: "assistant_message",
  ASSISTANT_QUICK_REPLY: "assistant_quick_reply",
  HELP_WHATSAPP: "help_whatsapp",
  HELP_ASK_PRODUCT: "help_ask_product",
  SEARCH: "search",
  CONTACT_CLICK: "contact_click",
} as const;

export type AnalyticsEventTypeName =
  (typeof AnalyticsEventType)[keyof typeof AnalyticsEventType];

export type AnalyticsTrackPayload = {
  type: AnalyticsEventTypeName | string;
  path?: string;
  productId?: string;
  orderId?: string;
  userId?: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
};

/** Labels for admin dashboards */
export const ANALYTICS_EVENT_LABELS: Record<string, string> = {
  [AnalyticsEventType.PAGE_VIEW]: "Page views",
  [AnalyticsEventType.PRODUCT_VIEW]: "Product views",
  [AnalyticsEventType.ADD_TO_CART]: "Add to cart",
  [AnalyticsEventType.BEGIN_CHECKOUT]: "Checkout started",
  [AnalyticsEventType.PURCHASE]: "Purchases",
  [AnalyticsEventType.WISHLIST_ADD]: "Wishlist adds",
  [AnalyticsEventType.WISHLIST_REMOVE]: "Wishlist removes",
  [AnalyticsEventType.PRODUCT_SHARE]: "Product shares",
  [AnalyticsEventType.ASSISTANT_OPEN]: "Assistant opens",
  [AnalyticsEventType.ASSISTANT_MESSAGE]: "Assistant messages",
  [AnalyticsEventType.ASSISTANT_QUICK_REPLY]: "Quick replies",
  [AnalyticsEventType.HELP_WHATSAPP]: "WhatsApp help",
  [AnalyticsEventType.HELP_ASK_PRODUCT]: "Ask about product",
  [AnalyticsEventType.SEARCH]: "Searches",
  [AnalyticsEventType.CONTACT_CLICK]: "Contact clicks",
};

export function analyticsEventLabel(type: string): string {
  return ANALYTICS_EVENT_LABELS[type] ?? type.replace(/_/g, " ");
}
