export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Demo logins (admin@test.com) only when not production or ALLOW_DEMO_AUTH=true */
export function isDemoAuthAllowed(): boolean {
  if (process.env.ALLOW_DEMO_AUTH === "true") return true;
  return !isProduction();
}

export function requireDatabaseForCheckout(): boolean {
  return isProduction();
}
