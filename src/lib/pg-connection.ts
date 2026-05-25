/** Legacy pg SSL modes that currently map to verify-full (see pg-connection-string v3 warning). */
const LEGACY_PG_SSL_MODES = new Set(["prefer", "require", "verify-ca"]);

/**
 * Normalizes DATABASE_URL for node-postgres so sslmode is explicit.
 * Replaces prefer/require/verify-ca with verify-full to match current driver behavior
 * and silence the pg v9 deprecation warning.
 */
export function normalizePgSslMode(connectionString: string): string {
  try {
    const parsed = new URL(connectionString);
    const mode = parsed.searchParams.get("sslmode");
    if (mode && LEGACY_PG_SSL_MODES.has(mode)) {
      parsed.searchParams.set("sslmode", "verify-full");
      return parsed.toString();
    }
    return connectionString;
  } catch {
    return connectionString.replace(
      /([?&])sslmode=(?:prefer|require|verify-ca)(?=&|#|$)/i,
      "$1sslmode=verify-full"
    );
  }
}

export function getPgConnectionString(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  return normalizePgSslMode(url);
}
