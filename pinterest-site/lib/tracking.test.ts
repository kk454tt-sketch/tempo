import { describe, expect, it } from "vitest";
import { detectDevice, isBot, parseAttribution, resolveSource } from "./tracking";

describe("tracking helpers", () => {
  it("recognizes Pinterest from referrer host", () => {
    const attr = parseAttribution(new URL("https://affhub.test/products/desk"), "https://in.pinterest.com/pin/123/", null, 100);
    expect(attr?.referrer).toBe("in.pinterest.com");
    expect(resolveSource(attr)).toBe("pinterest");
  });

  it("recognizes Pinterest from utm_source and overrides existing attribution", () => {
    const existing = { source: "direct", medium: null, campaign: null, content: null, term: null, referrer: null, ts: 50 };
    const attr = parseAttribution(
      new URL("https://affhub.test/products/tray?utm_source=Pinterest&utm_campaign=Spring_Setup&utm_content=%20Pin_Hero%20&utm_term=Wood%20Tray"),
      null,
      existing,
      200,
    );
    expect(attr?.source).toBe("pinterest");
    expect(attr?.campaign).toBe("spring_setup");
    expect(attr?.content).toBe("pin_hero");
    expect(attr?.term).toBe("wood tray");
    expect(resolveSource(attr)).toBe("pinterest");
  });

  it("caps utm_content and utm_term at 100 characters", () => {
    const longVal = "a".repeat(140);
    const attr = parseAttribution(
      new URL(`https://affhub.test/?utm_source=pinterest&utm_content=${longVal}&utm_term=${longVal}`),
      null,
      null,
      300,
    );
    expect(attr?.content).toHaveLength(100);
    expect(attr?.term).toHaveLength(100);
  });

  it("detects bots while allowing Pinterest in-app browser", () => {
    expect(isBot("Pinterestbot/1.0")).toBe(true);
    expect(isBot("Googlebot/2.1")).toBe(true);
    expect(isBot("")).toBe(true);
    expect(isBot("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) [Pinterest/iOS]")).toBe(false);
  });

  it("detects mobile vs desktop devices", () => {
    expect(detectDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe("mobile");
    expect(detectDevice("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe("desktop");
  });
});
