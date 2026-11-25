import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { logger } from "./logger";

describe("logger", () => {
  let lines: string[];
  beforeEach(() => {
    lines = [];
    delete process.env.SENTRY_DSN;
    vi.spyOn(console, "log").mockImplementation((l: string) => void lines.push(l));
    vi.spyOn(console, "error").mockImplementation((l: string) => void lines.push(l));
  });
  afterEach(() => vi.restoreAllMocks());

  it("writes one JSON object per line", () => {
    logger.info("hello", { productId: "p1" });
    const parsed = JSON.parse(lines[0]);
    expect(parsed).toMatchObject({ level: "info", msg: "hello", productId: "p1" });
    expect(typeof parsed.time).toBe("string");
  });

  it("redacts secret-looking and IP keys and masks IPv4 in strings", () => {
    logger.info("login from 203.0.113.7", {
      password: "hunter2",
      cookie: "sb=abc",
      ip: "203.0.113.7",
      nested: { authorization: "Bearer x", note: "from 198.51.100.4 ok" },
    });
    const text = lines[0];
    expect(text).not.toContain("hunter2");
    expect(text).not.toContain("sb=abc");
    expect(text).not.toContain("Bearer x");
    expect(text).not.toContain("203.0.113.7");
    expect(text).not.toContain("198.51.100.4");
    expect(text).toContain("[redacted]");
  });

  it("serializes errors and supports child bindings", () => {
    logger.child({ route: "cron" }).error("boom", { error: new Error("bad thing") });
    const parsed = JSON.parse(lines[0]);
    expect(parsed.route).toBe("cron");
    expect(parsed.error.message).toBe("bad thing");
  });
});
