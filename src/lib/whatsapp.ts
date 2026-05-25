import type { StorefrontSettings } from "@/types/storefront-settings";

export function normalizeWhatsAppNumber(
  number: string | undefined | null
): string | undefined {
  const digits = number?.replace(/\D/g, "");
  return digits && digits.length >= 8 ? digits : undefined;
}

export function getWhatsAppDefaultMessage(
  support: StorefrontSettings["support"]
): string {
  return (
    support.whatsappDefaultMessage?.trim() ||
    "Hi, I'd like help from BagnShop."
  );
}
