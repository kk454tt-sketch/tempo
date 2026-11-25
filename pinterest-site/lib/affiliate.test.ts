import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { affiliateTagFor } from "./affiliate";
import { appendAffiliateTag } from "./tracking";

describe("appendAffiliateTag", () => {
  it("appends tag when missing", () => {
    expect(appendAffiliateTag("https://www.amazon.com/dp/B0TEST", "affhub-20")).toBe(
      "https://www.amazon.com/dp/B0TEST?tag=affhub-20",
    );
  });

  it("preserves an existing tag parameter", () => {
    expect(appendAffiliateTag("https://www.amazon.in/dp/B0TEST?tag=existing-21", "affhub-21")).toBe(
      "https://www.amazon.in/dp/B0TEST?tag=existing-21",
    );
  });

  it("leaves short links untouched", () => {
    expect(appendAffiliateTag("https://amzn.to/3xyz", "affhub-20")).toBe("https://amzn.to/3xyz");
    expect(appendAffiliateTag("https://a.co/d/abc", "affhub-20")).toBe("https://a.co/d/abc");
  });

  it("uses US affiliate tag for Indonesia fallback", () => {
    const tags = new Map<string, string>([["US", "us-tag-20"]]);
    expect(affiliateTagFor(tags, "ID")).toBe("us-tag-20");
  });
});
