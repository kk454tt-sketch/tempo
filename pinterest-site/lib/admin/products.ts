import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ANALYTICS_TZ } from '@/lib/config';
import { PAGE_SIZE, escapeLike, type ProductFilters, type ProductRowView } from './filters';
import { emptyProductInput, type CategoryOption, type ProductInput } from './product-schema';
import { isCountryCode } from './stores';
import { exactDate, relativeTime } from './time';

interface ListRow {
  product_id: string;
  name: string;
  image_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  updated_at: string;
  clicks: number;
  in_countries: string[];
  out_countries: string[];
}

export async function getAdminProducts(
  supabase: SupabaseClient,
  filters: ProductFilters,
): Promise<{ rows: ProductRowView[]; total: number }> {
  let query = supabase
    .from('admin_product_list')
    .select('product_id, name, image_url, is_published, is_featured, updated_at, clicks, in_countries, out_countries', {
      count: 'exact',
    });

  if (filters.q) query = query.ilike('name', `%${escapeLike(filters.q)}%`);

  if (filters.stock && filters.country) {
    // stock state of that one country
    query = query.contains(filters.stock === 'in' ? 'in_countries' : 'out_countries', [filters.country]);
  } else if (filters.stock === 'out') {
    query = query.gt('out_count', 0); // at least one store is out (same rule as the dashboard card)
  } else if (filters.stock === 'in') {
    query = query.gt('link_count', 0).eq('out_count', 0); // every store link is in stock
  }

  const from = (filters.page - 1) * PAGE_SIZE;
  const { data, count, error } = await query
    .order('updated_at', { ascending: false })
    .order('product_id')
    .range(from, from + PAGE_SIZE - 1);

  if (error) {
    if (error.code === 'PGRST103') return { rows: [], total: 0 }; // page past the end
    throw new Error(error.message);
  }

  const now = Date.now();
  const rows = ((data ?? []) as ListRow[]).map((row) => ({
    id: row.product_id,
    name: row.name,
    imageUrl: row.image_url,
    isPublished: row.is_published,
    isFeatured: row.is_featured,
    clicks: row.clicks,
    inCountries: row.in_countries,
    outCountries: row.out_countries,
    updatedAgo: relativeTime(row.updated_at, now),
    updatedExact: exactDate(row.updated_at, ANALYTICS_TZ),
  }));
  return { rows, total: count ?? 0 };
}

export async function getCategories(supabase: SupabaseClient): Promise<CategoryOption[]> {
  const { data, error } = await supabase.from('categories').select('id, name').order('sort_order').order('name');
  if (error) throw new Error(error.message);
  return (data ?? []) as CategoryOption[];
}

interface EditRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  image_url: string | null;
  gallery_urls: string[] | null;
  is_published: boolean;
  is_featured: boolean;
  product_links: { country_code: string; url: string; price: number | string | null; in_stock: boolean }[] | null;
}

export async function getProductForEdit(
  supabase: SupabaseClient,
  id: string,
): Promise<{ name: string; values: ProductInput } | null> {
  const { data, error } = await supabase
    .from('products')
    .select(
      'id, name, slug, description, category_id, image_url, gallery_urls, is_published, is_featured, product_links(country_code, url, price, in_stock)',
    )
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const row = data as EditRow;
  const values = emptyProductInput(row.id);
  values.name = row.name;
  values.slug = row.slug;
  values.description = row.description ?? '';
  values.categoryId = row.category_id ?? '';
  values.imageUrl = row.image_url ?? '';
  values.galleryUrls = row.gallery_urls ?? [];
  values.isPublished = row.is_published;
  values.isFeatured = row.is_featured;
  for (const link of row.product_links ?? []) {
    if (!isCountryCode(link.country_code)) continue;
    values.links[link.country_code] = {
      url: link.url,
      price: link.price == null ? '' : String(link.price),
      inStock: link.in_stock,
    };
  }
  return { name: row.name, values };
}
