import { CURRENCY_SYMBOLS, type CurrencyCode } from "@/lib/countries";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

const LOCALES: Record<CurrencyCode, string> = {
  USD: "en-US",
  INR: "en-IN",
  BRL: "pt-BR",
  MXN: "es-MX",
};

function isCurrency(value: string): value is CurrencyCode {
  return value in CURRENCY_SYMBOLS;
}

/** Returns null when there is no price, so callers can hide the price instead of showing a placeholder. */
export function formatPrice(price: number | null | undefined, currency: string): string | null {
  if (price === null || price === undefined || Number.isNaN(price)) return null;
  if (!isCurrency(currency)) return `${currency} ${price.toFixed(2)}`;
  const amount = new Intl.NumberFormat(LOCALES[currency], {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
  return `${CURRENCY_SYMBOLS[currency]}${amount}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatPercent(value: number): string {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value)}%`;
}

export function formatDate(iso: string, options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...options }).format(new Date(iso));
}

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Display label for a stored country code (analytics), e.g. "United States". Unknown codes are returned as-is. */
export function countryLabel(code: string | null | undefined, names: Record<string, string>): string {
  if (!code) return "Unknown";
  return names[code] ?? code;
}
