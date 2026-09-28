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
│   ├── components/      # Template React components (WeddingTimeless, BirthdayEmma, OpeningCoffeeHouse, PartyEvening, TemplateRenderer)
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
