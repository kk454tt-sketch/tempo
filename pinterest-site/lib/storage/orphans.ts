import { STORAGE_BUCKET, storagePathFromUrl } from "@/lib/admin/storage";
import { withThumbPaths } from "@/lib/storage/image-magic";
import { createAdminClient } from "@/lib/supabase/admin";

const DAY_MS = 24 * 60 * 60 * 1000;
const PAGE_LIMIT = 1000;

export interface StorageObjectItem {
  name: string;
  id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface OrphanFinderClient {
  listProducts(): Promise<{ image_url: string | null; gallery_urls: string[] | null }[]>;
  listObjects(prefix: string, offset: number, limit: number): Promise<StorageObjectItem[]>;
}

async function listAllObjects(client: OrphanFinderClient, prefix = ""): Promise<{ path: string; createdAt: number | null }[]> {
  const results: { path: string; createdAt: number | null }[] = [];
  let offset = 0;

  for (;;) {
    const items = await client.listObjects(prefix, offset, PAGE_LIMIT);
    if (!items || items.length === 0) break;

    for (const item of items) {
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
      // Folders in Supabase storage list() have id === null
      if (item.id === null) {
        const nested = await listAllObjects(client, fullPath);
        results.push(...nested);
      } else {
        const ts = item.created_at ?? item.updated_at;
        const parsed = ts ? Date.parse(ts) : NaN;
        results.push({ path: fullPath, createdAt: Number.isFinite(parsed) ? parsed : null });
      }
    }

    if (items.length < PAGE_LIMIT) break;
    offset += PAGE_LIMIT;
  }

  return results;
}

function defaultClient(): OrphanFinderClient {
  const admin = createAdminClient();
  return {
    async listProducts() {
      const rows: { image_url: string | null; gallery_urls: string[] | null }[] = [];
      let from = 0;
      for (;;) {
        const { data, error } = await admin
          .from("products")
          .select("image_url, gallery_urls")
          .range(from, from + PAGE_LIMIT - 1);
        if (error) throw new Error(error.message);
        const batch = (data ?? []) as { image_url: string | null; gallery_urls: string[] | null }[];
        rows.push(...batch);
        if (batch.length < PAGE_LIMIT) break;
        from += PAGE_LIMIT;
      }
      return rows;
    },
    async listObjects(prefix: string, offset: number, limit: number) {
      const { data, error } = await admin.storage
        .from(STORAGE_BUCKET)
        .list(prefix, { limit, offset, sortBy: { column: "name", order: "asc" } });
      if (error) throw new Error(error.message);
      return (data ?? []) as StorageObjectItem[];
    },
  };
}

/**
 * Returns object paths in product-images older than 24 hours that no product references
 * (including -sm thumbnail variants of referenced images).
 */
export async function findOrphans(
  client: OrphanFinderClient = defaultClient(),
  now: number = Date.now(),
): Promise<string[]> {
  const [products, objects] = await Promise.all([client.listProducts(), listAllObjects(client, "")]);

  const referencedUrls: string[] = [];
  for (const product of products) {
    if (product.image_url) referencedUrls.push(product.image_url);
    for (const url of product.gallery_urls ?? []) {
      if (url) referencedUrls.push(url);
    }
  }

  const basePaths = referencedUrls
    .map(storagePathFromUrl)
    .filter((p): p is string => p !== null);
  const referenced = new Set(withThumbPaths(basePaths));

  const orphans: string[] = [];
  for (const obj of objects) {
    if (referenced.has(obj.path)) continue;
    if (obj.createdAt === null || now - obj.createdAt <= DAY_MS) continue;
    orphans.push(obj.path);
  }
  return orphans;
}
