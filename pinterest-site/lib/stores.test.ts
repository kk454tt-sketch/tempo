import { describe, expect, it } from "vitest";
import { parseStoreParam, pickLink } from "./stores";

const links = [
  { country_code: "US", url: "https://www.amazon.com/dp/B001" },
  { country_code: "IN", url: "https://www.amazon.in/dp/B001" },
  { country_code: "BR", url: "https://www.amazon.com.br/dp/B001" },
];

describe("pickLink", () => {
  it("picks the visitor's own store when available", () => {
    expect(pickLink(links, "IN")?.country_code).toBe("IN");
    expect(pickLink(links, "BR")?.country_code).toBe("BR");
  });

  it("uses the ID link for Indonesia when present, otherwise falls back to US", () => {
    const withId = [...links, { country_code: "ID", url: "https://www.amazon.com/dp/B001-ID" }];
    expect(pickLink(withId, "ID")?.country_code).toBe("ID");
    expect(pickLink(links, "ID")?.country_code).toBe("US");
  });

  it("falls back to US for stores without a dedicated link or unknown countries", () => {
    expect(pickLink(links, "MX")?.country_code).toBe("US");
    expect(pickLink(links, "DE")?.country_code).toBe("US");
  });

  it("falls back to the first available link when US is absent", () => {
    const onlyBrMx = [
      { country_code: "MX", url: "https://www.amazon.com.mx/dp/B001" },
      { country_code: "BR", url: "https://www.amazon.com.br/dp/B001" },
    ];
    // STORE_CODES order prefers BR before MX
    expect(pickLink(onlyBrMx, "DE")?.country_code).toBe("BR");
  });

  it("honours storeOverride only when valid", () => {
    expect(pickLink(links, "US", parseStoreParam("in"))?.country_code).toBe("IN");
    expect(parseStoreParam("ID")).toBeNull();
    expect(parseStoreParam("FR")).toBeNull();
  });
});
