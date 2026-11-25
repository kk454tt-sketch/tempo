/**
 * npm run verify:db
 * Checks the live database against the AffHub definition (0001_init.sql).
 * Role checks run inside transactions that are always rolled back, so nothing is written.
 */
import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { loadEnv, requireEnv } from "./load-env";

type Tx = postgres.TransactionSql;
type Role = "anon" | "authenticated";

const TABLES = ["admins", "categories", "products", "product_links", "store_settings", "events"] as const;

const POLICIES: readonly { schema: string; table: string; name: string }[] = [
  { schema: "public", table: "admins", name: "admins_self_read" },
  { schema: "public", table: "categories", name: "categories_public_read" },
  { schema: "public", table: "categories", name: "categories_admin_all" },
  { schema: "public", table: "products", name: "products_public_read" },
  { schema: "public", table: "products", name: "products_admin_all" },
  { schema: "public", table: "product_links", name: "links_public_read" },
  { schema: "public", table: "product_links", name: "links_admin_all" },
  { schema: "public", table: "store_settings", name: "settings_public_read" },
  { schema: "public", table: "store_settings", name: "settings_admin_all" },
  { schema: "public", table: "events", name: "events_admin_read" },
  { schema: "storage", table: "objects", name: "product images public read" },
  { schema: "storage", table: "objects", name: "product images admin insert" },
  { schema: "storage", table: "objects", name: "product images admin update" },
  { schema: "storage", table: "objects", name: "product images admin delete" },
];

const PERMISSION_DENIED = "42501";

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------
let failures = 0;
let total = 0;

function report(name: string, problem: string | null): void {
  total += 1;
  if (problem === null) {
    console.log(`PASS  ${name}`);
  } else {
    failures += 1;
    console.log(`FAIL  ${name}${problem ? `  (${problem})` : ""}`);
  }
}

/** The check returns null when it passes, or a short reason when it fails. */
async function check(name: string, run: () => Promise<string | null>): Promise<void> {
  try {
    report(name, await run());
  } catch (error) {
    report(name, errorMessage(error));
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function errorCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    return String((error as { code: unknown }).code);
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Rolled-back role simulation
// ---------------------------------------------------------------------------
class Rollback extends Error {}

async function inRolledBackTx<T>(sql: postgres.Sql, run: (tx: Tx) => Promise<T>): Promise<T> {
  let result: T | undefined;
  try {
    await sql.begin(async (tx) => {
      result = await run(tx);
      throw new Rollback();
    });
  } catch (error) {
    if (!(error instanceof Rollback)) throw error;
  }
  return result as T;
}

/** Same effect as a PostgREST request: switch role and set the JWT claims for auth.uid(). */
async function actAs(tx: Tx, role: Role, userId?: string): Promise<void> {
  const claims = JSON.stringify(userId ? { sub: userId, role } : { role });
  await tx`select
    set_config('request.jwt.claims', ${claims}, true),
    set_config('request.jwt.claim.sub', ${userId ?? ""}, true),
    set_config('request.jwt.claim.role', ${role}, true)`;
  await tx.unsafe(`set local role ${role}`);
}

/** Runs one statement as a role. Returns null if it succeeded, or the error it raised. */
async function attempt(
  sql: postgres.Sql,
  role: Role,
  userId: string | undefined,
  statement: (tx: Tx) => Promise<unknown>,
): Promise<{ code: string | undefined; message: string } | null> {
  return inRolledBackTx(sql, async (tx) => {
    await actAs(tx, role, userId);
    try {
      await statement(tx);
      return null;
    } catch (error) {
      return { code: errorCode(error), message: errorMessage(error) };
    }
  });
}

async function expectDenied(
  sql: postgres.Sql,
  role: Role,
  userId: string | undefined,
  statement: (tx: Tx) => Promise<unknown>,
): Promise<string | null> {
  const outcome = await attempt(sql, role, userId, statement);
  if (outcome === null) return "the statement succeeded but should have been denied";
  if (outcome.code !== PERMISSION_DENIED) {
    return `expected error ${PERMISSION_DENIED}, got ${outcome.code ?? "unknown"}: ${outcome.message}`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  loadEnv();
  const url = requireEnv("SUPABASE_DB_URL");
  const local = /(localhost|127\.0\.0\.1)/.test(url);
  const sql = postgres(url, { max: 1, prepare: false, ssl: local ? false : "require", onnotice: () => {} });

  try {
    await sql`select 1`;
  } catch (error) {
    console.error(`FAIL  connect to SUPABASE_DB_URL  (${errorMessage(error)})`);
    process.exit(1);
  }

  // 1) RLS enabled on all 6 tables
  const rls = await sql<{ relname: string; relrowsecurity: boolean }[]>`
    select c.relname, c.relrowsecurity
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname in ${sql([...TABLES])}`;
  for (const table of TABLES) {
    await check(`RLS enabled on public.${table}`, async () => {
      const row = rls.find((entry) => entry.relname === table);
      if (!row) return "table not found";
      return row.relrowsecurity ? null : "row level security is off";
    });
  }

  // 2) Every policy exists
  const policies = await sql<{ schemaname: string; tablename: string; policyname: string }[]>`
    select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public' or (schemaname = 'storage' and tablename = 'objects')`;
  for (const policy of POLICIES) {
    await check(`policy "${policy.name}" on ${policy.schema}.${policy.table}`, async () =>
      policies.some(
        (entry) =>
          entry.schemaname === policy.schema &&
          entry.tablename === policy.table &&
          entry.policyname === policy.name,
      )
        ? null
        : "missing",
    );
  }

  // 3) Storage bucket
  await check("bucket product-images exists, is public, 5MB limit, png/jpeg/webp only", async () => {
    const rows = await sql<{ public: boolean; file_size_limit: string | null; allowed_mime_types: string[] | null }[]>`
      select public, file_size_limit, allowed_mime_types from storage.buckets where id = 'product-images'`;
    const bucket = rows[0];
    if (!bucket) return "bucket not found";
    if (!bucket.public) return "bucket is not public";
    if (Number(bucket.file_size_limit) !== 5242880) return `file_size_limit is ${bucket.file_size_limit}`;
    const types = [...(bucket.allowed_mime_types ?? [])].sort().join(",");
    if (types !== "image/jpeg,image/png,image/webp") return `allowed_mime_types is ${types || "empty"}`;
    return null;
  });

  // 4) Role checks (all rolled back)
  const stranger = randomUUID();

  await check("anon cannot select from events", () =>
    expectDenied(sql, "anon", undefined, (tx) => tx`select count(*) from public.events`),
  );
  await check("anon cannot select from admins", () =>
    expectDenied(sql, "anon", undefined, (tx) => tx`select count(*) from public.admins`),
  );
  await check("non-admin cannot insert into products", () =>
    expectDenied(sql, "authenticated", stranger, (tx) =>
      tx`insert into public.products (name, slug) values ('verify probe', 'verify-probe')`,
    ),
  );
  await check("non-admin cannot insert into categories", () =>
    expectDenied(sql, "authenticated", stranger, (tx) =>
      tx`insert into public.categories (name, slug) values ('verify probe', 'verify-probe')`,
    ),
  );
  await check("non-admin cannot insert into events (server-side service role only)", () =>
    expectDenied(sql, "authenticated", stranger, (tx) =>
      tx`insert into public.events (type, product_id) values ('click', gen_random_uuid())`,
    ),
  );

  await check("is_admin() is false for an unknown uid", async () => {
    const value = await inRolledBackTx(sql, async (tx) => {
      await actAs(tx, "authenticated", stranger);
      const rows = await tx<{ admin: boolean }[]>`select public.is_admin() as admin`;
      return rows[0]?.admin;
    });
    return value === false ? null : `returned ${String(value)}`;
  });
  await check("is_admin() is false for anon", async () => {
    const value = await inRolledBackTx(sql, async (tx) => {
      await actAs(tx, "anon");
      const rows = await tx<{ admin: boolean }[]>`select public.is_admin() as admin`;
      return rows[0]?.admin;
    });
    return value === false ? null : `returned ${String(value)}`;
  });

  // 5) Public read rules, using temporary rows that are rolled back
  await check("anon sees only published products and their links", async () => {
    const seen = await inRolledBackTx(sql, async (tx) => {
      const products = await tx<{ id: string; slug: string }[]>`
        insert into public.products (name, slug, is_published)
        values ('verify published', 'verify-published-probe', true),
               ('verify draft', 'verify-draft-probe', false)
        returning id, slug`;
      for (const product of products) {
        await tx`insert into public.product_links (product_id, country_code, url, currency)
                 values (${product.id}, 'US', 'https://example.com/probe', 'USD')`;
      }
      await actAs(tx, "anon");
      const visibleProducts = await tx<{ slug: string }[]>`
        select slug from public.products where slug like 'verify-%-probe' order by slug`;
      const visibleLinks = await tx<{ n: string }[]>`
        select count(*)::text as n from public.product_links where url = 'https://example.com/probe'`;
      return { slugs: visibleProducts.map((row) => row.slug), links: Number(visibleLinks[0]?.n ?? "0") };
    });
    if (seen.slugs.length !== 1 || seen.slugs[0] !== "verify-published-probe") {
      return `products visible: ${seen.slugs.join(", ") || "none"}`;
    }
    return seen.links === 1 ? null : `${seen.links} links visible, expected 1`;
  });

  // 6) The only seed data: four store_settings rows
  await check("store_settings has exactly US, IN, BR, MX", async () => {
    const rows = await sql<{ country_code: string }[]>`select country_code from public.store_settings order by 1`;
    const codes = rows.map((row) => row.country_code).join(",");
    return codes === "BR,IN,MX,US" ? null : `found ${codes || "no rows"}`;
  });

  await sql.end({ timeout: 5 });

  console.log("");
  console.log(failures === 0 ? `PASS  all ${total} checks passed` : `FAIL  ${failures} of ${total} checks failed`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(`FAIL  ${errorMessage(error)}`);
  process.exit(1);
});
