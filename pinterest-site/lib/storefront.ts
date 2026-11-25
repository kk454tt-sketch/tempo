// Pure helpers (no server-only imports) so client components can use them too.
import { COUNTRIES, type CountryCode } from "@/lib/countries";
import type { ProductLink } from "@/lib/products";

// Object.values works whether COUNTRIES is a record keyed by code or an array.
const COUNTRY_LIST = Object.values(COUNTRIES);
export type CountryInfo = (typeof COUNTRY_LIST)[number];

export function listCountries(): readonly CountryInfo[] {
  return COUNTRY_LIST;
}

/** Unknown codes are treated as US, as the foundation rules say. */
export function getCountry(code: string): CountryInfo {
  const wanted = code.toUpperCase();
  return (
    COUNTRY_LIST.find((c) => c.code === wanted) ??
    COUNTRY_LIST.find((c) => c.code === "US") ??
    COUNTRY_LIST[0]
  );
}

export function normalizeCountryCode(raw?: string | null): CountryCode {
  return getCountry(raw ?? "").code;
}

/** Banner text. Indonesia has no Amazon store, so it says what really happens. */
export function countryNotice(code: string): string {
  const info = getCountry(code);
  return info.code === "ID" ? "Showing Amazon US for Indonesia." : `Showing Amazon ${info.name}.`;
}

/** Amazon store home. Indonesia and unknown countries open amazon.com. */
export function storeHomeUrl(code: string): string {
  const store = getCountry(code).store;
  return `https://www.${store || "amazon.com"}`;
}

export function formatPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

export type Offer = {
  storeCountry: CountryCode;
  inStock: boolean;
  /** Formatted price, or null when the link has no price. */
  priceLabel: string | null;
};

/**
 * The link for the visitor's store; if that row is missing, the US row.
 * Returns null when neither exists (no price, and no reason to call it sold out).
 */
export function resolveOffer(
  links: readonly ProductLink[],
  country: string,
): Offer | null {
  const order: string[] = country === "US" ? ["US"] : [country, "US"];
  for (const code of order) {
    const link = links.find((l) => l.country_code === code);
    if (!link) continue;
    const amount = link.price === null ? NaN : Number(link.price);
    return {
      storeCountry: link.country_code,
      inStock: link.in_stock,
      priceLabel: Number.isFinite(amount)
        ? formatPrice(amount, link.currency || "USD")
        : null,
    };
  }
  return null;
}
