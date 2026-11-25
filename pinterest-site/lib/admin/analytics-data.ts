import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ANALYTICS_TZ } from "@/lib/config";
import type {
  CampaignCountryStat,
  CampaignStat,
  CountryClicks,
  DaySeries,
  DeviceStat,
  ProductCountryStat,
  ProductOption,
  ProductStat,
  SourceLabel,
  SourceStat,
  StockState,
  Summary,
} from "./analytics-types";

type NumberLike = number | string | null;
const num = (value: NumberLike | undefined): number => Number(value ?? 0);

async function rpc<T>(db: SupabaseClient, fn: string, args: Record<string, unknown>): Promise<T[]> {
  const { data, error } = await db.rpc(fn, args);
  if (error) throw new Error(`${fn} failed: ${error.message}`);
  return (data ?? []) as T[];
}

/** Args shared by the range functions. The product filter is only sent when set. */
function rangeArgs(days: number, productId: string | null = null): Record<string, unknown> {
  return { days, tz: ANALYTICS_TZ, ...(productId ? { p_product: productId } : {}) };
}

type RawSummary = {
  total_clicks: NumberLike;
  total_views: NumberLike;
  top_country: string | null;
  out_of_stock_products: NumberLike;
};
type RawDay = { day: string; clicks: NumberLike; views: NumberLike };
type RawCountry = { visitor_country: string; clicks: NumberLike };
type RawProduct = {
  product_id: string;
  name: string;
  views: NumberLike;
  clicks: NumberLike;
  top_country: string | null;
  stock_status: string;
};
type RawSource = { source_label: string; clicks: NumberLike; views: NumberLike };
type RawDevice = { device: string; clicks: NumberLike; views: NumberLike };
type RawProductCountry = {
  visitor_country: string;
  views: NumberLike;
  clicks: NumberLike;
  link_store: string | null;
  has_link: boolean;
  in_stock: boolean | null;
};

function toSummary(row: RawSummary | undefined): Summary {
  return {
    totalClicks: num(row?.total_clicks),
    totalViews: num(row?.total_views),
    topCountry: row?.top_country ?? null,
    outOfStockProducts: num(row?.out_of_stock_products),
  };
}

const toSeries = (rows: RawDay[]): DaySeries[] =>
  rows.map((row) => ({ day: row.day, clicks: num(row.clicks), views: num(row.views) }));

const toCountries = (rows: RawCountry[]): CountryClicks[] =>
  rows.map((row) => ({ visitorCountry: row.visitor_country, clicks: num(row.clicks) }));

const STOCK_STATES: readonly StockState[] = ["in_stock", "partly", "out_of_stock", "no_links"];
const toStockState = (value: string): StockState =>
  STOCK_STATES.find((state) => state === value) ?? "no_links";

const toProducts = (rows: RawProduct[]): ProductStat[] =>
  rows.map((row) => ({
    productId: row.product_id,
    name: row.name,
    views: num(row.views),
    clicks: num(row.clicks),
    topCountry: row.top_country,
    stockStatus: toStockState(row.stock_status),
  }));

const SOURCE_LABELS: readonly SourceLabel[] = ["Pinterest", "Direct", "Other"];
function toSources(rows: RawSource[]): SourceStat[] {
  return SOURCE_LABELS.map((label) => {
    const row = rows.find((entry) => entry.source_label === label);
    return { label, clicks: num(row?.clicks), views: num(row?.views) };
  });
}

function toDevices(rows: RawDevice[]): DeviceStat[] {
  return (["mobile", "desktop"] as const).map((device) => {
    const row = rows.find((entry) => entry.device === device);
    return { device, clicks: num(row?.clicks), views: num(row?.views) };
  });
}

const toProductCountries = (rows: RawProductCountry[]): ProductCountryStat[] =>
  rows.map((row) => ({
    visitorCountry: row.visitor_country,
    views: num(row.views),
    clicks: num(row.clicks),
    linkStore: row.link_store,
    hasLink: row.has_link,
    inStock: row.in_stock,
  }));

export async function getDashboardData(db: SupabaseClient, days: number) {
  const [summary, series, countries, top] = await Promise.all([
    rpc<RawSummary>(db, "analytics_summary", rangeArgs(days)),
    rpc<RawDay>(db, "clicks_over_time", rangeArgs(days)),
    rpc<RawCountry>(db, "clicks_by_country", rangeArgs(days)),
    rpc<RawProduct>(db, "top_products", { days, lim: 5, tz: ANALYTICS_TZ }),
  ]);

  return {
    summary: toSummary(summary[0]),
    series: toSeries(series),
    countries: toCountries(countries),
    // Only products that actually got clicks belong in "Top products".
    topProducts: toProducts(top).filter((product) => product.clicks > 0),
  };
}

export async function getProductOptions(db: SupabaseClient): Promise<ProductOption[]> {
  const { data, error } = await db.from("products").select("id, name").order("name");
  if (error) throw new Error(`products failed: ${error.message}`);
  return (data ?? []) as ProductOption[];
}

export async function getAnalyticsData(db: SupabaseClient, days: number, productId: string | null) {
  const [summary, series, sources, devices, products, detail] = await Promise.all([
    rpc<RawSummary>(db, "analytics_summary", rangeArgs(days, productId)),
    rpc<RawDay>(db, "clicks_over_time", rangeArgs(days, productId)),
    rpc<RawSource>(db, "analytics_sources", rangeArgs(days, productId)),
    rpc<RawDevice>(db, "analytics_devices", rangeArgs(days, productId)),
    rpc<RawProduct>(db, "top_products", { days, lim: 200, tz: ANALYTICS_TZ }),
    productId
      ? rpc<RawProductCountry>(db, "product_analytics", {
          product_id: productId,
          days,
          tz: ANALYTICS_TZ,
        })
      : Promise.resolve([] as RawProductCountry[]),
  ]);

  return {
    summary: toSummary(summary[0]),
    series: toSeries(series),
    sources: toSources(sources),
    devices: toDevices(devices),
    products: toProducts(products),
    productCountries: toProductCountries(detail),
  };
}

type RawCampaign = {
  campaign: string;
  content: string | null;
  views: NumberLike;
  clicks: NumberLike;
  click_rate: NumberLike;
  top_country: string | null;
};

type RawCampaignCountry = {
  country: string;
  views: NumberLike;
  clicks: NumberLike;
};

export async function getCampaigns(db: SupabaseClient, days: number): Promise<CampaignStat[]> {
  const rows = await rpc<RawCampaign>(db, "analytics_campaigns", { days, tz: ANALYTICS_TZ });
  return rows.map((row) => ({
    campaign: row.campaign,
    content: row.content ?? null,
    views: num(row.views),
    clicks: num(row.clicks),
    clickRate: num(row.click_rate),
    topCountry: row.top_country ?? null,
  }));
}

export async function getCampaignCountries(
  db: SupabaseClient,
  campaign: string,
  days: number,
): Promise<CampaignCountryStat[]> {
  const rows = await rpc<RawCampaignCountry>(db, "analytics_campaign_countries", {
    p_campaign: campaign,
    days,
    tz: ANALYTICS_TZ,
  });
  return rows.map((row) => ({
    country: row.country,
    views: num(row.views),
    clicks: num(row.clicks),
  }));
}
