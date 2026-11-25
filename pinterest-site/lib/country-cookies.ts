// Cookie names and client-side writer shared by the provider (browser) and
// lib/country-state.ts (server). No server-only imports here.
export const COUNTRY_COOKIE = "affhub_country"; // the visitor's manual choice, 365 days
export const DETECTED_COOKIE = "affhub_detected"; // set by middleware from the IP header
export const BANNER_DISMISSED_COOKIE = "affhub_banner_dismissed"; // 30 days

export function writeCookie(name: string, value: string, days: number): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${days * 86400}; SameSite=Lax${secure}`;
}
