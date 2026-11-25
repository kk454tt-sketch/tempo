import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetRateLimitMemory,
  enforceRateLimit,
  getClientIp,
  rateLimit,
  rateLimitKey,
  RATE_LIMITS,
} from "./rate-limit";

describe("rateLimit (in-memory backend)", () => {
  beforeEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    __resetRateLimitMemory();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("allows up to the limit, then blocks with a retry-after", async () => {
    for (let i = 0; i < 5; i++) {
      expect((await rateLimit({ key: "k", limit: 5, windowSeconds: 60 })).success).toBe(true);
    }
    const blocked = await rateLimit({ key: "k", limit: 5, windowSeconds: 60 });
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThanOrEqual(1);
    expect(blocked.backend).toBe("memory");
  });

  it("frees capacity once the window has passed", async () => {
    for (let i = 0; i < 5; i++) await rateLimit({ key: "k", limit: 5, windowSeconds: 60 });
    vi.advanceTimersByTime(61_000);
    expect((await rateLimit({ key: "k", limit: 5, windowSeconds: 60 })).success).toBe(true);
  });

  it("keeps keys independent", async () => {
    for (let i = 0; i < 5; i++) await rateLimit({ key: "a", limit: 5, windowSeconds: 60 });
    expect((await rateLimit({ key: "b", limit: 5, windowSeconds: 60 })).success).toBe(true);
  });

  it("rejects invalid input", async () => {
    await expect(rateLimit({ key: "", limit: 5, windowSeconds: 60 })).rejects.toThrow();
    await expect(rateLimit({ key: "k", limit: 0, windowSeconds: 60 })).rejects.toThrow();
  });

  it("enforceRateLimit returns a 429 with Retry-After after the preset limit", async () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.9" });
    for (let i = 0; i < RATE_LIMITS.adminLogin.limit; i++) {
      expect(await enforceRateLimit(RATE_LIMITS.adminLogin, headers)).toBeNull();
    }
    const res = await enforceRateLimit(RATE_LIMITS.adminLogin, headers);
    expect(res?.status).toBe(429);
    expect(Number(res?.headers.get("retry-after"))).toBeGreaterThanOrEqual(1);
  });
});

describe("rateLimitKey / getClientIp", () => {
  it("never contains the raw IP and is stable per IP + scope", async () => {
    const a = await rateLimitKey("go", "198.51.100.23");
    const b = await rateLimitKey("go", "198.51.100.23");
    const c = await rateLimitKey("go", "198.51.100.24");
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).not.toContain("198.51.100.23");
    expect(a).toMatch(/^go:[0-9a-f]{64}$/);
  });

  it("reads the first x-forwarded-for entry, then x-real-ip, then 'unknown'", () => {
    expect(getClientIp(new Headers({ "x-forwarded-for": "1.1.1.1, 2.2.2.2" }))).toBe("1.1.1.1");
    expect(getClientIp(new Headers({ "x-real-ip": "3.3.3.3" }))).toBe("3.3.3.3");
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});
