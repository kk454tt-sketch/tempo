---
name: Atelier Curated Canvas
colors:
  surface: '#fbf8fc'
  surface-dim: '#dcd9dd'
  surface-bright: '#fbf8fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f2f7'
  surface-container: '#f0edf1'
  surface-container-high: '#eae7eb'
  surface-container-highest: '#e4e1e6'
  on-surface: '#1b1b1e'
  on-surface-variant: '#47464a'
  inverse-surface: '#303033'
  inverse-on-surface: '#f3f0f4'
  outline: '#78767b'
  outline-variant: '#c8c5ca'
  surface-tint: '#5f5e60'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1d'
  on-primary-container: '#858386'
  inverse-primary: '#c8c6c8'
  secondary: '#5d5e66'
  on-secondary: '#ffffff'
  secondary-container: '#e3e1ec'
  on-secondary-container: '#63646c'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#002114'
  on-tertiary-container: '#069669'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e1e4'
  primary-fixed-dim: '#c8c6c8'
  on-primary-fixed: '#1c1b1d'
  on-primary-fixed-variant: '#474649'
  secondary-fixed: '#e3e1ec'
  secondary-fixed-dim: '#c6c5cf'
  on-secondary-fixed: '#1a1b22'
  on-secondary-fixed-variant: '#46464e'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#fbf8fc'
  on-background: '#1b1b1e'
  surface-variant: '#e4e1e6'
typography:
  display-hero:
    fontFamily: Hanken Grotesk
    fontSize: 56px
    fontWeight: '500'
    lineHeight: 64px
    letterSpacing: -0.035em
  display-hero-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 36px
    fontWeight: '500'
    lineHeight: 42px
    letterSpacing: -0.025em
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 40px
    fontWeight: '500'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.011em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: -0.006em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  gutter-lg: 2rem
  margin: 1.5rem
  margin-sm: 1rem
  margin-lg: 4rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system is tailored for a high-end creative marketplace showcasing digital templates, bespoke layouts, and creator artifacts. The brand persona is that of a quiet, authoritative curator—analogous to a contemporary physical gallery or an austere architectural monograph. The primary function of the UI is to recede, providing an impeccably balanced, low-noise canvas that enables dynamic, chromatic template previews to command attention.

The target audience comprises discerning designers, creative directors, indie builders, and studio founders who evaluate tools through the lens of aesthetic rigor, proportion, and craftsmanship. 

### Visual Direction: Curated Gallery Modernism
- **Gallery Canvas:** Pure surfaces, crisp structural lines, and restrained micro-interactions emphasize content over decoration.
- **Precision Restraint:** Uncompromising adherence to an 8-point baseline grid, meticulous tracking, and consistent border physics.
- **Zero Distraction:** Absolute avoidance of gratuitous gradients, synthetic glows, playful rounded blobs, and decorative skeuomorphism. Depth is implied through microscopic outline definitions, whisper-soft atmospheric shadows, and deliberate negative space.

## Colors

The palette operates on a monochrome foundational spectrum with warm zinc undertones, preserving luminous contrast without sterile harshness.

### Palette Architecture
- **Primary Ink (`#09090B`):** Deep obsidian used for primary interactive states, dark mode surfaces, high-priority buttons, and maximum-contrast accents.
- **Secondary Slate (`#71717A`):** Mid-tone zinc for secondary typography, metadata labels, counter badges, and inactive navigation cues.
- **Tertiary Emerald (`#059669`):** Reserved exclusively for commercial status tokens (e.g., "FREE" access indicators, live verification markers). Kept desaturated and crisp.
- **Neutral Core (`#18181B`):** Body typography default, providing optimum legibility without the harshness of pure black.

### Surface Tones & Structural Borders
- **Canvas Base:** `#FFFFFF` (Primary surface, image cards, light modal sheets).
- **Subtle Surface:** `#FAFAFA` (Page shell background, neutral wells, filter navigation bars).
- **Raised Surface:** `#F4F4F5` (Segmented controls, hover states, skeleton placeholders).
- **Hairline Border:** `#E4E4E7` (Structural containment, card strokes, dividers).
- **Interactive Border:** `#D4D4D8` (Input borders on hover, active state frames).

## Typography

The type system blends structural geometric balance with high-utility readability.

### Structural Pairing
- **Headlines & Editorial Marks (Hanken Grotesk):** Selected for its sharp geometry, contemporary neutral posture, and refined editorial presence at large scales. Weights are intentionally held at `500` (Medium) and `600` (Semi-Bold) to prevent clumsy headline weights from overpowering artwork thumbnails. Negative tracking is applied progressively as scale increases.
- **Interface, Functional Metas & Body (Inter):** Deployed for high legibility, robust tabular numerical support, and precise vertical metrics across desktop and mobile screens.

### Execution Rules
- Set uppercase labels (`label-sm`) with a tracking factor of `0.04em` for author tags, platform identifiers, and category micro-caps.
- Tabular figures (`tnum`) must be enforced for pricing tables, rating counts, and file size measurements.
- Maintain a line length between 48 and 68 characters for editorial product descriptions.

## Layout & Spacing

The layout is constructed as a structured gallery grid with fluid column adaptation bound within fixed outer maximum constraints.

### Grid Foundations
- **Max Width Container:** Centered `1440px` maximum viewport canvas for gallery browsing.
- **Desktop (>= 1280px):** 12-column layout, `32px` (`gutter-lg`) gutters, `64px` (`margin-lg`) margin edges. Standard template cards display as 3 columns (4 items per row) or 4 columns (3 items per row).
- **Tablet (768px - 1279px):** 8-column layout, `24px` (`gutter`) gutters, `24px` (`margin`) margin edges. Template cards span 4 columns (2 items per row).
- **Mobile (< 768px):** 4-column layout, `16px` (`gutter-sm`) gutters, `16px` (`margin-sm`) margin edges. Template cards span full width (1 item per row) or 2 columns with reduced metadata density.

### Spacing Discipline
Spacing follows an intentional 4px/8px rhythm. Vertical margins between curated category rows require `space-xl` (40px) or `space-xl * 1.5` (60px) to simulate museum-style curation breathability. Internal component clustering uses tight groupings (`space-xs` and `space-sm`) to ensure clear visual association.

## Elevation & Depth

Visual hierarchy prioritizes surface juxtaposition and low-contrast perimeter definition over intense elevation drops.

### Elevation Architecture
1. **Flat Ground (Level 0):** Used for view backgrounds (`#FAFAFA`) and secondary side panels. Zero shadow, relies purely on `#E4E4E7` divider lines.
2. **Resting Card State (Level 1):** Pure white `#FFFFFF` surface enclosed in a 1px border of `#E4E4E7`. Ambient soft shadow:
   `box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 3px -1px rgba(0, 0, 0, 0.05);`
3. **Floating / Hover Card State (Level 2):** Applied when hovering template visual previews or opening dropdown popovers:
   `box-shadow: 0 10px 25px -5px rgba(9, 9, 11, 0.05), 0 8px 10px -6px rgba(9, 9, 11, 0.03);`
   Border color shifts subtly to `#D4D4D8`.
4. **Overlay / Drawer Navigation (Level 3):** Modal overlays and quick-view panels:
   `box-shadow: 0 25px 50px -12px rgba(9, 9, 11, 0.12);`
   Paired with a low-opacity backing tint (`rgba(9, 9, 11, 0.4)` with 4px backdrop blur).

## Shapes

The geometric signature uses refined, consistent roundedness that avoids toy-like softness while preventing razor-sharp brutalism.

### Geometric Scale
- **Small Elements (Input fields, standard buttons, badge tags):** `rounded-md` (6px to 8px) for structural reliability.
- **Card Containers & Image Frames:** `rounded-xl` (12px to 14px). Inner artwork adopts a corresponding radius of `calc(12px - 1px)` to avoid corner bleed.
- **Modals, Floating Panels, and Hero Showcases:** `rounded-2xl` (16px to 20px).
- **Pill Badges & Filter Capsules:** Fully circular `9999px` radius, reserved strictly for state badges and filter chips.

## Components

### 1. Template Cards (Primary Entity)
- **Aspect Ratio:** Previews are fixed strictly to `16:10` for desktop web layouts or `4:3` for mobile/brand kits.
- **Card Framing:** 1px hairline border in `#E4E4E7`, `#FFFFFF` interior canvas, `rounded-xl`.
- **Image Container:** Overflow hidden with a subtle 1px internal inset border to preserve boundaries against pure white template designs. On card hover, images perform an imperceptible scale (`scale(1.02)`) across 300ms ease-out.
- **Metadata Cluster:** Title in `headline-sm` (`#18181B`), author link in `body-sm` (`#71717A`), aligned opposite the pricing indicator.
- **Price Presentation:** Tabular bold `body-md` (`#09090B`). If free, display as a high-density pill badge (`#ECFDF5` background, `#059669` text, `label-sm`).

### 2. Buttons & Actions
- **Primary:** Solid `#09090B` fill, `#FFFFFF` text, `rounded-lg`, height `40px` (desktop) / `44px` (mobile). Hover state shifts to `#27272A`.
- **Secondary / Ghost:** `#FFFFFF` fill, 1px `#E4E4E7` border, `#18181B` text. Hover state triggers `#F4F4F5` fill and `#D4D4D8` border.
- **Icon Actions:** `36px` square, `rounded-lg`, transparent background with subtle hover reveal (`#F4F4F5`).

### 3. Filter Chips & Taxonomy Bars
- **Style:** Pill capsule (`rounded-full`), height `32px`, typography `label-md`.
- **Default State:** Transparent or `#FFFFFF` fill, 1px border `#E4E4E7`, `#71717A` text.
- **Active / Selected State:** Solid `#09090B` fill, `#FFFFFF` text, border `#09090B`. Counter values inside pills inherit matching contrast.

### 4. Input Fields & Search Inputs
- **Base Style:** Height `44px`, background `#FFFFFF`, border 1px `#E4E4E7`, radius `rounded-lg`, typography `body-md`.
- **Focus Ring:** 1px solid `#09090B` border, zero high-intensity chromatic outer glow.
- **Search Header Bar:** Extended height `48px`, contextual shortcut badge (`⌘K`) in muted `#A1A1AA` monospace font inside a subtle `#F4F4F5` keycap badge.

### 5. Checkboxes & Radio Selectors
- **Dimensions:** `16px × 16px` squares with `4px` radius (checkbox) or circular (radio).
- **Colors:** Hairline `#D4D4D8` border when empty; solid `#09090B` fill with pure `#FFFFFF` checkmark when active. No colorful saturation.

### 6. Creator Avatar & Verification Chips
- **Avatar:** Circular `24px` to `32px` image wrapped in a 1px border of `rgba(0, 0, 0, 0.08)`.
- **Verification Marker:** `12px` solid obsidian badge with an inset white micro-check, nested cleanly at the corner of the avatar frame.