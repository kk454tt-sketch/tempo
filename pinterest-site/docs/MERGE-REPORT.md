# AffHub Module Merge Report

Merged all 12 AffHub modules into `pinterest-site/` with exactly one copy of every file.

## Colliding Paths Resolved (24 total)

| Path | Versions Found | Version Kept / Resolution | Reason |
|---|---|---|---|
| `supabase/migrations/0001_init.sql` | `affhub-scaffold`, `affhub-database` | `affhub-database` | Scaffold schema was older; database module has the canonical schema. |
| `app/admin/page.tsx` | `affhub-admin-login-shell`, `affhub-dashboard-analytics` | `affhub-dashboard-analytics` | Shell version was a stub. |
| `app/admin/analytics/page.tsx` | `affhub-admin-login-shell`, `affhub-dashboard-analytics` | `affhub-dashboard-analytics` | Shell version was a stub. |
| `app/admin/products/page.tsx` | `affhub-admin-login-shell`, `affhub-admin-products` | `affhub-admin-products` | Shell version was a stub. |
| `app/admin/settings/page.tsx` | `affhub-admin-login-shell`, `affhub-final-pass` | `affhub-final-pass` | Shell version was a stub. |
| `app/privacy/page.tsx` | `affhub-final-pass`, `affhub-hardening` | `affhub-hardening` | Generated directly from `lib/privacy/inventory.ts`. |
| `components/layout/CountryChip.tsx` | `affhub-home-page`, `affhub-country-banner-modal` | `affhub-country-banner-modal` | Superset wiring modal open state. |
| `components/layout/PublicShell.tsx` | `affhub-home-page`, `affhub-country-banner-modal` | `affhub-country-banner-modal` | Superset wiring `CountryProvider` and `CountrySelectorModal`. |
| `components/ui/button-styles.ts` | `affhub-home-page`, `affhub-country-banner-modal` | `affhub-country-banner-modal` | Superset matching country modal controls. |
| `lib/storefront.ts` | `affhub-home-page`, `affhub-country-banner-modal` | `affhub-country-banner-modal` | Superset adding `countryNotice` and `normalizeCountryCode`. |
| `components/layout/Footer.tsx` | `affhub-home-page`, `affhub-final-pass` | `affhub-final-pass` | Includes links to About, Contact, and Privacy. |
| `app/page.tsx` | `affhub-scaffold`, `affhub-home-page`, `affhub-final-pass` | `affhub-final-pass` | Complete home page with metadata and `viewportFit: "cover"`. |
| `scripts/check-rls.ts` | `affhub-final-pass`, `affhub-hardening` | `affhub-hardening` | Full RLS + RPC probe script (unused `scripts/check-repo.ts` and `scripts/lib/rls-checks.ts` removed). |
| `lib/admin/products.ts` | `affhub-admin-products`, `affhub-analytics-backend` | `affhub-admin-products` | Canonical admin products data helper. |
| `lib/products.ts` | `affhub-home-page`, `affhub-prompt-2`, `affhub-prompt-3` | Hand-merged | Kept `HOME_PRODUCT_LIMIT`, `getHomeProducts`, `ProductSummary` AND `ProductLink`, `ProductWithLinks`, `ProductPage`, `CategorySummary`, `PRODUCT_SELECT`, `getProducts`, `getCategorySummaries`. |
| `lib/affiliate.ts` | `affhub-prompt-3`, `affhub-final-pass` | Hand-merged | Kept `getAffiliateTags`, `affiliateTagFor`, `AffiliateTags` AND `AFFILIATE_COUNTRIES`, `AffiliateCountry`, `normalizeTag`, `isValidTag`. |
| `lib/seo.ts` | `affhub-prompt-3`, `affhub-final-pass` | Hand-merged | Kept `buildProductMetadata`, `buildProductJsonLd`, `ProductOffer` AND `pageMetadata`, `siteUrl`, `absoluteUrl`. |
| `lib/events.ts` | `affhub-scaffold`, `affhub-prompt-3` | Hand-merged | Kept `getRequestContext` and `recordEvent` AND `insertEvent` and `trackEvent`, unified on `lib/tracking.ts`. |
| `lib/slug.ts` | `affhub-admin-products`, `affhub-final-pass` | Hand-merged | Single `slugify(input, fallback = "")` + `uniqueSlug(base, taken)` compatible with all callers. |
| `components/ui/EmptyState.tsx` | `affhub-home-page`, `affhub-prompt-2` | Hand-merged | Exports both named `EmptyState` and default export with union of props (`icon`, `title`, `action`, `children`). |
| `components/ui/Icon.tsx` | `affhub-scaffold` (`icon.tsx`), `affhub-home-page`, `affhub-admin-login-shell` | Hand-merged | Standardized as `Icon.tsx` with union of props (`name`, `filled`, `className`, `label`). |
| `components/product/ProductGrid.tsx` | `affhub-prompt-2`, `affhub-prompt-3` | Split & updated | Kept products-list `ProductGrid.tsx`; moved prompt-3 variant to `components/product/TrendingGrid.tsx` and updated `TrendingRow.tsx`. |
| `next.config.ts` | `affhub-scaffold`, `affhub-home-page`, `affhub-final-pass`, `affhub-hardening` | Hand-merged | Scaffold base + Supabase `images.remotePatterns` + final-pass & hardening security headers + `withSentryConfig`. |
| `.env.example` | `affhub-scaffold`, `affhub-final-pass`, `.env.example.additions` | Hand-merged | Union of all env vars with comments and no real values. |

## Additional Cleanup
- Deleted unused `lib/country-context.tsx` (replaced by `components/providers/CountryProvider.tsx`).
- Deleted unused `scripts/check-repo.ts`, `scripts/lib/rls-checks.ts`, `.env.example.additions`, `.gitignore.additions` (merged into `.env.example` and `.gitignore`).
- Moved `INTEGRATION.md`, `MIDDLEWARE-PATCH.md`, and `README.section.md` into `docs/`.
