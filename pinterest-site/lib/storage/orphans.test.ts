import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { findOrphans, type OrphanFinderClient } from "./orphans";

const SUPABASE_BASE = "https://example-project.supabase.co";
const BUCKET_URL = `${SUPABASE_BASE}/storage/v1/object/public/product-images`;

describe("findOrphans", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_BASE;
  });

  it("keeps referenced files, their -sm thumbnails and young files, returning only old orphans", async () => {
    const now = Date.parse("2026-11-25T12:00:00Z");
    const oldTs = "2026-11-20T12:00:00Z";
    const youngTs = "2026-11-25T10:00:00Z";

    const mockClient: OrphanFinderClient = {
      async listProducts() {
        return [
          {
            image_url: `${BUCKET_URL}/products/p1/main.webp`,
            gallery_urls: [`${BUCKET_URL}/products/p1/gal1.webp`],
          },
        ];
      },
      async listObjects(prefix) {
        if (prefix === "") {
          return [{ name: "products", id: null }];
        }
        if (prefix === "products") {
          return [{ name: "p1", id: null }];
        }
        if (prefix === "products/p1") {
          return [
            { name: "main.webp", id: "1", created_at: oldTs },
            { name: "main-sm.webp", id: "2", created_at: oldTs },
            { name: "gal1.webp", id: "3", created_at: oldTs },
            { name: "gal1-sm.webp", id: "4", created_at: oldTs },
            { name: "fresh-draft.webp", id: "5", created_at: youngTs },
            { name: "stale-orphan.webp", id: "6", created_at: oldTs },
            { name: "stale-orphan-sm.webp", id: "7", created_at: oldTs },
          ];
        }
        return [];
      },
    };

    const orphans = await findOrphans(mockClient, now);
    expect(orphans).toEqual(["products/p1/stale-orphan.webp", "products/p1/stale-orphan-sm.webp"]);
  });
});
