import type { captureRequestError } from "@sentry/nextjs";

/**
 * Loaded once per server start by Next.js. Sentry is initialised ONLY when
 * SENTRY_DSN is set; without it this file does nothing.
 * (There is deliberately no browser-side Sentry: it would need extra CSP
 * connect-src entries and would see more user data.)
 */
export async function register() {
  if (!process.env.SENTRY_DSN) return;
  if (process.env.NEXT_RUNTIME === "nodejs") await import("./sentry.server.config");
  if (process.env.NEXT_RUNTIME === "edge") await import("./sentry.edge.config");
}

export async function onRequestError(...args: Parameters<typeof captureRequestError>) {
  if (!process.env.SENTRY_DSN) return;
  const Sentry = await import("@sentry/nextjs");
  return Sentry.captureRequestError(...args);
}
