export const AFFILIATE_COUNTRIES = ["US", "IN", "BR", "MX"] as const; // Indonesia uses the US tag
export type AffiliateCountry = (typeof AFFILIATE_COUNTRIES)[number];

const TAG_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

/** Trims, and accepts a pasted `tag=name-20`. An empty result means "no tag". */
export function normalizeTag(raw: string): string {
  return raw.trim().replace(/^tag=/i, "").trim();
}

export function isValidTag(tag: string): boolean {
  return TAG_PATTERN.test(tag);
}
