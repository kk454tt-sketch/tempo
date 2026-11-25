/**
 * npm run check:rls            (add -- --strict to also fail on UNPROVEN checks)
 *
 * Proves, through the public API, what an outsider and a normal signed-in
 * (non-admin) user can and cannot do. Prints PASS / FAIL / UNPROVEN per check
 * and exits 1 if anything FAILS.
 *
 *   The clients UNDER TEST use only the anon key (first anonymous, then signed in
 *   as a normal non-admin user).
 *
 *   The SERVICE ROLE key (optional, local only) is used for setup/verification:
 *   creating disposable fixture rows and a throwaway non-admin user, discovering
 *   buckets and RPC functions, and confirming nothing was changed. Everything it
 *   creates is deleted at the end. Without it most checks degrade to UNPROVEN.
 *   Alternatively pass RLS_CHECK_USER_EMAIL / RLS_CHECK_USER_PASSWORD for an
 *   existing non-admin account.
 *
 * UNPROVEN means "no error was seen, but this test could not tell a blocked
 * write from a bad fixture". It usually means CONFIG below does not match your
 * column names. Fix CONFIG, don't ignore it.
 */
import { randomBytes } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { loadEnv, requireEnv } from "./lib/env";
import { fetchOpenApi, type OpenApiParam } from "./lib/openapi";

loadEnv();

// ===========================================================================
// CONFIG: adjust to your schema
// ===========================================================================
const PUBLISHED_COLUMN = "is_published"; // products.<column> = false means unpublished
const ZERO_UUID = "00000000-0000-0000-0000-000000000000";

/** Tables an outsider must neither read nor write. */
const HIDDEN_TABLES = ["events", "admins"];
/** Tables that anyone may read (published rows only) but nobody but admins may write. */
const READ_ONLY_TABLES = ["categories", "products", "product_links", "store_settings"];
/** RPCs the public site is allowed to call as anon (everything else must be refused). */
const RPC_ALLOWED_PUBLIC: string[] = [];
/** Used when the OpenAPI document is unavailable (no service role key). */
const RPC_FALLBACK = ["save_product", "analytics_summary"];

type Ctx = { userId?: string; productId?: string };
type TableCfg = {
  pk?: string;
  /** Builds a disposable row. Omit if one cannot be built generically. */
  make?: (tag: string, ctx: Ctx) => Record<string, unknown>;
  /** Column holding a tag-derived value, used to clean up if a write unexpectedly succeeds. */
  tagColumn?: string;
  /** A text column that make() fills, used for the update probe. */
  patchColumn?: string;
};
const TABLES: Record<string, TableCfg> = {
  categories: { make: (t) => ({ name: `rls-check ${t}`, slug: `rls-check-${t}` }), tagColumn: "slug", patchColumn: "name" },
  products: {
    make: (t) => ({ name: `rls-check ${t}`, slug: `rls-check-${t}`, [PUBLISHED_COLUMN]: false }),
    tagColumn: "slug",
    patchColumn: "name",
  },
  product_links: {
    make: (t, c) => ({
      product_id: c.productId ?? ZERO_UUID,
      country_code: "US",
      url: `https://www.amazon.com/dp/RLSCHECK?tag=${t}`,
      currency: "USD",
    }),
    tagColumn: "url",
    patchColumn: "url",
  },
  store_settings: {},
  events: {
    make: (_t, c) => ({
      type: "product_view",
      product_id: c.productId ?? ZERO_UUID,
      visitor_country: "US",
    }),
  },
  admins: { make: (_t, c) => ({ user_id: c.userId ?? ZERO_UUID }), tagColumn: "user_id" },
};
// ===========================================================================

type Status = "PASS" | "FAIL" | "UNPROVEN";
type Err = { code?: string; message?: string; statusCode?: string | number; status?: number } | null;
type Actor = { name: string; client: SupabaseClient; userId?: string };

const STRICT = process.argv.includes("--strict");
const SUPABASE_URL = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const ANON_KEY = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const opts = { auth: { persistSession: false, autoRefreshToken: false } } as const;

const service: SupabaseClient | null = SERVICE_KEY ? createClient(SUPABASE_URL, SERVICE_KEY, opts) : null;
const results: { status: Status; actor: string; check: string; detail: string }[] = [];

function record(status: Status, actor: string, check: string, detail = ""): void {
  results.push({ status, actor, check, detail });
  console.log(`${status.padEnd(8)} ${actor.padEnd(5)} ${check}${detail ? `  (${detail})` : ""}`);
}

const denied = (e: Err): boolean =>
  !!e && (e.code === "42501" || /row-level security|permission denied|not authorized|forbidden|unauthorized/i.test(e.message ?? ""));
const describe = (e: Err): string => (e ? `${e.code ?? e.statusCode ?? e.status ?? "?"}: ${e.message ?? ""}`.slice(0, 140) : "no error");
const pkOf = (t: string): string => TABLES[t]?.pk ?? "id";
const tagFor = () => randomBytes(4).toString("hex");

// 1x1 PNG, so bucket MIME/size restrictions cannot be the reason an upload fails
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");

// ---------------------------------------------------------------------------
// Fixtures (service role only)
// ---------------------------------------------------------------------------
type Fixtures = {
  rows: Partial<Record<string, Record<string, unknown>>>;
  productId?: string;
  cleanup(): Promise<void>;
};

async function makeFixtures(tag: string, ctx: Ctx): Promise<Fixtures> {
  const rows: Fixtures["rows"] = {};
  const created: { table: string; id: unknown }[] = [];
  const fx: Fixtures = {
    rows,
    async cleanup() {
      if (!service) return;
      for (const { table, id } of created.reverse()) await service.from(table).delete().eq(pkOf(table), id as string);
    },
  };
  if (!service) return fx;

  for (const table of ["categories", "products", "product_links"]) {
    const make = TABLES[table]?.make;
    if (!make) continue;
    const { data, error } = await service.from(table).insert(make(tag, { ...ctx, productId: fx.productId })).select().single();
    if (error || !data) {
      record("UNPROVEN", "setup", `fixture row in ${table}`, `${describe(error)}; adjust TABLES.${table}.make in CONFIG`);
      continue;
    }
    rows[table] = data as Record<string, unknown>;
    created.push({ table, id: (data as Record<string, unknown>)[pkOf(table)] });
    if (table === "products") fx.productId = String((data as Record<string, unknown>)[pkOf("products")]);
  }
  return fx;
}

async function serviceCount(table: string): Promise<number | null> {
  if (!service) return null;
  const { count, error } = await service.from(table).select("*", { count: "exact", head: true });
  return error ? null : count;
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------
async function hiddenTablesUnreadable(a: Actor, ensured: Record<string, number | null>) {
  for (const table of HIDDEN_TABLES) {
    const { data, error } = await a.client.from(table).select("*").limit(5);
    const check = `${table}: not readable`;
    if (error) {
      if (denied(error)) record("PASS", a.name, check, `refused ${error.code ?? ""}`);
      else record("UNPROVEN", a.name, check, describe(error));
    } else if ((data?.length ?? 0) > 0) record("FAIL", a.name, check, `returned ${data!.length} row(s)`);
    else if ((ensured[table] ?? 0) > 0) record("PASS", a.name, check, `0 visible of ${ensured[table]} existing`);
    else record("UNPROVEN", a.name, check, "0 rows returned but table is empty or the count is unknown");
  }
}

async function unpublishedInvisible(a: Actor, fx: Fixtures) {
  const bad = await a.client.from("products").select("id").eq(PUBLISHED_COLUMN, false).limit(5);
  if (bad.error) record(denied(bad.error) ? "PASS" : "UNPROVEN", a.name, "products: no unpublished rows visible", describe(bad.error));
  else if ((bad.data?.length ?? 0) > 0) record("FAIL", a.name, "products: no unpublished rows visible", `${bad.data!.length} unpublished row(s) returned`);
  else record("PASS", a.name, "products: no unpublished rows visible");

  const fxProduct = fx.rows["products"];
  const fxLink = fx.rows["product_links"];
  if (!fxProduct) {
    record("UNPROVEN", a.name, "unpublished fixture product hidden", "no fixture (needs service role key + valid CONFIG)");
    return;
  }
  const p = await a.client.from("products").select("*").eq(pkOf("products"), fxProduct[pkOf("products")] as string);
  record((p.data?.length ?? 0) > 0 ? "FAIL" : "PASS", a.name, "unpublished product by id is invisible", p.data?.length ? "ROW VISIBLE" : "");

  if (!fxLink) {
    record("UNPROVEN", a.name, "links of unpublished product hidden", "no link fixture");
    return;
  }
  const l = await a.client.from("product_links").select("*").eq("product_id", fx.productId as string);
  record((l.data?.length ?? 0) > 0 ? "FAIL" : "PASS", a.name, "links of unpublished product are invisible", l.data?.length ? "ROW VISIBLE" : "");
}

async function writesBlocked(a: Actor, fx: Fixtures, ctx: Ctx) {
  for (const table of [...READ_ONLY_TABLES, ...HIDDEN_TABLES]) {
    const cfg = TABLES[table] ?? {};
    const tag = tagFor();
    const row = cfg.make ? cfg.make(tag, { ...ctx, productId: fx.productId }) : {};

    // INSERT (no .select(): with return=minimal a successful insert is unambiguous)
    const ins = await a.client.from(table).insert(row);
    const insCheck = `${table}: insert refused`;
    if (!ins.error) {
      record("FAIL", a.name, insCheck, `INSERT SUCCEEDED${cfg.tagColumn && service ? " (cleaning up)" : "; delete the row manually"}`);
      if (service && cfg.tagColumn && row[cfg.tagColumn] !== undefined) await service.from(table).delete().eq(cfg.tagColumn, row[cfg.tagColumn] as string);
    } else if (denied(ins.error)) record("PASS", a.name, insCheck, `refused ${ins.error.code ?? ""}`);
    else record("UNPROVEN", a.name, insCheck, `${describe(ins.error)}; fixture columns may be wrong`);

    // UPDATE and DELETE need a disposable row; verified from the service role side.
    const fxRow = fx.rows[table];
    const pk = pkOf(table);
    if (!fxRow || !service) {
      if (READ_ONLY_TABLES.includes(table)) record("UNPROVEN", a.name, `${table}: update/delete refused`, "no disposable row available");
      continue;
    }
    const id = fxRow[pk] as string;

    if (cfg.patchColumn) {
      const before = fxRow[cfg.patchColumn];
      await a.client.from(table).update({ [cfg.patchColumn]: `rls-check-changed-${tag}` }).eq(pk, id);
      const after = await service.from(table).select("*").eq(pk, id).maybeSingle();
      const same = after.data && (after.data as Record<string, unknown>)[cfg.patchColumn] === before;
      record(same ? "PASS" : "FAIL", a.name, `${table}: update refused`, same ? "" : "ROW WAS MODIFIED");
    }

    await a.client.from(table).delete().eq(pk, id);
    const still = await service.from(table).select(pk).eq(pk, id).maybeSingle();
    record(still.data ? "PASS" : "FAIL", a.name, `${table}: delete refused`, still.data ? "" : "ROW WAS DELETED");
  }

  // store_settings has no generic disposable row; insert result above is all we can prove.
}

async function storageBlocked(a: Actor, buckets: string[]) {
  if (buckets.length === 0) {
    record("UNPROVEN", a.name, "storage: upload refused", "no buckets found (needs service role key or STORAGE_BUCKET)");
    return;
  }
  for (const bucket of buckets) {
    const path = `rls-check/${tagFor()}.png`;
    const { error } = await a.client.storage.from(bucket).upload(path, PNG, { contentType: "image/png" });
    const check = `storage '${bucket}': upload refused`;
    if (!error) {
      record("FAIL", a.name, check, "UPLOAD SUCCEEDED (cleaning up)");
      await (service ?? a.client).storage.from(bucket).remove([path]);
      continue;
    }
    const e = error as unknown as Err;
    if (denied(e) || String(e?.statusCode) === "403" || String(e?.statusCode) === "401") record("PASS", a.name, check, describe(e));
    else record("UNPROVEN", a.name, check, describe(e));
  }
}

function dummyArg(p: OpenApiParam): unknown {
  const f = (p.format ?? "").toLowerCase();
  if (p.type === "array" || f.endsWith("[]")) return [];
  if (f.includes("json") || p.type === "object") return {};
  if (f === "uuid") return ZERO_UUID;
  if (f.startsWith("timestamp")) return "1970-01-01T00:00:00Z"; // epoch: harmless even for date-cutoff deleters
  if (f === "date") return "1970-01-01";
  if (p.type === "integer" || p.type === "number") return 1;
  if (p.type === "boolean") return false;
  return "rls-check";
}

async function rpcsForbidden(a: Actor, rpcs: Record<string, OpenApiParam[]> | null) {
  const names = rpcs ? Object.keys(rpcs) : RPC_FALLBACK;
  if (rpcs) {
    for (const required of RPC_FALLBACK) {
      if (!(required in rpcs)) record("UNPROVEN", a.name, `rpc ${required}: exists`, "not in the API schema (fine if it is not exposed)");
    }
  }
  for (const name of names) {
    if (RPC_ALLOWED_PUBLIC.includes(name)) continue;
    const params = rpcs?.[name] ?? [];
    const args = Object.fromEntries(params.filter((p) => p.required).map((p) => [p.name, dummyArg(p)]));
    const { error } = await a.client.rpc(name, args);
    const check = `rpc ${name}(): forbidden`;
    if (!error) {
      record("FAIL", a.name, check, "CALL SUCCEEDED (revoke EXECUTE from anon/authenticated or add an admin check)");
    } else if (error.code === "42501" || (error.code === "P0001" && /auth|admin|forbidden|denied|permission|not allowed/i.test(error.message))) {
      record("PASS", a.name, check, describe(error));
    } else {
      record("UNPROVEN", a.name, check, `${describe(error)}; not clearly an authorization error`);
    }
  }
}

// ---------------------------------------------------------------------------
async function main() {
  const anon = createClient(SUPABASE_URL, ANON_KEY, opts);
  const cleanups: (() => Promise<void>)[] = [];

  try {
    // Discovery (service role)
    let rpcs: Record<string, OpenApiParam[]> | null = null;
    let buckets: string[] = process.env.STORAGE_BUCKET ? [process.env.STORAGE_BUCKET] : [];
    if (service && SERVICE_KEY) {
      try {
        rpcs = (await fetchOpenApi(SUPABASE_URL, SERVICE_KEY)).rpcs;
      } catch (e) {
        record("UNPROVEN", "setup", "rpc discovery", e instanceof Error ? e.message : String(e));
      }
      const b = await service.storage.listBuckets();
      if (!b.error) buckets = b.data.map((x) => x.name);
    }

    // Make sure hidden tables have something to hide, so "0 rows" proves something.
    const existing: Record<string, number | null> = {};
    for (const table of HIDDEN_TABLES) {
      let n = await serviceCount(table);
      const make = TABLES[table]?.make;
      if (n === 0 && service && make && table !== "admins") {
        const { data } = await service.from(table).insert(make("seed", {})).select().single();
        if (data) {
          const id = (data as Record<string, unknown>)[pkOf(table)];
          cleanups.push(async () => void (await service.from(table).delete().eq(pkOf(table), id as string)));
          n = 1;
        }
      }
      existing[table] = n;
    }

    // Actor 1: anonymous
    const actors: Actor[] = [{ name: "anon", client: anon }];

    // Actor 2: a normal, non-admin, signed-in user
    const email = process.env.RLS_CHECK_USER_EMAIL;
    const password = process.env.RLS_CHECK_USER_PASSWORD;
    const userClient = createClient(SUPABASE_URL, ANON_KEY, opts);
    let userId: string | undefined;
    if (email && password) {
      const { data, error } = await userClient.auth.signInWithPassword({ email, password });
      if (error) record("UNPROVEN", "setup", "sign in as non-admin user", error.message);
      else userId = data.user?.id;
    } else if (service) {
      const tmpEmail = `rls-check-${tagFor()}@affhub.invalid`;
      const tmpPassword = randomBytes(18).toString("base64url");
      const created = await service.auth.admin.createUser({ email: tmpEmail, password: tmpPassword, email_confirm: true });
      if (created.error || !created.data.user) record("UNPROVEN", "setup", "create throwaway non-admin user", created.error?.message ?? "unknown error");
      else {
        const uid = created.data.user.id;
        cleanups.push(async () => void (await service.auth.admin.deleteUser(uid)));
        const signedIn = await userClient.auth.signInWithPassword({ email: tmpEmail, password: tmpPassword });
        if (signedIn.error) record("UNPROVEN", "setup", "sign in as throwaway user", signedIn.error.message);
        else userId = uid;
      }
    } else {
      record("UNPROVEN", "setup", "non-admin user phase", "set SUPABASE_SERVICE_ROLE_KEY (throwaway user) or RLS_CHECK_USER_EMAIL/PASSWORD");
    }
    if (userId) actors.push({ name: "user", client: userClient, userId });

    for (const actor of actors) {
      console.log(`\n--- ${actor.name === "anon" ? "Anonymous (anon key)" : "Signed-in non-admin user (anon key + session)"} ---`);
      const ctx: Ctx = { userId: actor.userId };
      const fx = await makeFixtures(`${actor.name}-${tagFor()}`, ctx);
      try {
        await hiddenTablesUnreadable(actor, existing);
        await unpublishedInvisible(actor, fx);
        await writesBlocked(actor, fx, ctx);
        await storageBlocked(actor, buckets);
        await rpcsForbidden(actor, rpcs);
      } finally {
        await fx.cleanup();
      }
    }
  } finally {
    for (const fn of cleanups.reverse()) await fn().catch(() => undefined);
  }

  const fails = results.filter((r) => r.status === "FAIL");
  const unproven = results.filter((r) => r.status === "UNPROVEN");
  console.log(`\n${results.filter((r) => r.status === "PASS").length} passed, ${fails.length} failed, ${unproven.length} unproven`);
  if (unproven.length) console.log(`Unproven checks${STRICT ? " (fatal with --strict)" : ""}:\n` + unproven.map((r) => `  - ${r.actor}: ${r.check}: ${r.detail}`).join("\n"));
  if (fails.length || (STRICT && unproven.length)) {
    console.error("\nRESULT: FAIL");
    process.exit(1);
  }
  console.log("\nRESULT: PASS");
}

main().catch((e) => {
  console.error("check:rls crashed:", e instanceof Error ? e.message : e);
  console.error("RESULT: FAIL");
  process.exit(1);
});
