/**
 * Static country configuration (the only static data in the project besides short UI labels).
 * Edge-safe: imported by middleware.ts, so it must not import Node-only modules.
 */

export const COUNTRY_CODES = ["US", "IN", "BR", "MX", "ID"] as const;
export type SupportedCountry = (typeof COUNTRY_CODES)[number];
export type CountryCode = SupportedCountry;

export const CURRENCY_CODES = ["USD", "INR", "BRL", "MXN"] as const;
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export interface CountryConfig {
  code: SupportedCountry;
  flag: string;
  name: string;
  currency: CurrencyCode;
  symbol: string;
  /** Amazon store domain, or null when the country has no Amazon store. */
  store: string | null;
  /** Short note shown next to the buy button, or null. */
  note: string | null;
}

export const COUNTRIES: Record<SupportedCountry, CountryConfig> = {
  US: { code: "US", flag: "🇺🇸", name: "United States", currency: "USD", symbol: "$", store: "amazon.com", note: null },
  IN: { code: "IN", flag: "🇮🇳", name: "India", currency: "INR", symbol: "₹", store: "amazon.in", note: null },
  BR: { code: "BR", flag: "🇧🇷", name: "Brazil", currency: "BRL", symbol: "R$", store: "amazon.com.br", note: null },
  MX: { code: "MX", flag: "🇲🇽", name: "Mexico", currency: "MXN", symbol: "MX$", store: "amazon.com.mx", note: null },
  ID: { code: "ID", flag: "🇮🇩", name: "Indonesia", currency: "USD", symbol: "$", store: null, note: "Opens Amazon US" },
};

export const COUNTRY_LIST: readonly CountryConfig[] = COUNTRY_CODES.map((code) => COUNTRIES[code]);

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: "$",
  INR: "₹",
  BRL: "R$",
  MXN: "MX$",
};

export const DEFAULT_COUNTRY: SupportedCountry = "US";

/** Cookie holding the visitor's manual choice. It always wins over detection. */
export const COUNTRY_COOKIE = "affhub_country";
/** Cookie holding the raw ISO country code detected from the request headers. */
export const DETECTED_COOKIE = "affhub_detected";
export const COUNTRY_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isSupportedCountry(value: unknown): value is SupportedCountry {
  return typeof value === "string" && (COUNTRY_CODES as readonly string[]).includes(value);
}

/** Any country that is not supported (or missing) is treated as US. */
export function normalizeCountry(value: string | null | undefined): SupportedCountry {
  const upper = value?.trim().toUpperCase();
  return isSupportedCountry(upper) ? upper : DEFAULT_COUNTRY;
}

/** Raw ISO 3166-1 alpha-2 code from the platform headers, or null when unknown. */
export function detectCountryCode(headers: Headers): string | null {
  const raw = headers.get("x-vercel-ip-country") ?? headers.get("cf-ipcountry");
  const code = raw?.trim().toUpperCase();
  if (!code || !/^[A-Z]{2}$/.test(code)) return null;
  // Cloudflare uses XX for unknown and T1 for Tor.
  if (code === "XX") return null;
  return code;
}

export interface ResolvableLink {
  country_code: string;
  url: string;
  price: number | null;
  currency: string;
  in_stock: boolean;
}

export interface ResolvedLink<T extends ResolvableLink> {
  link: T;
  /** Country of the product_links row that was used (the store the visitor is sent to). */
  storeCountry: SupportedCountry;
  /** True when the visitor's own country has no Amazon store (Indonesia). */
  usedFallback: boolean;
}

/**
 * Pick the product link for a visitor.
 * - US, IN, BR, MX: the link of that country, or null when the product has none.
 * - ID: the product's ID fallback link, otherwise its US link, otherwise null.
 */
export function resolveProductLink<T extends ResolvableLink>(
  country: SupportedCountry,
  links: readonly T[],
): ResolvedLink<T> | null {
  const find = (code: SupportedCountry) => links.find((l) => l.country_code === code);

  if (country === "ID") {
    const fallback = find("ID");
    if (fallback) return { link: fallback, storeCountry: "ID", usedFallback: true };
    const us = find("US");
    return us ? { link: us, storeCountry: "US", usedFallback: true } : null;
  }

  const own = find(country);
  return own ? { link: own, storeCountry: country, usedFallback: false } : null;
}
