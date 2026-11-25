import type { ChartPoint, CountryClicks, DaySeries } from "./analytics-types";
import type { RangeKey } from "./analytics-params";

const NUMBER = new Intl.NumberFormat("en-US");

/** 12345 -> "12,345" */
export function formatNumber(value: number): string {
  return NUMBER.format(value);
}

/** clicks / views as "12.3%", or "-" when there are no views to divide by. */
export function formatPercent(numerator: number, denominator: number): string {
  if (denominator <= 0) return "-";
  const percent = (numerator / denominator) * 100;
  return `${(Math.round(percent * 10) / 10).toFixed(1)}%`;
}

/** Days arrive as "YYYY-MM-DD". Parse and format in UTC so the label never shifts. */
function parseDay(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

function formatDayShort(iso: string, style: "weekday" | "date"): string {
  const date = parseDay(iso);
  return style === "weekday"
    ? date.toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" })
    : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

function formatDayLong(iso: string): string {
  return parseDay(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

/**
 * Axis label: weekday for 7d, date for 30d and 90d. Tooltip: full date.
 * `includeViews` adds the thin second (views) line used on the Analytics page.
 */
export function toChartPoints(
  series: readonly DaySeries[],
  range: RangeKey,
  includeViews = false,
): ChartPoint[] {
  const style = range === "7d" ? "weekday" : "date";
  return series.map((entry) => ({
    label: formatDayShort(entry.day, style),
    tooltip: formatDayLong(entry.day),
    value: entry.clicks,
    secondary: includeViews ? entry.views : undefined,
  }));
}

/**
 * Static country labels. These match lib/countries.ts; if you export a countries map there
 * you can derive this list from it instead.
 */
export const ANALYTICS_COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "ID", name: "Indonesia" },
] as const;

let regionNames: Intl.DisplayNames | null = null;

/** "IN" -> "India". Any other region code is resolved by Intl, "OTHER" -> "Other", empty -> "-". */
export function countryName(code: string | null | undefined): string {
  if (!code) return "-";
  const upper = code.toUpperCase();
  const known = ANALYTICS_COUNTRIES.find((country) => country.code === upper);
  if (known) return known.name;
  if (upper === "OTHER" || upper === "??") return "Other";
  try {
    regionNames ??= new Intl.DisplayNames(["en"], { type: "region" });
    return regionNames.of(upper) ?? upper;
  } catch {
    return upper;
  }
}

/** Clicks for the 5 store countries, plus "Other" only when it has clicks. */
export function groupCountryClicks(
  rows: readonly CountryClicks[],
): { code: string; name: string; clicks: number }[] {
  const totals: Record<string, number> = {};
  for (const country of ANALYTICS_COUNTRIES) totals[country.code] = 0;

  let other = 0;
  for (const row of rows) {
    const code = row.visitorCountry.toUpperCase();
    if (code in totals) totals[code] = (totals[code] ?? 0) + row.clicks;
    else other += row.clicks;
  }

  const list = ANALYTICS_COUNTRIES.map((country) => ({
    code: country.code as string,
    name: country.name as string,
    clicks: totals[country.code] ?? 0,
  }));
  if (other > 0) list.push({ code: "Other", name: "Other", clicks: other });
  return list;
}
