export type StockState = "in_stock" | "partly" | "out_of_stock" | "no_links";

export type DaySeries = { day: string; clicks: number; views: number };

export type Summary = {
  totalClicks: number;
  totalViews: number;
  topCountry: string | null;
  outOfStockProducts: number;
};

export type CountryClicks = { visitorCountry: string; clicks: number };

export type ProductStat = {
  productId: string;
  name: string;
  views: number;
  clicks: number;
  topCountry: string | null;
  stockStatus: StockState;
};

export type SourceLabel = "Pinterest" | "Direct" | "Other";
export type SourceStat = { label: SourceLabel; clicks: number; views: number };

export type DeviceStat = { device: "mobile" | "desktop"; clicks: number; views: number };

export type ProductCountryStat = {
  /** US, IN, BR, MX, ID or OTHER */
  visitorCountry: string;
  views: number;
  clicks: number;
  /** Store whose link visitors from this country are sent to (null when no link exists). */
  linkStore: string | null;
  hasLink: boolean;
  inStock: boolean | null;
};

export type ProductOption = { id: string; name: string };

export type ChartPoint = {
  label: string;
  tooltip: string;
  value: number;
  secondary?: number;
};

export type CampaignStat = {
  campaign: string;
  content: string | null;
  views: number;
  clicks: number;
  clickRate: number;
  topCountry: string | null;
};

export type CampaignCountryStat = {
  country: string;
  views: number;
  clicks: number;
};
