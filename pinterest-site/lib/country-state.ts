import { cookies, headers } from "next/headers";
import type { CountryCode } from "@/lib/countries";
import { getVisitorCountry } from "@/lib/country";
import { BANNER_DISMISSED_COOKIE, COUNTRY_COOKIE, DETECTED_COOKIE } from "@/lib/country-cookies";
import { normalizeCountryCode } from "@/lib/storefront";

export type CountryState = {
  /** Effective store country (same source of truth the pages use). */
  country: CountryCode;
  /** Auto-detected country, normalised (unknown means US); null if nothing was detected. */
  detected: CountryCode | null;
  /** The visitor picked a country by hand (affhub_country exists). */
  hasChosen: boolean;
  bannerDismissed: boolean;
};

export async function getCountryState(): Promise<CountryState> {
  const [country, jar, h] = await Promise.all([getVisitorCountry(), cookies(), headers()]);

  // Middleware sets affhub_detected on its response, so the very first request
  // does not carry it yet: fall back to the same IP headers it reads.
  const rawDetected =
    jar.get(DETECTED_COOKIE)?.value ?? h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry");

  return {
    country,
    detected: rawDetected ? normalizeCountryCode(rawDetected) : null,
    hasChosen: jar.has(COUNTRY_COOKIE),
    bannerDismissed: jar.has(BANNER_DISMISSED_COOKIE),
  };
}
