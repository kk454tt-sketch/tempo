import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { CountryCode } from "@/lib/countries";
import {
  PRODUCTS_PAGE_SIZE,
  escapeLikePattern,
  type ProductFilters,
} from "@/lib/product-filters";

export const HOME_PRODUCT_LIMIT = 8;

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type ProductLink = {
  id?: string;
  product_id?: string;
  country_code: CountryCode;
  url?: string;
  price: number | null;
  currency: string | null;
  in_stock: boolean;
};

export type ProductSummary = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  is_featured: boolean;
  created_at: string;
  product_links: ProductLink[];
};

export type ProductWithLinks = ProductSummary;

export type ProductPage = {
  products: ProductWithLinks[];
  /** Total number of products matching the filters (not just this page). */
  total: number;
  hasMore: boolean;
};

export type CategorySummary = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  /** Image of the newest product in the category that has one, or null. */
  coverImageUrl: string | null;
};

/* -------------------------------------------------------------------------- */
/* Products (public anon client, cached 60s under tag "catalog")              */
/* -------------------------------------------------------------------------- */

export const PRODUCT_SELECT =
  "id, name, slug, image_url, is_featured, created_at, product_links!inner(*)";

export const getHomeProducts = unstable_cache(
  async (): Promise<ProductSummary[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, name, slug, image_url, is_featured, created_at, product_links!inner(country_code, price, currency, in_stock)",
      )
      .eq("is_published", true)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(HOME_PRODUCT_LIMIT);

    if (error) throw new Error(`Could not load products: ${error.message}`);
    return (data ?? []) as unknown as ProductSummary[];
  },
  ["catalog-home-products"],
  { revalidate: 60, tags: ["catalog"] },
);

const getProductsCached = unstable_cache(
  async (category: string | null, q: string | null, page: number): Promise<ProductPage> => {
    const supabase = createPublicClient();
    const upTo = page * PRODUCTS_PAGE_SIZE;

    const select = category ? `${PRODUCT_SELECT}, categories!inner(slug)` : PRODUCT_SELECT;

    let query = supabase
      .from("products")
      .select(select, { count: "exact" })
      .eq("is_published", true);

    if (category) {
      query = query.eq("categories.slug", category);
    }
    if (q) {
      query = query.ilike("name", `%${escapeLikePattern(q)}%`);
    }

    const { data, error, count } = await query
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .order("id", { ascending: true })
      .range(0, upTo - 1);

    if (error) {
      throw new Error(`Could not load products: ${error.message}`);
    }

    const products = (data ?? []) as unknown as ProductWithLinks[];
    const total = count ?? products.length;

    return { products, total, hasMore: total > upTo };
  },
  ["catalog-products"],
  { revalidate: 60, tags: ["catalog"] },
);

export async function getProducts(filters: ProductFilters): Promise<ProductPage> {
  return getProductsCached(filters.category ?? null, filters.q ?? null, filters.page);
}

/* -------------------------------------------------------------------------- */
/* Categories                                                                 */
/* -------------------------------------------------------------------------- */

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  products: { id: string; image_url: string | null; created_at: string }[];
};

export const getCategorySummaries = unstable_cache(
  async (): Promise<CategorySummary[]> => {
    const supabase = createPublicClient();

    const { data, error } = await supabase
      .from("categories")
      .select(
        "id, name, slug, sort_order, products!inner(id, image_url, created_at, product_links!inner(id))",
      )
      .eq("products.is_published", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true })
      .order("created_at", { referencedTable: "products", ascending: false });

    if (error) {
      throw new Error(`Could not load categories: ${error.message}`);
    }

    return ((data ?? []) as unknown as CategoryRow[]).map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      productCount: category.products.length,
      coverImageUrl: category.products.find((product) => product.image_url)?.image_url ?? null,
    }));
  },
  ["catalog-categories"],
  { revalidate: 60, tags: ["catalog"] },
);
