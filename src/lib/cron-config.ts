function envInt(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export const cronConfig = {
  abandonedCart: {
    firstDelayHours: envInt("CRON_ABANDONED_FIRST_HOURS", 1),
    secondDelayHours: envInt("CRON_ABANDONED_SECOND_HOURS", 24),
    thirdDelayHours: envInt("CRON_ABANDONED_THIRD_HOURS", 72),
    maxReminders: 3,
    batchSize: envInt("CRON_BATCH_SIZE", 20),
  },
  reviewRequest: {
    daysAfterDelivery: envInt("CRON_REVIEW_DAYS", 7),
    batchSize: envInt("CRON_BATCH_SIZE", 20),
  },
  paymentPending: {
    minAgeHours: envInt("CRON_PAYMENT_PENDING_HOURS", 2),
    batchSize: envInt("CRON_BATCH_SIZE", 20),
  },
  lowStock: {
    threshold: envInt("CRON_LOW_STOCK_THRESHOLD", 5),
    batchSize: envInt("CRON_BATCH_SIZE", 50),
  },
  backInStock: {
    batchSize: envInt("CRON_BATCH_SIZE", 20),
  },
};

export function getCronAdminEmail() {
  return process.env.CRON_ADMIN_EMAIL ?? process.env.ADMIN_EMAIL ?? null;
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
