/**
 * Development helper: `?country=XX` on any public URL simulates a detected
 * country. Returns null in production builds, so it cannot be used there.
 * Call it from middleware.ts (see README) and set affhub_detected with the result.
 */
export function devCountry(url: URL): string | null {
  if (process.env.NODE_ENV === "production") return null;
  const raw = url.searchParams.get("country");
  return raw !== null && /^[A-Za-z]{2}$/.test(raw) ? raw.toUpperCase() : null;
}
