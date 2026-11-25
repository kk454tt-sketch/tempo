/**
 * Pure helpers for the /products filters. No server-only imports, so this file
 * is safe to use from both server and client components.
 */

export const PRODUCTS_PAGE_SIZE = 12;

const MAX_PAGE = 100;
const MAX_QUERY_LENGTH = 100;
const MAX_CATEGORY_LENGTH = 80;

export type ProductFilters = {
  q: string;
  category: string;
  page: number;
};

export type SearchParamsInput = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? '';
}

/** Reads and sanitises ?q=, ?category= and ?page= from the URL. */
export function parseProductFilters(params: SearchParamsInput): ProductFilters {
  const q = firstValue(params.q).trim().slice(0, MAX_QUERY_LENGTH);
  const category = firstValue(params.category).trim().slice(0, MAX_CATEGORY_LENGTH);

  const rawPage = Number.parseInt(firstValue(params.page) || '1', 10);
  const page = Number.isFinite(rawPage) ? Math.min(Math.max(rawPage, 1), MAX_PAGE) : 1;

  return { q, category, page };
}

export function hasActiveFilters(filters: Pick<ProductFilters, 'q' | 'category'>): boolean {
  return filters.q !== '' || filters.category !== '';
}

/** Builds a shareable /products URL. Empty values and page 1 are left out. */
export function buildProductsHref(filters: Partial<ProductFilters> = {}): string {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.category) params.set('category', filters.category);
  if (filters.page && filters.page > 1) params.set('page', String(filters.page));

  const query = params.toString();
  return query ? `/products?${query}` : '/products';
}

/** Escapes LIKE wildcards so a visitor typing "%" or "_" searches for the literal character. */
export function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}
