/**
 * Structured JSON logger (one JSON object per line: easy to search in Vercel Logs).
 *
 *   logger.info("product.saved", { productId });
 *   logger.error("cron.cleanup.failed", { error });
 *
 * Redaction: values under keys that look like secrets, cookies or IP addresses
 * are replaced with "[redacted]", and IPv4 addresses inside strings are masked.
 * Log ids and counts, never raw request bodies or headers.
 *
 * If SENTRY_DSN is set, logger.error() with an `error` field also reports it to
 * Sentry (scrubbed by lib/sentry-scrub.ts).
 */

type Level = "debug" | "info" | "warn" | "error";
const ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const REDACT_KEY =
  /(pass(word)?|secret|token|cookie|authorization|api[-_]?key|service[-_]?role|set-cookie|^ip$|ip[-_]?address|x-forwarded-for|x-real-ip|forwarded)/i;
const IPV4 = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

function minLevel(): Level {
  const v = (process.env.LOG_LEVEL ?? "").toLowerCase();
  if (v === "debug" || v === "info" || v === "warn" || v === "error") return v;
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

function serializeError(err: Error): Record<string, unknown> {
  return { name: err.name, message: scrubString(err.message), stack: err.stack ? scrubString(err.stack) : undefined };
}

function scrubString(s: string): string {
  return s.replace(IPV4, "[ip]");
}

function sanitize(value: unknown, depth = 0): unknown {
  if (value instanceof Error) return serializeError(value);
  if (typeof value === "string") return scrubString(value);
  if (value === null || typeof value !== "object") return value;
  if (depth >= 4) return "[truncated]";
  if (Array.isArray(value)) return value.slice(0, 50).map((v) => sanitize(v, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = REDACT_KEY.test(k) ? "[redacted]" : sanitize(v, depth + 1);
  }
  return out;
}

function write(level: Level, msg: string, fields: Record<string, unknown> = {}, bindings: Record<string, unknown> = {}) {
  if (ORDER[level] < ORDER[minLevel()]) return;
  const line = JSON.stringify({
    level,
    time: new Date().toISOString(),
    msg: scrubString(msg),
    ...(sanitize({ ...bindings, ...fields }) as Record<string, unknown>),
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);

  if (level === "error" && process.env.SENTRY_DSN && fields.error instanceof Error) {
    const err = fields.error;
    import("@sentry/nextjs").then((Sentry) => Sentry.captureException(err)).catch(() => undefined);
  }
}

export type Logger = {
  debug(msg: string, fields?: Record<string, unknown>): void;
  info(msg: string, fields?: Record<string, unknown>): void;
  warn(msg: string, fields?: Record<string, unknown>): void;
  error(msg: string, fields?: Record<string, unknown>): void;
  child(bindings: Record<string, unknown>): Logger;
};

function make(bindings: Record<string, unknown>): Logger {
  return {
    debug: (m, f) => write("debug", m, f, bindings),
    info: (m, f) => write("info", m, f, bindings),
    warn: (m, f) => write("warn", m, f, bindings),
    error: (m, f) => write("error", m, f, bindings),
    child: (b) => make({ ...bindings, ...b }),
  };
}

export const logger: Logger = make({});
