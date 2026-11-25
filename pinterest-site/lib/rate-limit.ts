/**
 * Rate limiting.
 *
 *   await rateLimit({ key, limit, windowSeconds })
 *
 * Backends
 * - Upstash Redis (sliding window) when UPSTASH_REDIS_REST_URL and
 *   UPSTASH_REDIS_REST_TOKEN are both set. Works across all serverless instances.
 * - In-memory Map otherwise. On serverless (Vercel) every instance has its own
 *   memory and instances are recycled, so this is BEST EFFORT ONLY: it slows
 *   down a single hot instance but is not a global limit. Set Upstash for
 *   anything you depend on (admin login, password change).
 * - If Upstash errors at runtime we fall back to the in-memory limiter instead
 *   of failing open completely.
 *
 * Privacy: callers pass a key built with rateLimitKey(scope, ip). The key is a
 * salted SHA-256 hash of the IP; the raw IP is never stored, logged or sent to
 * Redis. Set RATE_LIMIT_SALT to a long random secret: with a public/static salt
 * the IPv4 space is small enough to brute-force the hashes back to IPs.
 */

export type RateLimitInput = {
  /** Already-hashed key, e.g. rateLimitKey("admin-login", ip). */
  key: string;
  /** Max requests allowed per window. */
  limit: number;
  windowSeconds: number;
};

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  /** Epoch milliseconds when the oldest counted request leaves the window. */
  reset: number;
  retryAfterSeconds: number;
  backend: "upstash" | "memory";
};

/** The four limits the app applies. */
export const RATE_LIMITS = {
  adminLogin: { scope: "admin-login", limit: 5, windowSeconds: 60 },
  go: { scope: "go", limit: 60, windowSeconds: 60 },
  adminUpload: { scope: "admin-upload", limit: 30, windowSeconds: 60 },
  passwordChange: { scope: "password-change", limit: 5, windowSeconds: 3600 },
  // Not in the original list: keeps the CSP report endpoint from being used to spam logs.
  cspReport: { scope: "csp-report", limit: 30, windowSeconds: 60 },
} as const;

export type RateLimitPreset = (typeof RATE_LIMITS)[keyof typeof RATE_LIMITS];

// ---------------------------------------------------------------------------
// Key hashing (Web Crypto: works in Node 18+, Edge runtime and vitest)
// ---------------------------------------------------------------------------

let warnedAboutSalt = false;

function getSalt(): string {
  const salt = process.env.RATE_LIMIT_SALT;
  if (salt && salt.length >= 16) return salt;
  if (!warnedAboutSalt) {
    warnedAboutSalt = true;
    if (process.env.NODE_ENV === "production") {
      console.warn(
        JSON.stringify({
          level: "warn",
          msg: "RATE_LIMIT_SALT is missing or shorter than 16 chars; IP hashes can be reversed by brute force. Set it.",
        }),
      );
    }
  }
  return salt || "affhub-dev-only-salt";
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** scope + salted SHA-256(ip). The raw IP never leaves this function. */
export async function rateLimitKey(scope: string, ip: string): Promise<string> {
  const hash = await sha256Hex(`${getSalt()}:${ip}`);
  return `${scope}:${hash}`;
}

/** Best-effort client IP from proxy headers. Only ever fed into rateLimitKey. */
export function getClientIp(headers: { get(name: string): string | null }): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || headers.get("x-vercel-forwarded-for")?.trim() || "unknown";
}

// ---------------------------------------------------------------------------
// In-memory sliding window log (best effort)
// ---------------------------------------------------------------------------

const MAX_MEMORY_KEYS = 10_000;
const memoryStore = new Map<string, number[]>();

function memoryLimit({ key, limit, windowSeconds }: RateLimitInput): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const fresh = (memoryStore.get(key) ?? []).filter((t) => now - t < windowMs);

  let success = false;
  if (fresh.length < limit) {
    fresh.push(now);
    success = true;
  }

  // Re-insert so Map iteration order approximates least-recently-used.
  memoryStore.delete(key);
  memoryStore.set(key, fresh);

  if (memoryStore.size > MAX_MEMORY_KEYS) {
    // Evict the oldest 10% of keys so the Map cannot grow without bound.
    let toDrop = Math.ceil(MAX_MEMORY_KEYS * 0.1);
    for (const k of memoryStore.keys()) {
      if (toDrop-- <= 0) break;
      memoryStore.delete(k);
    }
  }

  const oldest = fresh[0] ?? now;
  const reset = oldest + windowMs;
  return {
    success,
    limit,
    remaining: Math.max(0, limit - fresh.length),
    reset,
    retryAfterSeconds: success ? 0 : Math.max(1, Math.ceil((reset - now) / 1000)),
    backend: "memory",
  };
}

/** Test helper. */
export function __resetRateLimitMemory(): void {
  memoryStore.clear();
}

// ---------------------------------------------------------------------------
// Upstash (loaded lazily so the packages are only touched when configured)
// ---------------------------------------------------------------------------

type UpstashLimiter = { limit(key: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> };
const upstashLimiters = new Map<string, UpstashLimiter>();

function upstashConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

async function getUpstashLimiter(limit: number, windowSeconds: number): Promise<UpstashLimiter> {
  const cacheKey = `${limit}:${windowSeconds}`;
  const cached = upstashLimiters.get(cacheKey);
  if (cached) return cached;

  const [{ Ratelimit }, { Redis }] = await Promise.all([import("@upstash/ratelimit"), import("@upstash/redis")]);
  const limiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
    prefix: "affhub:rl",
    analytics: false,
  });
  upstashLimiters.set(cacheKey, limiter);
  return limiter;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function rateLimit(input: RateLimitInput): Promise<RateLimitResult> {
  const { key, limit, windowSeconds } = input;
  if (!key || limit < 1 || windowSeconds < 1) {
    throw new Error("rateLimit: key, limit and windowSeconds are required and must be positive");
  }

  if (upstashConfigured()) {
    try {
      const limiter = await getUpstashLimiter(limit, windowSeconds);
      const r = await limiter.limit(key);
      return {
        success: r.success,
        limit: r.limit,
        remaining: r.remaining,
        reset: r.reset,
        retryAfterSeconds: r.success ? 0 : Math.max(1, Math.ceil((r.reset - Date.now()) / 1000)),
        backend: "upstash",
      };
    } catch (error) {
      console.error(
        JSON.stringify({
          level: "error",
          msg: "rate-limit: Upstash failed, falling back to in-memory limiter",
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  }
  return memoryLimit(input);
}

/** Convenience for Server Actions and Route Handlers: returns the result for a preset. */
export async function checkRateLimit(
  preset: RateLimitPreset,
  headers: { get(name: string): string | null },
): Promise<RateLimitResult> {
  const key = await rateLimitKey(preset.scope, getClientIp(headers));
  return rateLimit({ key, limit: preset.limit, windowSeconds: preset.windowSeconds });
}

/** A ready-made 429 for Route Handlers. */
export function rateLimitedResponse(result: RateLimitResult): Response {
  return new Response(JSON.stringify({ error: "Too many requests. Please try again shortly." }), {
    status: 429,
    headers: {
      "content-type": "application/json",
      "retry-after": String(result.retryAfterSeconds),
      "x-ratelimit-limit": String(result.limit),
      "x-ratelimit-remaining": String(result.remaining),
      "cache-control": "no-store",
    },
  });
}

/**
 * One-liner for Route Handlers:
 *   const limited = await enforceRateLimit(RATE_LIMITS.go, request.headers);
 *   if (limited) return limited;
 */
export async function enforceRateLimit(
  preset: RateLimitPreset,
  headers: { get(name: string): string | null },
): Promise<Response | null> {
  const result = await checkRateLimit(preset, headers);
  return result.success ? null : rateLimitedResponse(result);
}
