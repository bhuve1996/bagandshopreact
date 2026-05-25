import { isDatabaseReady } from "@/lib/db-ready";
import { getPrisma } from "@/lib/prisma";
import {
  DEFAULT_STOREFRONT_SETTINGS,
  STOREFRONT_SETTINGS_KEY,
  mergeStorefrontSettings,
  type StorefrontSettings,
} from "@/types/storefront-settings";

function parseSettings(value: unknown): StorefrontSettings {
  if (!value || typeof value !== "object") {
    return DEFAULT_STOREFRONT_SETTINGS;
  }
  return mergeStorefrontSettings(value as Partial<StorefrontSettings>);
}

export async function getStorefrontSettings(): Promise<StorefrontSettings> {
  if (!(await isDatabaseReady())) {
    return DEFAULT_STOREFRONT_SETTINGS;
  }
  const row = await getPrisma().siteSetting.findUnique({
    where: { key: STOREFRONT_SETTINGS_KEY },
  });
  return parseSettings(row?.value);
}

export async function adminGetStorefrontSettings(): Promise<StorefrontSettings> {
  return getStorefrontSettings();
}

export async function adminUpdateStorefrontSettings(
  data: StorefrontSettings
): Promise<StorefrontSettings> {
  if (!(await isDatabaseReady())) {
    throw new Error("Database required for admin writes");
  }
  const merged = mergeStorefrontSettings(data);
  await getPrisma().siteSetting.upsert({
    where: { key: STOREFRONT_SETTINGS_KEY },
    create: { key: STOREFRONT_SETTINGS_KEY, value: merged as object },
    update: { value: merged as object },
  });
  return merged;
}
