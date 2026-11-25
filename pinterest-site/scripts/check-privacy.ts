/**
 * npm run check:privacy
 * Compares the live public.events columns with EVENT_FIELDS in
 * lib/privacy/inventory.ts so the privacy page always lists every stored field.
 * Needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (read-only OpenAPI call).
 */
import { EVENT_FIELDS } from "../lib/privacy/inventory";
import { loadEnv, requireEnv } from "./lib/env";
import { fetchOpenApi } from "./lib/openapi";

loadEnv();

async function main() {
  const doc = await fetchOpenApi(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"));
  const live = doc.tables["events"];
  if (!live) {
    console.error("FAIL: table 'events' not found in the API schema.");
    process.exit(1);
  }
  const documented = EVENT_FIELDS.map((f) => f.column);
  const undocumented = live.filter((c) => !documented.includes(c));
  const missing = documented.filter((c) => !live.includes(c));

  if (undocumented.length || missing.length) {
    if (undocumented.length) console.error(`Stored but NOT on the privacy page: ${undocumented.join(", ")}`);
    if (missing.length) console.error(`On the privacy page but not in the table: ${missing.join(", ")}`);
    console.error("FAIL: update lib/privacy/inventory.ts (EVENT_FIELDS) to match public.events.");
    process.exit(1);
  }
  console.log(`PASS: privacy page lists all ${live.length} event columns (${live.join(", ")}).`);
}

main().catch((e) => {
  console.error("check:privacy failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
