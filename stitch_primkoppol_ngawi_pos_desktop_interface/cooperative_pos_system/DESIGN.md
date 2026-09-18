---
name: Cooperative POS System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3d4a42'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7a72'
  outline-variant: '#bccac0'
  surface-tint: '#006c4a'
  primary: '#006948'
  on-primary: '#ffffff'
  primary-container: '#00855d'
  on-primary-container: '#f5fff7'
  inverse-primary: '#68dba9'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#ba0035'
  on-tertiary: '#ffffff'
  tertiary-container: '#e21e49'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#85f8c4'
  primary-fixed-dim: '#68dba9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005137'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#ffdada'
  tertiary-fixed-dim: '#ffb3b6'
  on-tertiary-fixed: '#40000c'
  on-tertiary-fixed-variant: '#920028'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
  currency-display:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 1.75rem
---

## Brand & Style

This design system is engineered for high-throughput cooperative retail environments ('Koperasi Serba Usaha'). The UI communicates absolute fiscal reliability, operational speed, and structural clarity. 

The aesthetic is Modern Functional SaaS:
- High typographic legibility under varied retail lighting.
- Compact, dense component layouts optimized for mouse, keyboard shortcuts, and touchscreen point-of-sale terminals.
- Instant, non-ambiguous visual hierarchy separating standard operational flows (emerald green) from member financial risks and credit ceiling breaches (vibrant rose/red).

## Colors

The palette establishes strict utility and crisp separation:
- **Primary (`#059669` - Emerald):** Drives primary checkout commitments, payment validations, positive balances, and confirmation workflows.
- **Secondary (`#0f172a` - Deep Slate):** Anchors headers, primary numeric outputs, active navigation states, and high-emphasis data framing.
- **Tertiary (`#e11d48` - Rose 600):** Dedicated to critical fiscal warnings, member credit-limit auto-blocks, overdue debt flags, and destructive transaction cancellations.
- **Neutral (`#64748b` - Slate):** Forms contextual hierarchy through subtle slate backgrounds (`#f8fafc`, `#f1f5f9`), borders (`#e2e8f0`), and secondary meta labels.
- **Semantic Notice (`#d97706` - Amber 600):** Reserved for nearing-limit thresholds (80–99% credit consumption) before hard block.

## Typography

Typography relies on a dual engine pairing:
- **Headlines & Currency Data (Space Grotesk):** Provides structured geometric precision, tabular alignments for high-speed ledger calculations, receipts, and cashier grand totals.
- **Interface & Operational Text (Hanken Grotesk):** Offers neutral, highly legible sans-serif readability for line items, SKUs, member names, and system logs.
- All monetary and numeric figures must render with tabular figures (`tnum`) enabled to ensure vertical column alignment across dense order registers.

## Layout & Spacing

The design system operates on a functional desktop-first split:
- **Workspace Canvas:** Fixed viewport-height POS configuration (no master body scroll) partitioned into a 65/35 or 70/30 split. The left panel contains the product catalog, member lookup, and transaction register; the right panel holds order summary, fiscal tallies, credit metrics, and payment action trays.
- **Density:** Spacing tokens prioritize dense operational utility (`space-sm` for ledger rows, `space-md` for card interiors) to minimize eye travel for cashiers handling frequent transactions.

## Elevation & Depth

Visual hierarchy utilizes low-contrast outlines coupled with minimal structural elevation to reduce visual fatigue over 8-hour cashier shifts:
- **Level 0 (App Shell / Canvas):** Neutral slate background (`#f8fafc`).
- **Level 1 (Panels & Surfaces):** Pure white cards (`#ffffff`) bounded by crisp 1px borders (`#e2e8f0`). No shadow.
- **Level 2 (Active Cards & Floating Metrics):** Soft 1px border (`#cbd5e1`) with an ambient shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)`.
- **Level 3 (Modal Dialogs & Credit Alerts):** Crisp 1px border with a focused drop shadow: `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)`.
- **Credit-Block Alert Surfaces:** Tonal surface fills using 5% rose tints (`#fff1f2`) outlined by solid rose borders (`#f43f5e`), instantly surfacing debt constraints without obscuring data.

## Shapes

The design system uses crisp, compact borders:
- Base elements, inputs, and list rows use 4px (`rounded`).
- Cards, modal containers, and alert banners use 8px (`rounded-lg`).
- Status chips and micro-pills use full radius (`rounded-full`) to contrast against sharp data containers.

## Components

### Buttons
- **Primary (Checkout / Confirm):** Solid `#059669`, white bold text, 40px minimum target height, 4px border radius. Hover: `#047857`. Focus ring: 2px `#10b981` offset.
- **Secondary (Hold / Receipt / Discount):** White background, 1px `#cbd5e1` border, `#0f172a` text. Hover: `#f8fafc`.
- **Destructive / Override:** Tinted background (`#ffe4e6`), `#be123c` text, 1px `#fecdd3` border. Active/Hover: `#f43f5e` solid with white text.

### Credit-Limit Warning & Auto-Block Cards
- **Warning Card (80–99% Credit Limit):** Light amber surface (`#fffbeb`), border `#fde68a`. Displays remaining balance and amber indicator chip.
- **Auto-Block Card (100%+ Credit Limit):** Light rose surface (`#fff1f2`), 1.5px border `#e11d48`. Disables standard "Charge to Account" action, shows strict error badge ("PLAFON KREDIT TERCAPAI"), and presents an administrative supervisor bypass trigger.

### Status Badges & Chips
- Compact padding (2px vertical, 8px horizontal), font-size 11px uppercase label with 500 weight.
- **Active Member:** Background `#ecfdf5`, text `#065f46`, dot indicator `#059669`.
- **Blocked Member:** Background `#ffe4e6`, text `#9f1239`, dot indicator `#e11d48`.
- **Installment Overdue:** Background `#fef2f2`, border `#fca5a5`, text `#991b1b`.

### Data Grids & Ledger Rows
- Height 44px for high touch-accuracy without sacrificing density.
- Zebra alternate: `#ffffff` and `#f8fafc`. Row borders: 1px bottom `#f1f5f9`.
- Monospaced numerical values for item qty, price, and line subtotal.

### Input Fields (Barcode, Search, Member ID)
- Background `#ffffff`, border 1px `#cbd5e1`, 4px radius. 
- Integrated keyboard shortcut tag (e.g., `[F2]`, `[Enter]`) positioned on the trailing edge in subdued slate text.
- Focus state: 1.5px `#059669` border with zero blur ring.