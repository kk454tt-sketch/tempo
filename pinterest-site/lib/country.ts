import { cookies, headers } from "next/headers";
import {
  COUNTRY_COOKIE,
  DEFAULT_COUNTRY,
  DETECTED_COOKIE,
  isSupportedCountry,
  normalizeCountry,
  type SupportedCountry,
} from "@/lib/countries";

export const EFFECTIVE_COUNTRY_HEADER = "x-affhub-effective";

/**
 * Country used for prices, links and stock (server components, route handlers).
 * Order: cookie affhub_country > forwarded request header x-affhub-effective >
 * cookie affhub_detected > "US".
 */
export async function getVisitorCountry(): Promise<SupportedCountry> {
  const [jar, headerList] = await Promise.all([cookies(), headers()]);

  const manual = jar.get(COUNTRY_COOKIE)?.value;
  if (isSupportedCountry(manual)) return manual;

  const forwarded = headerList.get(EFFECTIVE_COUNTRY_HEADER);
  if (isSupportedCountry(forwarded)) return forwarded;

  const detected = jar.get(DETECTED_COOKIE)?.value;
  if (detected) return normalizeCountry(detected);

  return DEFAULT_COUNTRY;
}

/** Raw detected ISO code (e.g. "GB"), or null when the platform sent none. Used for analytics. */
export async function getDetectedCountryCode(): Promise<string | null> {
  const jar = await cookies();
  const value = jar.get(DETECTED_COOKIE)?.value?.toUpperCase();
  return value && /^[A-Z]{2}$/.test(value) ? value : null;
}
