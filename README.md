# Tempo — Websites for your moments

Tempo is a keepsake-grade digital web publishing application for milestone celebrations and life moments (Weddings, Birthdays, Business Openings, Dinners & Parties, Anniversaries, Graduations, and Baby Showers).

## Application Architecture

```
src/
├── components/          # Reusable UI component library
│   ├── common/          # Global UI (Navbar, Footer, Button, Input, Modal, Toast, Badge, BrandLogo, ErrorBoundary)
│   ├── dashboard/       # Creator dashboard components (WebsiteCard, etc.)
│   ├── editor/          # Website creator studio (EditorHeader, Tabs, LivePreviewFrame)
│   └── templates/       # Template display widgets (TemplateCard, CategoryFilter, TemplateGrid)
├── config/              # Site and category configuration (site.ts, categories.ts)
├── pages/               # Route pages (Home, Templates, SignIn, SignUp, ForgotPassword, Dashboard, Creator, PublicEvent, 404)
├── services/            # Decoupled data & integration layers (eventService, authService, storageService, mockData)
├── templates/           # Modular template system
│   ├── components/      # Atelier template React components (SolsticeSageTemplate, AtelierNordTemplate, KomorebiDiningTemplate, FolioNoirTemplate, EnrollDeskPortal, TemplateRenderer)
│   ├── registry.ts      # Central template registry & dynamic registration API
│   └── types.ts         # Template type definitions
├── types/               # Centralized TypeScript contracts (user, template, event, auth)
└── utils/               # Reusable utility functions (validation, formatting, countdown, cn)
```

## How to Add a New Template

Adding a new template (e.g. `wedding-03`, `birthday-05`, `party-02`) requires **zero modifications** to homepage logic, dashboard logic, or editor core logic:

1. Create your template component in `src/templates/components/<TemplateName>.tsx`.
2. Register it in `src/templates/registry.ts` within the `templatesRegistry` array.
3. The new template is instantly available across the Homepage, Curated Gallery, Creator Studio, and Public Event Router.

## Running the Application

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview build
npm run preview
```

## Pro Interactive UPI checkout

Checkout is scoped to the Pro Interactive website template. The `/plans` page requires a signed-in Supabase user and an eligible Pro Interactive website owned by that account. The ₹499 price is stored in Supabase and never accepted from the browser. Order, transaction, processed-Gmail-message, and manual-approval records are stored in Supabase/Postgres; payment business data is not stored in browser storage or SQLite. The browser auth library can persist a login session, separate from checkout data.

Each order gets its own UPI QR and app link containing the exact INR amount and order reference. The supplied FamApp QR remains available as a backup. “I have paid” only starts `VERIFYING`. Gmail processing checks the order reference, exact amount, unique transaction reference, and expiry. A verified payment atomically marks the order paid and unlocks Pro Interactive on that website. The database also prevents an unpaid Pro Interactive site from being published. Ambiguous payments go to `MANUAL_REVIEW`. The admin dashboard is at `/admin/payments`.

### Deployment setup

1. Apply `supabase/migrations/20260930000000_add_pro_interactive_upi_checkout.sql` to the Supabase project used by this app. It creates payment tables and protected server-side SQL functions, seeds the ₹499 Pro Interactive product, and adds its website entitlement. Existing published EnrollDesk sites are grandfathered as unlocked.
2. Configure `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`, and `CRON_SECRET` as **server-only** Vercel environment variables. Keep `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as browser variables. Never prefix the service-role key with `VITE_`.
3. Set `UPI_ID=9979370684@fam`, `UPI_MERCHANT_NAME=Jaisingh Kushwaha`, and `PUBLIC_SITE_URL` to your live site origin. These are the defaults for your supplied UPI account; server environment values take precedence. The base URL is used only for the sanitized customer access link.
4. Enable the Gmail API and create OAuth credentials with Gmail read access. Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GMAIL_REFRESH_TOKEN` to the server environment. Set `GMAIL_PAYMENT_QUERY` if the FamApp notification sender does not match the default `from:(famapp)` query, and set `GMAIL_PAYMENT_SENDER` to the exact sender email address shown on a genuine FamApp notification. Automatic verification refuses to process messages until this trusted sender is configured.
5. To send sanitized customer and admin emails, authorize the Gmail account with send scope and set `GMAIL_SEND_ENABLED=true`. Emails contain customer, product, amount, order ID, status, and time only; they omit the original provider email and all transaction identifiers.
6. Deploy to Vercel. `vercel.json` schedules `/api/cron/payments` every five minutes; this endpoint requires the configured `CRON_SECRET`. Customer status polling continues while Gmail verification is pending.
7. Validate the FamApp sender and email format using a real low-value payment before accepting customer orders. Notifications without a matching order reference, transaction reference, and exact amount cannot auto-approve an order.

Local Vite development uses the same Supabase database and server environment. The payment API reports missing server configuration until the migration and `SUPABASE_SERVICE_ROLE_KEY` are set. Public UPI details appear in payment payloads; Gmail credentials and transaction data remain server-side.

### Local verification checklist

1. Apply the migration and configure the Supabase, Gmail, sender, admin, cron, and site URL variables above; then run `npm run dev` and sign in with a verified account.
2. Create an EnrollDesk/Pro Interactive draft, open its upgrade panel, and confirm the order shows ₹499, a unique order ID, the supplied UPI ID, and an order-specific QR. Confirm the server order amount comes from the database even if the browser request is changed.
3. Click “I have paid” without paying. Confirm the order moves only to `VERIFYING` and Pro Interactive stays locked. Confirm another user's account cannot read the order or unlock that site.
4. Use a real low-value payment to validate the exact FamApp sender and notification format. Confirm matching amount, order reference, and transaction reference approve once; repeat the same notification and confirm it cannot approve another order.
5. Verify wrong-amount, expired, unknown, and duplicate notices stay locked and appear for manual review. Approve a review only from the protected admin dashboard with a reason.
6. Check customer API responses and confirmation email contain only customer name, amount, product, order ID, status, and the site access link. Confirm admin email is sanitized and no UTR, transaction ID, Gmail message ID, raw message, or balance appears.
