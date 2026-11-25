import { isCountryCode, type CountryCode } from './stores';

export const PAGE_SIZE = 20;

export interface ProductFilters {
  q: string;
  country: CountryCode | null;
  stock: 'in' | 'out' | null;
  page: number;
}

/** What the list UI renders (times are formatted on the server so there is no hydration mismatch). */
export interface ProductRowView {
  id: string;
  name: string;
  imageUrl: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  clicks: number;
  inCountries: string[];
  outCountries: string[];
  updatedAgo: string;
  updatedExact: string;
}

type RawParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export function parseFilters(params: RawParams): ProductFilters {
  const country = (first(params.country) ?? '').toUpperCase();
  const stock = first(params.stock);
  const page = Number.parseInt(first(params.page) ?? '1', 10);
  return {
    q: (first(params.q) ?? '').trim().slice(0, 100),
    country: isCountryCode(country) ? country : null,
    stock: stock === 'in' || stock === 'out' ? stock : null,
    page: Number.isFinite(page) && page > 0 ? Math.min(page, 10_000) : 1,
  };
}

export function buildProductsHref(filters: Partial<ProductFilters>): string {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.country) params.set('country', filters.country);
  if (filters.stock) params.set('stock', filters.stock);
  if (filters.page && filters.page > 1) params.set('page', String(filters.page));
  const query = params.toString();
  return query ? `/admin/products?${query}` : '/admin/products';
}

/** Escapes % _ \ so user text is matched literally inside ilike. */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (m) => `\\${m}`);
}
