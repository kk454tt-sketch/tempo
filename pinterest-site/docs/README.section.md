## Deploy to Vercel

1. **Import the repo** in Vercel (New Project → import from GitHub).
2. **Set every variable from `.env.example`** (Project → Settings → Environment Variables), including the new
   ones: `RATE_LIMIT_SALT`, `CRON_SECRET`, `EVENT_RETENTION_DAYS`, `CSP_MODE`, and optionally `UPSTASH_REDIS_REST_URL`,
   `UPSTASH_REDIS_REST_TOKEN`, `NEXT_PUBLIC_PINTEREST_VERIFY`, `SENTRY_DSN`.
   `SUPABASE_DB_URL` is only needed on your own machine for `npm run setup`; do **not** add it to Vercel.
   Never prefix `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET` or `RATE_LIMIT_SALT` with `NEXT_PUBLIC_`.
3. **Pick the Vercel region closest to your Supabase region** (Settings → Functions → Function Region), so every
   database call is a short hop.
4. **Set `NEXT_PUBLIC_SITE_URL`** to the final domain (for example `https://affhub.example`), add the domain in
   Settings → Domains, then **deploy**.
5. Apply `supabase/migrations/20261115120000_cleanup_old_events.sql` to your database with your usual setup flow
   (the cron job needs the `cleanup_old_events` function).

`x-vercel-ip-country` exists only on Vercel. Locally, use the dev country override (or send that header yourself,
as the e2e tests do) to test country switching.

### Post-deploy checks

- [ ] `https://<your-domain>/api/health` returns ok
- [ ] The admin can sign in
- [ ] Adding a product in the admin makes it appear on the home page
- [ ] Visiting from a different country (use a VPN) changes the store and the product link
- [ ] Clicking a product button shows up as a click in the dashboard
- [ ] Response headers on the home page include `X-Frame-Options: DENY`, `Strict-Transport-Security` and a
      `Content-Security-Policy-Report-Only`
- [ ] Vercel → Settings → Cron Jobs lists `/api/cron/cleanup`; trigger it once and confirm the JSON counts

### Content-Security-Policy rollout

The CSP ships in **report-only** mode (`CSP_MODE=report-only`): nothing is blocked, violations are logged as
`csp.violation` in Vercel Logs. Browse the site and the admin for a few days, fix whatever is reported, then set
`CSP_MODE=enforce` and redeploy. Set `CSP_MODE=off` to remove it entirely.

### Cron and backups

- `vercel.json` runs `/api/cron/cleanup` daily (03:17 UTC). It deletes events older than `EVENT_RETENTION_DAYS`
  (default 400) in batches of 5,000 and removes orphan images. Requests without `Authorization: Bearer $CRON_SECRET`
  get 401.
- `npm run export:data` writes `categories`, `products`, `product_links` and `store_settings` to timestamped JSON
  files in `./backups` (add `-- --with-events` to include events). This is your own backup if your Supabase plan has
  no automatic backups. Run it regularly from a trusted machine; the files are git-ignored.

## Observability

- **Logs:** `lib/logger.ts` writes one JSON object per line (`level`, `time`, `msg`, fields). Secrets, cookies and
  IP-like fields are redacted, and IPv4 addresses inside strings are masked. Filter in Vercel Logs by `level` or `msg`.
- **Sentry (optional):** set `SENTRY_DSN` and server errors are reported; leave it unset and nothing is initialised.
  Request bodies, cookies, query strings, auth/IP headers, user data and breadcrumb data are removed before sending.

## Privacy

`/privacy` lists every cookie and every field stored in `events`, and is generated from `lib/privacy/inventory.ts`.
`npm run check:privacy` fails if the `events` table and that list differ, and the e2e test fails if a visitor gets a
cookie that is not listed. **No IP addresses are stored by the app.** The only IP-derived value is a salted SHA-256
hash used as a rate-limit counter key, kept for the length of the limit window (Upstash TTL, or process memory), and
the privacy page says so. Vercel and Supabase process IPs as hosting providers under their own policies.

## Checks before you ship

```bash
npm run lint && npm run typecheck && npm test
npm run check:rls          # needs .env.local with the anon + service role keys
npm run check:privacy
npm run verify:db && npm run test:analytics
npm run build && npm run check:bundle && npm run check:hygiene
npm run start &            # then, in another shell:
npm run test:e2e
```
