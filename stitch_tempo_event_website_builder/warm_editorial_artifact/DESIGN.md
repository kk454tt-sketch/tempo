---
name: Warm Editorial Artifact
colors:
  surface: '#fcf9f5'
  surface-dim: '#dcdad6'
  surface-bright: '#fcf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ef'
  surface-container: '#f0edea'
  surface-container-high: '#ebe8e4'
  surface-container-highest: '#e5e2de'
  on-surface: '#1c1c1a'
  on-surface-variant: '#55423f'
  inverse-surface: '#31302e'
  inverse-on-surface: '#f3f0ec'
  outline: '#88726e'
  outline-variant: '#dbc1bb'
  surface-tint: '#9a4433'
  primary: '#712618'
  on-primary: '#ffffff'
  primary-container: '#8f3c2c'
  on-primary-container: '#ffbbad'
  inverse-primary: '#ffb4a5'
  secondary: '#556254'
  on-secondary: '#ffffff'
  secondary-container: '#d6e4d2'
  on-secondary-container: '#596658'
  tertiary: '#593711'
  on-tertiary: '#ffffff'
  tertiary-container: '#744e26'
  on-tertiary-container: '#f6c28f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad3'
  primary-fixed-dim: '#ffb4a5'
  on-primary-fixed: '#3f0400'
  on-primary-fixed-variant: '#7b2d1f'
  secondary-fixed: '#d9e6d5'
  secondary-fixed-dim: '#bdcab9'
  on-secondary-fixed: '#131e13'
  on-secondary-fixed-variant: '#3e4a3d'
  tertiary-fixed: '#ffdcbd'
  tertiary-fixed-dim: '#f0bd8b'
  on-tertiary-fixed: '#2c1600'
  on-tertiary-fixed-variant: '#623f18'
  background: '#fcf9f5'
  on-background: '#1c1c1a'
  surface-variant: '#e5e2de'
typography:
  display-xl:
    fontFamily: Playfair Display
    fontSize: 56px
    fontWeight: '400'
    lineHeight: 64px
    letterSpacing: -0.02em
  display-xl-mobile:
    fontFamily: Playfair Display
    fontSize: 38px
    fontWeight: '400'
    lineHeight: 46px
    letterSpacing: -0.01em
  display-lg:
    fontFamily: Playfair Display
    fontSize: 44px
    fontWeight: '400'
    lineHeight: 52px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.06em
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-desktop: 2.5rem
  margin: 1.25rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system is tailored for an intentional, keepsake-grade web publishing platform where users craft bespoke digital invitations, personal memory archives, and event spaces for milestones (weddings, anniversaries, curated gatherings, memorials). 

The emotional signature is grounded, tactile, and literary—reminiscent of high-end independent print monographs, heavy cotton stationery, and archival exhibition programs. It deliberately rejects the hyper-saturated, glossy, neon-accented aesthetics of typical modern SaaS applications. 

Visual attributes rely on:
- Quiet structural balance and generous breathing room.
- Warm, light-bathed tactile surfaces rather than sterile digital whites.
- High-touch editorial composition with hairline dividing rules.
- Typography treated as the primary vessel of sentiment and tone.

## Colors

The palette establishes an organic, physical-paper foundation punctuated by deep archival inks and sun-baked earth tones:

- **Canvas & Surface Tier:**
  - Base Ground (`#FDFCF7`): Primary canvas, evoking unbleached cotton paper.
  - Surface Muted (`#F7F5EE`): Segmented containers, preview backdrops, and card fills.
  - Surface Crisp (`#FFFFFF`): Isolated photo mats, modal dialogs, and popovers.
  - Border Subtle (`#E8E6DF`): Low-contrast hairline dividers that maintain structure without rigid visual noise.
  - Border Emphasis (`#D3CFBF`): Interactive borders and active focus boundaries.

- **Ink & Typography Tier:**
  - Primary Ink (`#1A1A18`): Deep charcoal/carbon for high-priority headings and primary actions. Never pure `#000000`.
  - Secondary Ink (`#2C2C28`): Body prose and long-form narrative text.
  - Muted Slate/Stone (`#6E6D66`): Metadata, contextual captions, timestamps, and input placeholders.

- **Accents:**
  - Primary Accent (`#8F3C2C`): Deep terracotta/warm burgundy used purposefully for key conversion actions, critical interactive tags, and focal highlights.
  - Secondary Accent (`#3E4A3D`): Deep cypress/olive used for subtle status tags (e.g., "Published", "RSVP Confirmed") and seasonal event templates.

## Typography

The typographical pairing distinguishes internal workspace mechanics from creative artifact presentation:

- **Editorial Headings (`Playfair Display`):** Utilized for site headlines, artifact headers, template displays, and welcoming platform milestones. It introduces timeless print prestige. It must always be set with generous line heights and slight negative tracking on larger display variants.
- **Platform Interface & Body (`Plus Jakarta Sans`):** Powers the core creation suite, workspace controls, user input handling, and metadata. Its rounded humanist cadence balances warmth with crisp legibility on high-density screens.
- **Micro-Copy & Eyebrows:** Eyebrow labels, category ribbons, and statuses should leverage `label-sm` set in small uppercase with `0.06em` letter spacing for an archival, book-jacket feel.

## Layout & Spacing

The architecture operates on an intentional 12-column responsive fluid grid pinned to a maximum content container width of `1280px`. 

- **Desktop (min-width: 1024px):** 12 columns with `2.5rem` (`40px`) gutters and outer margins scaling up to `3rem` (`48px`). Content sections adopt asymmetric negative space, allowing editorial photography and typography to feel curated rather than packed into standardized dashboards.
- **Tablet (768px - 1023px):** 8 columns with `1.5rem` (`24px`) gutters and margins. Side panels collapse into layered bottom sheets or off-canvas drawers.
- **Mobile (< 768px):** 4 columns with `1rem` (`16px`) gutters and `1.25rem` (`20px`) screen margins. Dense controls are prioritized into vertical flows while retaining unhurried breathing space between cards (`space-lg` to `space-xl`).
- **Vertical Rhythm:** Section margins use uncompressed pacing (typically `4rem` to `6rem` between major layout blocks) to reinforce composure and avoid operational urgency.

## Elevation & Depth

Visual hierarchy relies on planar layering and delicate paper-like offsets rather than heavy, synthetic blur mechanics.

- **Primary Structure:** Separation is achieved through hairline borders (`1px solid #E8E6DF`) paired with natural shifts in surface tint (`#FDFCF7` against `#F7F5EE` and `#FFFFFF`).
- **Ambient Paper Shadows:** When depth is structurally essential (modals, dropdown menus, template preview hovering), use wide-dispersion, highly diffused shadows tinted warm umber instead of generic black:
  - *Resting Card:* No shadow; purely delineated by `#E8E6DF` stroke or `#FFFFFF` fill on muted ground.
  - *Interactive Hover:* `0 6px 20px -4px rgba(44, 44, 40, 0.05), 0 2px 6px -2px rgba(44, 44, 40, 0.03)`
  - *Floating Layer / Flyout:* `0 12px 32px -8px rgba(44, 44, 40, 0.08), 0 4px 12px -2px rgba(44, 44, 40, 0.04)`
  - *Modal Sheet:* `0 24px 48px -12px rgba(26, 26, 24, 0.12), 0 0 0 1px rgba(232, 230, 223, 0.8)`
- **Glass & Backdrops:** Use a soft, warm blur overlay (`backdrop-filter: blur(8px); background-color: rgba(253, 252, 247, 0.85)`) for sticky headers and modal underlays.

## Shapes

The shape system employs deliberate, soft architectural radii (`roundedness: 1`). 

- Default interactive elements (inputs, toolbars, buttons) use subtle `0.25rem` (4px) corner radiuses.
- Elevated surface containers, dialogs, and media frames scale up to `0.5rem` (8px) (`rounded-lg`).
- Feature cards and curated template frames cap at `0.75rem` (12px) (`rounded-xl`).
- High-radius circular or pill geometry is strictly forbidden for standard UI controls; it is reserved exclusively for system notification tags, compact counter badges, and avatar frames.

## Components

- **Buttons:**
  - *Primary Button:* Solid `#8F3C2C` fill with white text (`#FFFFFF`), `0.25rem` radius, `0.75rem 1.5rem` padding, subtle `0.01em` tracking. On hover: shifts to a deeper `#7A3224`.
  - *Secondary Button:* Crisp `#FFFFFF` surface with `#1A1A18` text and a precise `1px solid #E8E6DF` outline. On hover: surface transitions to `#F7F5EE` with border darkening to `#D3CFBF`.
  - *Ghost / Editorial Button:* Transparent background with underline accent (`#8F3C2C` on hover), text styled in `label-md`.

- **Input Fields & Form Elements:**
  - Field containers use a `#FFFFFF` fill bounded by a `1px solid #E8E6DF` border. Minimum height `44px` with `0.75rem` lateral padding.
  - Active/Focus: Border transitions to `#8F3C2C` with an imperceptible `2px` ring in `rgba(143, 60, 44, 0.15)`. No loud blue focus halos.
  - Labels rest outside the field in `body-sm` using text color `#1A1A18` with font weight `600`.

- **Checkboxes & Radios:**
  - Checkboxes use `0.25rem` roundedness, Radios are round. Unchecked state: `#FFFFFF` fill with `1.5px solid #D3CFBF`.
  - Checked state: `#8F3C2C` fill with an ivory/white custom check vector or solid inner pip.

- **Cards & Showcase Containers:**
  - Template and memory cards sit on `#FFFFFF` or `#F7F5EE` surfaces framed with `1px solid #E8E6DF`.
  - Imagery inside cards utilizes warm, natural color temperature photographs with an inner border inset (`box-shadow: inset 0 0 0 1px rgba(0,0,0,0.03)`).
  - Hover states subtly elevate cards with the ambient warm shadow and a 1px border shift to `#D3CFBF`.

- **Chips & Badges:**
  - Status chips (e.g., "Draft", "Active", "RSVP Open"): Rendered using a `#F7F5EE` fill, subtle `1px solid #E8E6DF` border, and text set in `label-sm` uppercase. Olive tags use `#EBF0EA` fill with `#3E4A3D` text.

- **Editorial Dividers & Keystone Ornaments:**
  - Structural breaks utilize hairline dividers with an optional centered small archival asterisk or minimal diamond glyph rendered in `#6E6D66`.