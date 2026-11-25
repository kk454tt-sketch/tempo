# Tempo — Websites for your moments

Tempo is a keepsake-grade digital web publishing application for milestone celebrations and life moments (Weddings, Birthdays, Business Openings, Dinners & Parties, Anniversaries, Graduations, and Baby Showers).

## Application Architecture

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Authentication**: Firebase Authentication (Email/Password, Google OAuth popup, Password Reset)
- **Database**: Cloud Firestore (NoSQL document store with strict rules and indexes)
- **Backend**: Node.js + Firebase Admin SDK (Cryptographic ID token verification and atomic Firestore transactions)
- **Payments**: Secure server-side UPI payment engine + Gmail API transaction verification

```
src/
├── components/          # Reusable UI component library
│   ├── common/          # Global UI (Navbar, Footer, Button, Input, Modal, Toast, Badge, BrandLogo, ErrorBoundary)
│   ├── dashboard/       # Creator dashboard components (WebsiteCard, etc.)
│   ├── editor/          # Website creator studio (EditorHeader, Tabs, LivePreviewFrame)
│   └── templates/       # Template display widgets (TemplateCard, CategoryFilter, TemplateGrid)
├── config/              # Site and category configuration (site.ts, categories.ts)
├── context/             # AuthContext providing Firebase Auth state across the application
├── pages/               # Route pages (Home, Templates, SignIn, SignUp, ForgotPassword, Dashboard, Creator, PublicEvent, 404)
├── services/            # Decoupled data & integration layers (apiService, eventService, unlockService, storageService)
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

Checkout is scoped to the Pro Interactive website template. The `/plans` page requires a signed-in Firebase user and an eligible Pro Interactive website owned by that account. The ₹499 price is stored in Cloud Firestore and never accepted from the browser. Order, transaction, processed-Gmail-message, and manual-approval records are stored in Firestore; sensitive payment business data is never stored in browser storage.

Each order gets its own UPI QR and app link containing the exact INR amount and order reference. The supplied FamApp QR remains available as a backup. “I have paid” only starts `VERIFYING`. Gmail processing checks the order reference, exact amount, unique transaction reference, and expiry. A verified payment atomically marks the order paid and unlocks Pro Interactive on that website. Ambiguous payments go to `MANUAL_REVIEW`. The admin dashboard is at `/admin/payments`.

### Deployment setup

1. Deploy Cloud Firestore rules and indexes using `firebase deploy --only firestore`.
2. Configure `FIREBASE_PROJECT_ID` (and optionally `GOOGLE_APPLICATION_CREDENTIALS`), `ADMIN_EMAIL`, and `CRON_SECRET` as **server-only** environment variables.
3. Set `UPI_ID=9979370684@fam`, `UPI_MERCHANT_NAME=Jaisingh Kushwaha`, and `PUBLIC_SITE_URL` to your live site origin.
4. Enable the Gmail API and create OAuth credentials with Gmail read access. Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GMAIL_REFRESH_TOKEN` to the server environment. Set `GMAIL_PAYMENT_QUERY` if the FamApp notification sender does not match the default `from:(famapp)` query, and set `GMAIL_PAYMENT_SENDER` to the exact sender email address shown on a genuine FamApp notification.
5. To send sanitized customer and admin emails, authorize the Gmail account with send scope and set `GMAIL_SEND_ENABLED=true`.
6. Deploy to Vercel or your hosting provider. `vercel.json` schedules `/api/cron/payments` every five minutes; this endpoint requires the configured `CRON_SECRET`.
