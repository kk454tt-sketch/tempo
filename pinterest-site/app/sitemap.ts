import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

const PAGE_SIZE = 1000; // PostgREST returns at most 1000 rows per request

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/products"), changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/categories"), changeFrequency: "weekly", priority: 0.6 },
  ];

  try {
    const supabase = createPublicClient();
    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error } = await supabase
        .from("products")
        .select("slug, updated_at")
        .eq("is_published", true)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true })
        .range(from, from + PAGE_SIZE - 1);
      if (error) throw error;
      for (const product of data ?? []) {
        entries.push({
          url: absoluteUrl(`/products/${product.slug}`),
          lastModified: product.updated_at ? new Date(product.updated_at) : undefined,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
      if (!data || data.length < PAGE_SIZE) break;
    }
  } catch (err) {
    // Never fail the build or the request over products: serve the static pages.
    console.error("sitemap: could not load products", err);
  }
  return entries;
}
