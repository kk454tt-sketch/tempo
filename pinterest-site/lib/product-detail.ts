import { unstable_cache } from "next/cache";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { PRODUCT_SELECT, type ProductLink, type ProductWithLinks } from "@/lib/products";

export type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  gallery_urls: string[] | null;
  category_id: string | null;
  category: { name: string; slug: string } | null;
  product_links: ProductLink[];
};

const DETAIL_SELECT =
  "id, name, slug, description, image_url, gallery_urls, category_id, category:categories(name, slug), product_links(*)";

/**
 * The published product with its category and links, or null (unknown slug or unpublished).
 * Cached across requests for 60s under tags "catalog" and "product:{slug}", and deduplicated
 * per render via React cache().
 */
export const getProductBySlug = cache(async (slug: string): Promise<ProductDetail | null> => {
  const fetcher = unstable_cache(
    async (): Promise<ProductDetail | null> => {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("products")
        .select(DETAIL_SELECT)
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error) {
        throw new Error(`Could not load product: ${error.message}`);
      }
      return data ? (data as unknown as ProductDetail) : null;
    },
    ["catalog-product-by-slug", slug],
    { revalidate: 60, tags: ["catalog", `product:${slug}`] },
  );

  return fetcher();
});

/** Main image first, then the gallery, without duplicates or empty values. */
export function getProductImages(product: Pick<ProductDetail, "image_url" | "gallery_urls">): string[] {
  const all = [product.image_url, ...(product.gallery_urls ?? [])].filter(
    (url): url is string => typeof url === "string" && url.trim() !== "",
  );
  return [...new Set(all)];
}

const getRelatedProductsCached = unstable_cache(
  async (productId: string, categoryId: string | null, limit: number): Promise<ProductWithLinks[]> => {
    try {
      const supabase = createPublicClient();

      const newestOthers = () =>
        supabase
          .from("products")
          .select(PRODUCT_SELECT)
          .eq("is_published", true)
          .neq("id", productId)
          .order("created_at", { ascending: false })
          .order("id", { ascending: true });

      const picked: ProductWithLinks[] = [];

      if (categoryId) {
        const { data, error } = await newestOthers().eq("category_id", categoryId).limit(limit);
        if (error) throw error;
        picked.push(...((data ?? []) as unknown as ProductWithLinks[]));
      }

      if (picked.length < limit) {
        const excluded = [productId, ...picked.map((item) => item.id)];
        const { data, error } = await newestOthers()
          .not("id", "in", `(${excluded.join(",")})`)
          .limit(limit - picked.length);
        if (error) throw error;
        picked.push(...((data ?? []) as unknown as ProductWithLinks[]));
      }

      return picked;
    } catch (error) {
      console.error("[product] could not load related products:", error);
      return [];
    }
  },
  ["catalog-related-products"],
  { revalidate: 60, tags: ["catalog"] },
);

export async function getRelatedProducts(
  product: Pick<ProductDetail, "id" | "category_id">,
  limit = 4,
): Promise<ProductWithLinks[]> {
  return getRelatedProductsCached(product.id, product.category_id, limit);
}
