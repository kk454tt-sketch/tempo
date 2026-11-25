/** Pure helpers, safe to import from server and client components. */

export type RangeKey = "7d" | "30d" | "90d";

export const RANGE_DAYS: Record<RangeKey, number> = { "7d": 7, "30d": 30, "90d": 90 };
export const DASHBOARD_RANGES: readonly RangeKey[] = ["7d", "30d"];
export const ANALYTICS_RANGES: readonly RangeKey[] = ["7d", "30d", "90d"];

/** Reads ?range= and falls back to the first allowed option. */
export function parseRange(
  value: string | string[] | undefined,
  allowed: readonly RangeKey[],
): RangeKey {
  const raw = Array.isArray(value) ? value[0] : value;
  return allowed.find((range) => range === raw) ?? allowed[0] ?? "7d";
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(value: string): boolean {
  return UUID.test(value);
}

export function dashboardHref(range: RangeKey): string {
  return `/admin?range=${range}`;
}

export function analyticsHref(
  range: RangeKey,
  product?: string | null,
  options: { toDetail?: boolean; campaign?: string | null } = {},
): string {
  const query = new URLSearchParams({ range });
  if (product) query.set("product", product);
  if (options.campaign) query.set("campaign", options.campaign);
  const hash = product && options.toDetail ? "#product-detail" : options.campaign ? "#campaigns-card" : "";
  return `/admin/analytics?${query.toString()}${hash}`;
}
