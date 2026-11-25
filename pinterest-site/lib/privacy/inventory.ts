/**
 * Single source of truth for what the privacy page says we store.
 *
 *  - app/(public)/privacy/page.tsx renders these lists.
 *  - `npm run check:privacy` fails if the live `events` table has a column that
 *    is not listed in EVENT_FIELDS (or the reverse), so the page cannot drift.
 *  - e2e/smoke.e2e.ts fails if an anonymous visit sets a cookie that is not
 *    listed in COOKIES.
 */

export type CookieEntry = {
  /** Exact cookie name, or a prefix when `prefix` is true. */
  name: string;
  prefix?: boolean;
  purpose: string;
  setFor: "admins only" | "all visitors";
  duration: string;
  essential: boolean;
};

export const COOKIES: CookieEntry[] = [
  {
    name: "affhub_country",
    purpose: "Stores your manually selected Amazon store country.",
    setFor: "all visitors",
    duration: "365 days",
    essential: true,
  },
  {
    name: "affhub_detected",
    purpose: "Stores the two-letter country code detected from request headers.",
    setFor: "all visitors",
    duration: "24 hours",
    essential: true,
  },
  {
    name: "affhub_banner_dismissed",
    purpose: "Remembers that you dismissed the country notice banner.",
    setFor: "all visitors",
    duration: "30 days",
    essential: true,
  },
  {
    name: "affhub_attr",
    purpose: "First-party referral host and UTM campaign parameters (HTTP-only, no cross-site tracking ID).",
    setFor: "all visitors",
    duration: "30 days",
    essential: false,
  },
  {
    name: "affhub_sid",
    purpose: "Short-lived 30-minute session ID used to avoid counting repeated page refreshes as separate product views.",
    setFor: "all visitors",
    duration: "30 minutes (sliding)",
    essential: true,
  },
  {
    name: "sb-",
    prefix: true,
    purpose:
      "Supabase sign-in session for the admin panel (names look like sb-<project>-auth-token and may be split into numbered chunks).",
    setFor: "admins only",
    duration: "Session / refreshed while signed in",
    essential: true,
  },
];

export type EventField = {
  /** Column name in public.events. */
  column: string;
  meaning: string;
  personal: "none" | "indirect";
};

export const EVENT_FIELDS: EventField[] = [
  { column: "id", meaning: "Sequential row identifier", personal: "none" },
  { column: "type", meaning: "What happened: a product_view or an outbound click to Amazon", personal: "none" },
  { column: "product_id", meaning: "Which product the event relates to", personal: "none" },
  { column: "visitor_country", meaning: "Two-letter country code from platform headers or 'XX' when unknown", personal: "indirect" },
  { column: "store_country", meaning: "Target Amazon store country shown or opened (US, IN, BR, MX, ID)", personal: "none" },
  { column: "source", meaning: "Traffic source or referring domain host (e.g. pinterest or direct)", personal: "none" },
  { column: "campaign", meaning: "Optional UTM campaign name from the landing URL", personal: "none" },
  { column: "content", meaning: "Optional UTM content label (e.g. pin creative variant) from the landing URL", personal: "none" },
  { column: "term", meaning: "Optional UTM term keyword from the landing URL", personal: "none" },
  { column: "device", meaning: "Coarse device class derived from User-Agent (mobile or desktop)", personal: "none" },
  { column: "session_id", meaning: "Short-lived random 30-minute session UUID used to deduplicate repeated product views", personal: "none" },
  { column: "created_at", meaning: "Date and time of the event", personal: "none" },
];

/** Not stored anywhere in our database or logs. */
export const NOT_STORED = [
  "IP addresses",
  "Names, email addresses or accounts of visitors",
  "Advertising or cross-site tracking identifiers",
  "Precise location",
];

export function retentionDays(): number {
  const n = Number.parseInt(process.env.EVENT_RETENTION_DAYS ?? "", 10);
  return Number.isFinite(n) && n >= 1 ? n : 400;
}
