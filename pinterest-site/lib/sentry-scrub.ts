/**
 * Sentry is only initialised when SENTRY_DSN is set (see instrumentation.ts).
 * Everything that could carry personal data is removed before an event leaves
 * the server: request bodies, cookies, query strings, auth headers, IP-ish
 * headers, user info, and breadcrumb data.
 */
import type { ErrorEvent, EventHint } from "@sentry/nextjs";

const DROP_HEADERS = new Set([
  "cookie",
  "set-cookie",
  "authorization",
  "x-forwarded-for",
  "x-real-ip",
  "x-vercel-forwarded-for",
  "x-vercel-ip-country",
  "x-vercel-ip-city",
  "cf-connecting-ip",
  "forwarded",
]);

export function scrubSentryEvent(event: ErrorEvent, _hint?: EventHint): ErrorEvent | null {
  void _hint;
  if (event.request) {
    delete event.request.data;
    delete event.request.cookies;
    delete event.request.query_string;
    if (event.request.url) {
      try {
        const u = new URL(event.request.url);
        event.request.url = `${u.origin}${u.pathname}`;
      } catch {
        /* keep as is */
      }
    }
    if (event.request.headers) {
      for (const name of Object.keys(event.request.headers)) {
        if (DROP_HEADERS.has(name.toLowerCase())) delete event.request.headers[name];
      }
    }
  }
  delete event.user;
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((b) => ({ ...b, data: undefined }));
  }
  return event;
}

export const sentryBaseOptions = {
  dsn: process.env.SENTRY_DSN,
  sendDefaultPii: false,
  tracesSampleRate: 0,
  maxBreadcrumbs: 10,
  beforeSend: scrubSentryEvent,
} as const;
