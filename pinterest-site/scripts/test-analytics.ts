/**
 * npm run test:analytics
 *
 * Runs against SUPABASE_DB_URL inside ONE transaction that is ALWAYS rolled back.
 * Tests the canonical 0002_analytics.sql functions (named args: days, tz, p_product, lim, product_id)
 * and the product_click_counts view. Nothing remains in the database.
 */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { loadEnv, requireEnv } from "./load-env";

loadEnv();
const DB_URL = requireEnv("SUPABASE_DB_URL");
const TZ = process.env.ANALYTICS_TZ || "Asia/Kolkata";
const TAG = randomUUID().slice(0, 8);
const isLocalDb = /(localhost|127\.0\.0\.1)/.test(DB_URL);
const sql = postgres(DB_URL, { max: 1, prepare: false, ssl: isLocalDb ? false : "require", onnotice: () => {} });

type Tx = postgres.TransactionSql;
type Row = Record<string, unknown>;
class Rollback extends Error {}

async function rows(tx: Tx, text: string, params: unknown[] = []): Promise<Row[]> {
  const result = await tx.unsafe(text, params as never[]);
  return result.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([k, v]) => [k, typeof v === "string" && /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v]),
    ),
  );
}

async function actAs(tx: Tx, role: "authenticated" | "anon", userId?: string) {
  await tx.unsafe("reset role");
  await tx.unsafe(`set local role ${role}`);
  const claims = JSON.stringify(userId ? { sub: userId, role } : { role });
  await tx.unsafe(`select set_config('request.jwt.claims', $1, true)`, [claims] as never[]);
}
const asSuperuser = (tx: Tx) => tx.unsafe("reset role");

async function expectError(tx: Tx, label: string, text: string, code: string) {
  let error: unknown;
  try {
    await tx.savepoint((sp) => sp.unsafe(text));
  } catch (e) {
    error = e;
  }
  assert.ok(error, `${label}: expected an error but the call succeeded`);
  const { code: got, message } = error as { code?: string; message?: string };
  assert.equal(got, code, `${label}: expected SQLSTATE ${code}, got ${got} (${message})`);
}

let passed = 0;
async function step(label: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    passed++;
    console.log(`  ok  ${label}`);
  } catch (error) {
    console.log(`  FAIL ${label}`);
    throw error;
  }
}

const dayText = async (tx: Tx, daysAgo: number) =>
  (await rows(tx, `select ((now() at time zone $1)::date - $2::int)::text as d`, [TZ, daysAgo]))[0].d as string;

const pick = (list: Row[], keys: string[]) => list.map((r) => Object.fromEntries(keys.map((k) => [k, r[k]])));

interface Ev {
  type: "click" | "product_view";
  product: string;
  country: string;
  source: string | null;
  device: "mobile" | "desktop";
  daysAgo: number;
  campaign?: string | null;
}

async function main(tx: Tx) {
  const adminId = randomUUID();
  const userId = randomUUID();
  const [A, B, C, D, E] = [randomUUID(), randomUUID(), randomUUID(), randomUUID(), randomUUID()];
  const emailBase = `analytics-test-${TAG}`;

  await asSuperuser(tx);
  await tx.unsafe(
    `insert into auth.users (id, aud, role, email) values ($1, 'authenticated', 'authenticated', $2), ($3, 'authenticated', 'authenticated', $4)`,
    [adminId, `${emailBase}-admin@example.invalid`, userId, `${emailBase}-user@example.invalid`] as never[],
  );
  await tx.unsafe(`insert into public.admins (user_id) values ($1)`, [adminId] as never[]);
  await tx.unsafe(`delete from public.events`);

  console.log("\nEmpty database (as admin)");
  await actAs(tx, "authenticated", adminId);
  const baselineOos = (
    await rows(tx, `select * from public.analytics_summary(days => 7, tz => $1)`, [TZ])
  )[0].out_of_stock_products as number;

  await step("summary is all zero, top_country is null", async () => {
    const [s] = await rows(tx, `select * from public.analytics_summary(days => 7, tz => $1)`, [TZ]);
    assert.deepEqual(s, { total_clicks: 0, total_views: 0, top_country: null, out_of_stock_products: baselineOos });
  });

  await step("clicks_over_time fills zero days (7 and 30)", async () => {
    for (const days of [7, 30]) {
      const r = await rows(tx, `select day::text as day, clicks, views from public.clicks_over_time(days => $1, tz => $2)`, [
        days,
        TZ,
      ]);
      assert.equal(r.length, days);
      assert.ok(r.every((x) => x.clicks === 0 && x.views === 0));
    }
  });

  await step("sources and devices return default buckets on empty DB", async () => {
    const sources = await rows(tx, `select * from public.analytics_sources(days => 7, tz => $1)`, [TZ]);
    assert.deepEqual(pick(sources, ["source_label", "clicks", "views"]), [
      { source_label: "Pinterest", clicks: 0, views: 0 },
      { source_label: "Direct", clicks: 0, views: 0 },
      { source_label: "Other", clicks: 0, views: 0 },
    ]);
    const devices = await rows(tx, `select * from public.analytics_devices(days => 7, tz => $1)`, [TZ]);
    assert.deepEqual(pick(devices, ["device", "clicks", "views"]), [
      { device: "mobile", clicks: 0, views: 0 },
      { device: "desktop", clicks: 0, views: 0 },
    ]);
  });

  await asSuperuser(tx);
  const products: [string, string, boolean][] = [
    [A, "zz-test-A", true],
    [B, "zz-test-B", true],
    [C, "zz-test-C", true],
    [D, "zz-test-D", true],
    [E, "zz-test-E", false],
  ];
  for (const [id, name, published] of products) {
    await tx.unsafe(`insert into public.products (id, name, slug, is_published) values ($1, $2, $3, $4)`, [
      id,
      name,
      `${name.toLowerCase()}-${TAG}`,
      published,
    ] as never[]);
  }
  const links: [string, string, boolean][] = [
    [A, "US", true],
    [A, "IN", false],
    [A, "BR", true], // partly
    [B, "US", false], // out_of_stock
    [C, "US", true],
    [C, "MX", true], // in_stock
    [E, "US", false], // unpublished
  ];
  for (const [id, code, inStock] of links) {
    await tx.unsafe(
      `insert into public.product_links (product_id, country_code, url, price, currency, in_stock)
       values ($1, $2, 'https://amazon.com/dp/test', 10, 'USD', $3)`,
      [id, code, inStock] as never[],
    );
  }

  const ev = (
    type: Ev["type"],
    product: string,
    country: string,
    source: string | null,
    device: Ev["device"],
    daysAgo: number,
  ): Ev => ({ type, product, country, source, device, daysAgo });

  const events: Ev[] = [
    ev("click", A, "IN", "pinterest", "mobile", 0),
    ev("click", A, "IN", "Pinterest", "mobile", 0),
    ev("product_view", A, "IN", "pinterest", "mobile", 0),
    ev("product_view", A, "IN", "pinterest", "mobile", 0),
    ev("click", B, "US", "direct", "desktop", 0),
    ev("product_view", B, "US", "", "desktop", 0),
    ev("product_view", C, "MX", "PINTEREST", "mobile", 0),
    ev("click", D, "", null, "desktop", 0),
    ev("click", A, "US", null, "desktop", 1),
    ev("product_view", A, "US", "newsletter", "desktop", 1),
    ev("product_view", A, "DE", "pin.it", "mobile", 2),
    ev("product_view", A, "US", "pinterest", "mobile", 9),
    ev("click", A, "US", "pinterest", "mobile", 10),
    ev("click", A, "US", "", "desktop", 100),
  ];

  for (const e of events) {
    await tx.unsafe(
      `insert into public.events (type, product_id, visitor_country, store_country, source, campaign, content, device, created_at)
       values ($1, $2, $3, 'US', $4, $5, $6, $7, now() - ($8::int * interval '1 day'))`,
      [e.type, e.product, e.country, e.source, `test-${TAG}`, e.source === "pinterest" ? "pin-a" : null, e.device, e.daysAgo] as never[],
    );
  }

  await actAs(tx, "authenticated", adminId);
  console.log("\nWith data (as admin)");

  await step("summary and zero-day filling", async () => {
    const [s] = await rows(tx, `select * from public.analytics_summary(days => 7, tz => $1)`, [TZ]);
    assert.equal(s.total_clicks, 5);
    assert.equal(s.total_views, 6);
    assert.equal(s.top_country, "IN");
    assert.equal(s.out_of_stock_products, baselineOos + 2);

    const series = await rows(tx, `select day::text as day, clicks, views from public.clicks_over_time(days => 7, tz => $1)`, [TZ]);
    assert.equal(series.length, 7);
    const expected = new Map<number, [number, number]>([[0, [4, 4]], [1, [1, 1]], [2, [0, 1]]]);
    for (let i = 0; i < 7; i++) {
      const daysAgo = 6 - i;
      const [clicks, views] = expected.get(daysAgo) ?? [0, 0];
      assert.deepEqual(series[i], { day: await dayText(tx, daysAgo), clicks, views }, `day -${daysAgo}`);
    }
  });

  await step("p_product filter narrows summary, series, countries, sources, devices", async () => {
    const [sB] = await rows(tx, `select * from public.analytics_summary(days => 7, tz => $1, p_product => $2)`, [TZ, B]);
    assert.equal(sB.total_clicks, 1);
    assert.equal(sB.total_views, 1);
    assert.equal(sB.top_country, "US");

    const cB = await rows(tx, `select * from public.clicks_by_country(days => 7, tz => $1, p_product => $2)`, [TZ, B]);
    assert.deepEqual(pick(cB, ["visitor_country", "clicks"]), [{ visitor_country: "US", clicks: 1 }]);

    const srcB = await rows(tx, `select * from public.analytics_sources(days => 7, tz => $1, p_product => $2)`, [TZ, B]);
    assert.deepEqual(pick(srcB, ["source_label", "clicks", "views"]), [
      { source_label: "Pinterest", clicks: 0, views: 0 },
      { source_label: "Direct", clicks: 1, views: 1 },
      { source_label: "Other", clicks: 0, views: 0 },
    ]);

    const devB = await rows(tx, `select * from public.analytics_devices(days => 7, tz => $1, p_product => $2)`, [TZ, B]);
    assert.deepEqual(pick(devB, ["device", "clicks", "views"]), [
      { device: "mobile", clicks: 0, views: 0 },
      { device: "desktop", clicks: 1, views: 1 },
    ]);
  });

  await step("top_products returns all stock_status values", async () => {
    const r = await rows(tx, `select * from public.top_products(days => 7, lim => 10, tz => $1)`, [TZ]);
    assert.deepEqual(pick(r, ["name", "clicks", "views", "top_country", "stock_status"]), [
      { name: "zz-test-A", clicks: 3, views: 4, top_country: "IN", stock_status: "partly" },
      { name: "zz-test-B", clicks: 1, views: 1, top_country: "US", stock_status: "out_of_stock" },
      { name: "zz-test-D", clicks: 1, views: 0, top_country: null, stock_status: "no_links" },
      { name: "zz-test-C", clicks: 0, views: 1, top_country: "MX", stock_status: "in_stock" },
    ]);
  });

  await step("product_analytics returns link_store, has_link, in_stock and OTHER", async () => {
    const r = await rows(tx, `select * from public.product_analytics(product_id => $1, days => 7, tz => $2)`, [A, TZ]);
    assert.deepEqual(pick(r, ["visitor_country", "views", "clicks", "link_store", "has_link", "in_stock"]), [
      { visitor_country: "US", views: 1, clicks: 1, link_store: "US", has_link: true, in_stock: true },
      { visitor_country: "IN", views: 2, clicks: 2, link_store: "IN", has_link: true, in_stock: false },
      { visitor_country: "BR", views: 0, clicks: 0, link_store: "BR", has_link: true, in_stock: true },
      { visitor_country: "MX", views: 0, clicks: 0, link_store: null, has_link: false, in_stock: null },
      { visitor_country: "ID", views: 0, clicks: 0, link_store: "US", has_link: true, in_stock: true },
      { visitor_country: "OTHER", views: 1, clicks: 0, link_store: "US", has_link: true, in_stock: true },
    ]);
  });

  await step("product_click_counts view returns all-time counts", async () => {
    const r = await rows(
      tx,
      `select p.name, c.clicks, c.views, c.last_click_at is not null as has_click
       from public.product_click_counts c join public.products p on p.id = c.product_id order by p.name`,
    );
    assert.deepEqual(r, [
      { name: "zz-test-A", clicks: 5, views: 5, has_click: true },
      { name: "zz-test-B", clicks: 1, views: 1, has_click: true },
      { name: "zz-test-C", clicks: 0, views: 1, has_click: false },
      { name: "zz-test-D", clicks: 1, views: 0, has_click: true },
    ]);
  });

  await step("analytics_campaigns and analytics_campaign_countries", async () => {
    const camp = await rows(tx, `select * from public.analytics_campaigns(days => 7, tz => $1)`, [TZ]);
    assert.ok(camp.length >= 1);
    assert.equal(camp[0].campaign, `test-${TAG}`);

    const campCountries = await rows(
      tx,
      `select * from public.analytics_campaign_countries(p_campaign => $1, days => 7, tz => $2)`,
      [`test-${TAG}`, TZ],
    );
    assert.ok(campCountries.some((row) => row.country === "IN" && row.clicks === 2));
  });

  const calls: [string, string][] = [
    ["analytics_summary", `select * from public.analytics_summary(days => 7, tz => '${TZ}')`],
    ["clicks_over_time", `select * from public.clicks_over_time(days => 7, tz => '${TZ}')`],
    ["clicks_by_country", `select * from public.clicks_by_country(days => 7, tz => '${TZ}')`],
    ["top_products", `select * from public.top_products(days => 7, lim => 10, tz => '${TZ}')`],
    ["analytics_sources", `select * from public.analytics_sources(days => 7, tz => '${TZ}')`],
    ["analytics_devices", `select * from public.analytics_devices(days => 7, tz => '${TZ}')`],
    ["product_analytics", `select * from public.product_analytics(product_id => '${A}', days => 7, tz => '${TZ}')`],
    ["analytics_campaigns", `select * from public.analytics_campaigns(days => 7, tz => '${TZ}')`],
    ["analytics_campaign_countries", `select * from public.analytics_campaign_countries(p_campaign => 'test', days => 7, tz => '${TZ}')`],
  ];

  console.log("\nNon-admin & anon checks");
  await actAs(tx, "authenticated", userId);
  await step("non-admin gets 42501 on every analytics RPC", async () => {
    for (const [name, q] of calls) await expectError(tx, name, q, "42501");
  });

  await actAs(tx, "anon");
  await step("anon gets 42501 on every analytics RPC and view", async () => {
    for (const [name, q] of calls) await expectError(tx, name, q, "42501");
    await expectError(tx, "product_click_counts", `select * from public.product_click_counts`, "42501");
  });

  await asSuperuser(tx);
  throw new Rollback();
}

async function counts() {
  const [r] = await sql`
    select (select count(*) from public.events)::int as events,
           (select count(*) from public.products)::int as products,
           (select count(*) from public.product_links)::int as links,
           (select count(*) from public.admins)::int as admins,
           (select count(*) from auth.users)::int as users`;
  return r;
}

async function run(): Promise<void> {
  let failure: unknown;
  try {
    const before = await counts();
    console.log("Analytics tests (single rolled-back transaction)");
    try {
      await sql.begin(main);
    } catch (error) {
      if (!(error instanceof Rollback)) failure = error;
    }
    const after = await counts();
    assert.deepEqual(after, before, "row counts changed: rollback did not restore database");
    console.log("  ok  nothing remains in the database");
    passed++;
  } catch (error) {
    failure ??= error;
  } finally {
    await sql.end({ timeout: 5 });
  }

  if (failure) {
    console.error("\nFAILED:", failure instanceof Error ? failure.message : failure);
    process.exit(1);
  }
  console.log(`\nAll ${passed} checks passed.`);
}

void run();
