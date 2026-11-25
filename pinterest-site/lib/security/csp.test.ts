import { afterEach, describe, expect, it } from "vitest";
import { buildCsp, createNonce, getCspMode } from "./csp";

describe("buildCsp", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.CSP_MODE;
  });

  it("builds the policy from the brief", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://abcdefgh.supabase.co";
    const csp = buildCsp("NONCE123", { isDev: false });
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self' 'nonce-NONCE123'");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).toContain("img-src 'self' data: blob: https://abcdefgh.supabase.co");
    expect(csp).toContain("connect-src 'self' https://abcdefgh.supabase.co");
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it("only allows unsafe-eval in dev", () => {
    expect(buildCsp("n", { isDev: true })).toContain("'unsafe-eval'");
  });

  it("generates a different nonce each time", () => {
    expect(createNonce()).not.toBe(createNonce());
  });

  it("defaults to report-only", () => {
    expect(getCspMode()).toBe("report-only");
    process.env.CSP_MODE = "enforce";
    expect(getCspMode()).toBe("enforce");
  });
});
