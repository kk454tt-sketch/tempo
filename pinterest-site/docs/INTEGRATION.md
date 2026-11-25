# AffHub hardening layer: integration notes

These files were written without access to your repo (Prompts 0A–0F), so every place they touch existing code is
listed here. Copy the files over keeping the same paths, then do the 6 wiring steps below.

## 1. Install

```bash
npm i @upstash/ratelimit @upstash/redis @sentry/nextjs material-symbols
npm i -D @playwright/test tsx
npx playwright install chromium
```

Add to `package.json` scripts (keep any you already have):

```json
"typecheck": "tsc --noEmit",
"check:rls": "tsx scripts/check-rls.ts",
"check:privacy": "tsx scripts/check-privacy.ts",
"check:bundle": "tsx scripts/check-bundle-secrets.ts",
"check:hygiene": "tsx scripts/check-hygiene.ts",
"export:data": "tsx scripts/export-data.ts",
"test:e2e": "playwright test"
```

Append `.env.example.additions` to `.env.example` and `.gitignore.additions` to `.gitignore`. Paste
`README.section.md` into your README. If you already have a `next.config.*`, merge `next.config.ts` into it.

## 2. Assumptions to confirm (change the file named, not your app)

| Assumption | Where it lives |
|---|---|
| `findOrphans()` is exported from `@/lib/storage/orphans` and returns `string[]` (or `{ bucket?, paths }`) | `app/api/cron/cleanup/route.ts` |
| `findOrphans()` ignores files younger than ~24 h (an image uploaded in the admin form but not yet saved must not be deleted) | your Prompt 0F code |
| `public.events` has a `created_at` column | migration `20261115120000_cleanup_old_events.sql` |
| Env names: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | everywhere |
| Column names: `products.title`, `products.slug`, `products.is_published`, `product_links.product_id/country/url`, `categories.name/slug`, `admins.user_id` | `TABLES` block at the top of `scripts/check-rls.ts` |
| Events columns: `id, type, product_id, country, referrer, created_at` | `lib/privacy/inventory.ts` (`npm run check:privacy` tells you the exact diff) |
| Cookies: only Supabase `sb-*` admin session cookies | `lib/privacy/inventory.ts` (the e2e test fails on any other) |
| Admin routes `/admin`, `/admin/login`, `/admin/products`, `/admin/products/new`; labelled form fields | `e2e/support/admin-ui.ts` |
| `/api/health` already exists | from an earlier prompt |
| `@/` path alias, Tailwind, vitest picks up `*.test.ts` | your configs |

## 3. Wiring

**Middleware (CSP + nonce).** Wrap your existing `middleware.ts` logic:

```ts
import { type NextRequest, NextResponse } from "next/server";
import { withCsp } from "@/lib/security/csp";

export async function middleware(request: NextRequest) {
  return withCsp(request, async (requestHeaders) => {
    // ...your existing logic. Wherever you create a response use:
    //   NextResponse.next({ request: { headers: requestHeaders } })
    // (Supabase SSR template: replace every `NextResponse.next({ request })` with that.)
  });
}
export const config = { matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"] };
```

**Rate limits.** Server Actions (admin login, password change):

```ts
import { headers } from "next/headers";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const rl = await checkRateLimit(RATE_LIMITS.adminLogin, await headers()); // or RATE_LIMITS.passwordChange
if (!rl.success) return { error: `Too many attempts. Try again in ${rl.retryAfterSeconds}s.` };
// ...check the password only after this
```

Route Handlers (`/go`, `/api/admin/upload`):

```ts
import { enforceRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const limited = await enforceRateLimit(RATE_LIMITS.go, request.headers); // or RATE_LIMITS.adminUpload
if (limited) return limited; // 429 + Retry-After
```

Limits: login 5/min, `/go` 60/min, upload 30/min, password change 5/hour (+ the CSP report endpoint, 30/min).

**Pinterest verification (home page only).**

```ts
import { pinterestVerifyMetadata } from "@/lib/seo/pinterest-verify";
export const metadata: Metadata = { ...yourMetadata, ...pinterestVerifyMetadata() };
```

**Material Symbols, self-hosted.** In `app/layout.tsx` add `import "material-symbols/outlined.css";` and delete any
`<link>` / `@import` for `fonts.googleapis.com`. The `material-symbols-outlined` class name stays the same.
(`next/font/google` is fine: it downloads at build time and serves from your own domain.)

**Migration.** Apply `supabase/migrations/20261115120000_cleanup_old_events.sql` with your normal setup flow.

**Vitest.** The Playwright tests are named `*.e2e.ts` so vitest ignores them; no config change needed.

## 4. Final checks: status

I could **not** run these here: the sandbox has no copy of your repo, no network (so no `npm install`) and no
Supabase project. Nothing below is claimed as passing unless it says so.

| Check | Status |
|---|---|
| TypeScript syntax of every file | Ran: clean (syntax only, not type-checked: dependencies aren't installed) |
| Rate limiter, logger redaction, CSP builder | Ran under `tsx`: 5 allowed then blocked, key has no raw IP, 429 + `Retry-After: 3600`, IPs/secrets redacted, CSP string as specified |
| `check:bundle` | Ran against crafted fixtures: catches a `service_role` JWT and an env-secret value, passes an `anon` JWT and a clean bundle |
| `check:hygiene` | Ran against crafted fixtures: catches lorem ipsum and Google Fonts hosts, passes clean source |
| `npm run lint`, `typecheck`, `test` (incl. the 3 new vitest files), `build` | **Not run: you must run them** |
| `check:rls`, `verify:db`, `test:analytics`, `check:privacy` | **Not run: need your Supabase project** |
| `test:e2e` | **Not run: needs your running app and an admin login** |
| Grep for service-role key in `.next/static` | Script is ready (`npm run check:bundle`), **run it after `npm run build`** |
| Leftover fake data | Script is ready (`npm run check:hygiene`), **run it on your repo** |

## 5. Not finished / known limits

- `check:rls` is generic but your column names are guesses (see section 2). On first run expect `UNPROVEN` lines until
  `TABLES` matches your schema; `-- --strict` makes those fatal. It uses the service role key only for disposable
  fixtures, a throwaway non-admin user and RPC discovery, and deletes them afterwards. It calls every exposed RPC with
  dummy arguments as anon and as a normal user: any that succeed are reported as FAIL (add legitimately public ones to
  `RPC_ALLOWED_PUBLIC`). A function that is wrongly open could perform its write once during that probe.
- `store_settings` update/delete cannot be probed safely (no disposable row can be built generically); only its insert
  is checked.
- In-memory rate limiting is best effort on serverless. Set the Upstash variables for real limits.
- A nonce-based CSP means pages are rendered per request (no static/ISR HTML). Report-only first, as requested.
- Sentry is server/edge only (no browser SDK), by design, so CSP and privacy stay simple.
- CI builds with placeholder public env values. If your build fetches Supabase data at build time, use secrets instead.
