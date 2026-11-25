# AffHub

A curated list of Amazon products designed for Pinterest traffic. Visitors see each product with the link, price and stock status of **their own country's** Amazon store (US, India, Brazil, Mexico; Indonesia and every other country are sent to Amazon US). An admin panel manages products, images, Pinterest pin links, and traffic analytics.

Next.js 15 (App Router, TypeScript), React 19, Tailwind CSS, Sharp, Supabase (Postgres, Auth, Storage), deployed on Vercel.

## Set it up (3 steps)

1. **Create a Supabase project** at supabase.com.
2. **Create `.env.local`**: copy `.env.example` and fill in the Supabase values (project URL, anon key, service role key, database connection string) plus `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `RATE_LIMIT_SALT`, and `CRON_SECRET`.
3. **Run**:

```bash
npm install
npm run setup
npm run dev
```

`npm run setup` applies migrations `0001`–`0006`, creates the `product-images` bucket, and creates your admin user. Open `http://localhost:3000/admin/login` and sign in with `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

## Deploy to Vercel

1. **Import the repo** in Vercel (set Root Directory to `pinterest-site` if deploying from the monorepo).
2. **Set every variable from `.env.example`** in Project → Settings → Environment Variables, including `RATE_LIMIT_SALT`, `CRON_SECRET`, `EVENT_RETENTION_DAYS`, `CSP_MODE`, and optionally `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `NEXT_PUBLIC_PINTEREST_VERIFY`, `SENTRY_DSN`. `SUPABASE_DB_URL`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` are only needed locally for `npm run setup`. Never prefix `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, or `RATE_LIMIT_SALT` with `NEXT_PUBLIC_`.
3. **Pick the Vercel region closest to your Supabase region** (Settings → Functions → Function Region).
4. **Set `NEXT_PUBLIC_SITE_URL`** to your live domain (no trailing slash), add the domain in Settings → Domains, and **deploy**.
5. Run `npm run setup` locally against the production Supabase project to ensure all migrations (`0001_init.sql` through `0006_pinterest.sql`) are applied.

### Post-deploy checks

- [ ] `https://<your-domain>/api/health` returns `{"ok":true}`
- [ ] Admin can sign in at `/admin/login`
- [ ] Adding a product in `/admin/products/new` (with Sharp WebP image upload) makes it appear on `/` and `/products`
- [ ] Visiting from different countries changes the store, currency, and `/go/[id]` redirect host
- [ ] Clicking Buy records a click in `/admin` and `/admin/analytics`
- [ ] Creating tracked links in `/admin/pin-links` attributes visits and clicks under the **Campaigns** card
- [ ] Response headers on `/` include `X-Frame-Options: DENY`, `Strict-Transport-Security`, and `Content-Security-Policy-Report-Only`
- [ ] Vercel → Settings → Cron Jobs lists `/api/cron/cleanup`

### Content-Security-Policy rollout

CSP ships in **report-only** mode (`CSP_MODE=report-only`). Violations are posted to `/api/csp-report` and logged as `csp.violation`. Once verified clean, set `CSP_MODE=enforce` and redeploy.

### Cron and backups

- `vercel.json` runs `/api/cron/cleanup` daily (`03:17 UTC`), deleting events older than `EVENT_RETENTION_DAYS` (default 400) in batches of 5,000 and removing orphan images older than 24h via `findOrphans()`.
- `npm run export:data` exports `categories`, `products`, `product_links`, and `store_settings` into `./backups` (add `-- --with-events` to include events).

## Checks before you ship

```bash
npm run lint && npm run typecheck && npm test
npm run check:data && npm run check:hygiene
npm run build && npm run check:bundle
npm run verify:db && npm run test:analytics
npm run check:rls && npm run check:privacy
npm run start &   # then in another shell: npm run test:e2e
```

Simulate a visitor's country locally (dev only; disabled in production builds) by adding `?country=IN` (or `US`, `BR`, `MX`, `ID`) to any public URL.
