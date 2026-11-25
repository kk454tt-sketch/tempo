import { describe, expect, it } from "vitest";
import { isAllowedHost, isShortLinkHost } from "./url-allowlist";

describe("isAllowedHost", () => {
  it("allows supported Amazon storefronts over https", () => {
    expect(isAllowedHost("https://amazon.com/dp/B0TEST")).toBe(true);
    expect(isAllowedHost("https://www.amazon.in/dp/B0TEST")).toBe(true);
    expect(isAllowedHost("https://www.amazon.com.br/dp/B0TEST")).toBe(true);
    expect(isAllowedHost("https://amazon.com.mx/dp/B0TEST")).toBe(true);
  });

  it("allows official Amazon short-link hosts", () => {
    for (const host of ["amzn.to", "amzn.in", "a.co", "amzn.eu"]) {
      expect(isAllowedHost(`https://${host}/abc123`)).toBe(true);
      expect(isShortLinkHost(`https://${host}/abc123`)).toBe(true);
    }
  });

  it("rejects http, non-Amazon hosts and malformed URLs", () => {
    expect(isAllowedHost("http://amazon.com/dp/B0TEST")).toBe(false);
    expect(isAllowedHost("https://evil.invalid/amazon.com")).toBe(false);
    expect(isAllowedHost("https://amazon.co.uk/dp/B0TEST")).toBe(false);
    expect(isAllowedHost("not-a-url")).toBe(false);
  });
});
