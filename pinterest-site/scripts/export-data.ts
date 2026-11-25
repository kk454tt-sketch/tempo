/**
 * npm run export:data                 categories, products, product_links, store_settings
 * npm run export:data -- --with-events   also the (possibly large) events table
 *
 * Writes timestamped JSON files to ./backups (gitignore it). Use this as your
 * own backup if your Supabase plan has no automatic backups. Run it from a
 * trusted machine: the files contain your full catalogue and settings.
 */
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { loadEnv, requireEnv } from "./lib/env";

loadEnv();

const withEvents = process.argv.includes("--with-events");
const TABLES = ["categories", "products", "product_links", "store_settings", ...(withEvents ? ["events"] : [])];
const PAGE = 1000; // PostgREST default max rows per request
// Stable ordering is required for correct pagination; first column that exists wins.
const ORDER_CANDIDATES = ["id", "key", "created_at"];

const supabase = createClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function fetchAll(table: string): Promise<Record<string, unknown>[]> {
  for (const orderBy of [...ORDER_CANDIDATES, null]) {
    const rows: Record<string, unknown>[] = [];
    let failedOnOrder = false;
    for (let from = 0; ; from += PAGE) {
      let q = supabase.from(table).select("*").range(from, from + PAGE - 1);
      if (orderBy) q = q.order(orderBy, { ascending: true });
      const { data, error } = await q;
      if (error) {
        if (orderBy && /column .* does not exist|42703/i.test(`${error.code} ${error.message}`)) {
          failedOnOrder = true;
          break;
        }
        throw new Error(`${table}: ${error.message}`);
      }
      rows.push(...((data ?? []) as Record<string, unknown>[]));
      if (!data || data.length < PAGE) break;
      if (!orderBy) console.warn(`  ! ${table}: no sortable column found; pagination may be unstable`);
    }
    if (!failedOnOrder) return rows;
  }
  return [];
}

async function main() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = join(process.cwd(), "backups");
  mkdirSync(dir, { recursive: true });

  if (!existsSync(join(process.cwd(), ".gitignore")) || !/^\/?backups\/?$/m.test(readFileSync(join(process.cwd(), ".gitignore"), "utf8"))) {
    console.warn('WARNING: add "/backups" to .gitignore so exports are never committed.');
  }

  const counts: Record<string, number> = {};
  for (const table of TABLES) {
    const rows = await fetchAll(table);
    const file = join(dir, `${table}-${stamp}.json`);
    writeFileSync(file, JSON.stringify(rows, null, 2), { mode: 0o600 });
    chmodSync(file, 0o600);
    counts[table] = rows.length;
    console.log(`  ${table}: ${rows.length} rows -> ${file}`);
  }
  const manifest = join(dir, `manifest-${stamp}.json`);
  writeFileSync(manifest, JSON.stringify({ exportedAt: new Date().toISOString(), withEvents, counts }, null, 2), { mode: 0o600 });
  console.log(`Done. Manifest: ${manifest}`);
}

main().catch((e) => {
  console.error("Export failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
