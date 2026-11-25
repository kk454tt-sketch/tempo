/**
 * Pure tracking helpers (no I/O). Edge-safe: used by middleware.ts and server code.
 * Event recording lives in lib/events.ts.
 */
import type { DeviceType } from "@/lib/types";
import { isShortLinkHost } from "@/lib/url-allowlist";

export const ATTRIBUTION_COOKIE = "affhub_attr";
export const ATTRIBUTION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
export const SESSION_COOKIE = "affhub_sid";
export const SESSION_MAX_AGE = 60 * 30; // 30 minutes

const MAX_FIELD = 120;
const MAX_UTM_SUBFIELD = 100;

export interface Attribution {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  content: string | null;
  term: string | null;
  /** Referrer host (e.g. "in.pinterest.com"), never the full URL. */
  referrer: string | null;
  /** Epoch ms of the landing that produced this attribution. */
  ts: number;
}

function clean(value: string | null | undefined, max = MAX_FIELD): string | null {
  const v = value?.trim().toLowerCase().slice(0, max);
  return v ? v : null;
}

export function referrerHost(referrer: string | null | undefined, ownHost?: string | null): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, "");
    if (!host) return null;
    const own = ownHost?.toLowerCase().replace(/^www\./, "").split(":")[0];
    if (own && host === own) return null;
    return host.slice(0, MAX_FIELD);
  } catch {
    return null;
  }
}

/**
 * Decide whether this request starts a new attribution.
 * - A landing with utm_* params always replaces the stored attribution.
 * - An external referrer without utm_* is stored only when nothing is stored yet.
 * Returns null when the existing cookie should be kept as is.
 */
export function parseAttribution(
  url: URL,
  referrer: string | null,
  existing: Attribution | null,
  now: number = Date.now(),
): Attribution | null {
  const source = clean(url.searchParams.get("utm_source"));
  const medium = clean(url.searchParams.get("utm_medium"));
  const campaign = clean(url.searchParams.get("utm_campaign"));
  const content = clean(url.searchParams.get("utm_content"), MAX_UTM_SUBFIELD);
  const term = clean(url.searchParams.get("utm_term"), MAX_UTM_SUBFIELD);
  const refHost = referrerHost(referrer, url.hostname);

  if (source || medium || campaign || content || term) {
    return { source, medium, campaign, content, term, referrer: refHost, ts: now };
  }
  if (!existing && refHost) {
    return { source: null, medium: null, campaign: null, content: null, term: null, referrer: refHost, ts: now };
  }
  return null;
}

export function serializeAttribution(attr: Attribution): string {
  return JSON.stringify(attr);
}

export function readAttribution(raw: string | null | undefined): Attribution | null {
  if (!raw || raw.length > 1024) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const p = parsed as Record<string, unknown>;
    const str = (v: unknown, max = MAX_FIELD) =>
      typeof v === "string" && v.trim() ? v.trim().toLowerCase().slice(0, max) : null;
    return {
      source: str(p.source),
      medium: str(p.medium),
      campaign: str(p.campaign),
      content: str(p.content, MAX_UTM_SUBFIELD),
      term: str(p.term, MAX_UTM_SUBFIELD),
      referrer: str(p.referrer),
      ts: typeof p.ts === "number" ? p.ts : 0,
    };
  } catch {
    return null;
  }
}

export function isPinterest(attr: Attribution | null): boolean {
  if (!attr) return false;
  if (attr.source?.includes("pinterest")) return true;
  const host = attr.referrer;
  return !!host && (/(^|\.)pinterest\.[a-z.]+$/.test(host) || host === "pin.it");
}

/** Value stored in events.source. */
export function resolveSource(attr: Attribution | null): string {
  if (!attr) return "direct";
  if (isPinterest(attr)) return "pinterest";
  return attr.source ?? attr.referrer ?? "direct";
}

export function detectDevice(userAgent: string | null | undefined): DeviceType {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent ?? "") ? "mobile" : "desktop";
}

/**
 * Crawlers (including Pinterest's own "Pinterestbot") must not count as visits.
 * The Pinterest in-app browser ("[Pinterest/iOS]") is a real person and is not matched.
 */
export function isBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return true;
  return /(bot|crawler|spider|slurp|facebookexternalhit|embedly|headless|lighthouse|preview)/i.test(userAgent);
}

export function isPrefetch(headers: { get(name: string): string | null }): boolean {
  return (
    headers.get("next-router-prefetch") !== null ||
    headers.get("x-middleware-prefetch") !== null ||
    /prefetch/i.test(headers.get("purpose") ?? "") ||
    /prefetch/i.test(headers.get("sec-purpose") ?? "")
  );
}

/**
 * Append the affiliate tag unless the URL already has one or is an Amazon short-link host.
 * Invalid URLs are returned unchanged.
 */
export function appendAffiliateTag(rawUrl: string, tag: string | null | undefined): string {
  if (!tag || isShortLinkHost(rawUrl)) return rawUrl;
  try {
    const url = new URL(rawUrl);
    if (url.searchParams.has("tag")) return rawUrl;
    url.searchParams.set("tag", tag);
    return url.toString();
  } catch {
    return rawUrl;
  }
}
