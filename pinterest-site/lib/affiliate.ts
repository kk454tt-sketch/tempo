import { createAdminClient } from "@/lib/supabase/admin";
export {
  AFFILIATE_COUNTRIES,
  isValidTag,
  normalizeTag,
  type AffiliateCountry,
} from "@/lib/affiliate-shared";

/**
 * store_settings is not publicly readable, so the tags are read with the
 * service role on the server. Never pass this map (or a tag) to a client
 * component; send booleans only.
 */
export type AffiliateTags = ReadonlyMap<string, string>;

export async function getAffiliateTags(): Promise<AffiliateTags> {
  const tags = new Map<string, string>();

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from("store_settings").select("country_code, affiliate_tag");
    if (error) throw error;

    for (const row of (data ?? []) as { country_code: string; affiliate_tag: string | null }[]) {
      const tag = row.affiliate_tag?.trim();
      if (tag) tags.set(row.country_code, tag);
    }
  } catch (error) {
    // Affiliate tags are optional: a failure must never break a page or a redirect.
    console.error("[affiliate] could not read store_settings:", error);
  }

  return tags;
}

/** The tag for a product_links country code, or null. */
export function affiliateTagFor(tags: AffiliateTags, countryCode: string): string | null {
  const direct = tags.get(countryCode);
  if (direct) return direct;

  // The Indonesia fallback link opens Amazon US, so it earns on the US tag.
  if (countryCode === "ID") return tags.get("US") ?? null;

  return null;
}
