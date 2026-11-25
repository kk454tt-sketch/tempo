import type { SupportedCountry } from "@/lib/countries";

export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  image_url: string | null;
  gallery_urls: string[];
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductLink {
  id: string;
  product_id: string;
  country_code: SupportedCountry;
  url: string;
  price: number | null;
  currency: string;
  in_stock: boolean;
}

export interface StoreSetting {
  country_code: SupportedCountry;
  affiliate_tag: string | null;
}

export type EventType = "product_view" | "click";
export type DeviceType = "mobile" | "desktop";

export interface EventInsert {
  type: EventType;
  product_id: string;
  visitor_country: string | null;
  store_country: string | null;
  source: string | null;
  campaign: string | null;
  content?: string | null;
  term?: string | null;
  device: DeviceType | null;
  session_id?: string | null;
}

export type StockStatus = "in_stock" | "partial" | "out_of_stock" | "no_links";

/** Return shapes of the security-definer analytics functions (see supabase/migrations/0001_init.sql). */
export interface AnalyticsSummary {
  total_views: number;
  total_clicks: number;
  /** Clicks divided by views, in percent. */
  click_rate: number;
  pinterest_clicks: number;
  top_country: string | null;
  top_product_id: string | null;
  top_product_name: string | null;
}

export interface ClicksOverTimeRow {
  day: string;
  clicks: number;
  views: number;
}

export interface ClicksByCountryRow {
  country: string;
  clicks: number;
  views: number;
}

export interface TopProductRow {
  product_id: string;
  name: string;
  slug: string;
  image_url: string | null;
  clicks: number;
  views: number;
  top_visitor_country: string | null;
  stock_status: StockStatus;
}
