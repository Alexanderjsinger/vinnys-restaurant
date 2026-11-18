---
name: Vinny's Bar & Grill
colors:
  surface: '#141312'
  surface-dim: '#141312'
  surface-bright: '#3b3937'
  surface-container-lowest: '#0f0e0d'
  surface-container-low: '#1d1b1a'
  surface-container: '#211f1e'
  surface-container-high: '#2b2a28'
  surface-container-highest: '#363433'
  on-surface: '#e6e1df'
  on-surface-variant: '#dac2b1'
  inverse-surface: '#e6e1df'
  inverse-on-surface: '#32302f'
  outline: '#a28d7e'
  outline-variant: '#544437'
  surface-tint: '#ffb77a'
  primary: '#ffb77a'
  on-primary: '#4c2700'
  primary-container: '#d9822b'
  on-primary-container: '#4b2600'
  inverse-primary: '#8f4e00'
  secondary: '#ffb4aa'
  on-secondary: '#690003'
  secondary-container: '#a00107'
  on-secondary-container: '#ffa99e'
  tertiary: '#ffb868'
  on-tertiary: '#482900'
  tertiary-container: '#d08727'
  on-tertiary-container: '#472800'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdcc2'
  primary-fixed-dim: '#ffb77a'
  on-primary-fixed: '#2e1500'
  on-primary-fixed-variant: '#6d3a00'
  secondary-fixed: '#ffdad5'
  secondary-fixed-dim: '#ffb4aa'
  on-secondary-fixed: '#410001'
  on-secondary-fixed-variant: '#930006'
  tertiary-fixed: '#ffddbb'
  tertiary-fixed-dim: '#ffb868'
  on-tertiary-fixed: '#2b1700'
  on-tertiary-fixed-variant: '#673d00'
  background: '#141312'
  on-background: '#e6e1df'
  surface-variant: '#363433'
typography:
  display-hero:
    fontFamily: Playfair Display
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
  display-hero-mobile:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 38px
    fontWeight: '700'
    lineHeight: 46px
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Manrope
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-stamp:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.15em
  label-badge:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.08em
  label-price:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an elevated, gritty craft aesthetic tailored for an iconic neighborhood fixture directly opposite Eastern Michigan University in Ypsilanti. It reconciles collegiate vitality with culinary craftsmanship—bridging the unpretentious warmth of a classic Midwestern tavern with the sultry mood of an artisan brewpub and late-night lounge.

### Personality & Values
- **Warm Hospitality & Gritty Craft:** Dark espresso wood, glowing bourbon taps, and tactile richness balanced with unpretentious community pride.
- **Collegiate Energy, Refined:** A sanctuary for EMU faculty, students, and Ypsi locals seeking elevated comfort fare, well-executed cocktails, and electric gameday atmosphere.
- **Tactile Modernist Tavern:** Heavy contrast surfaces, warm golden neon amber highlights, rich dark slate canvases, and sharp typography with collegiate tracking stamps.

### Visual Style Direction
A moody, atmospheric dark-mode-first aesthetic with warm tactile layers. Interfaces are grounded in deep charcoal (#121110) paired with warm cream highlights (#F5F2EB), rich amber accents (#D9822B), and razor-sharp vermilion triggers (#E03A2F). Depth is conveyed through subtle warm borders, low-diffusion ambient amber glows, and high-impact editorial typography.

## Colors

The palette draws directly from the sensory hallmarks of a barroom: toasted bourbon barrels, draft tap brass, neon glow, and charred oak. 

### Role Mapping
- **Canvas Base (`#121110`):** Ultra-deep charcoal espresso acting as the default dark viewport canvas.
- **Surface Elevation 1 (`#1A1816`):** Card backgrounds, hero banners, and persistent navigation bars.
- **Surface Elevation 2 (`#22201D`):** Elevated modals, dropdown menus, and hovered card states.
- **Borders & Dividers (`#2F2B26` / `#3D3832`):** Structural borders separating grid columns, menu items, and calendar intervals with warmth rather than clinical gray.
- **Primary Accent (`#D9822B`):** Rich Bourbon Amber. Primary interactive affordance for online ordering, featured hero actions, and active indicators. Hover state scales to Warm Honey Gold (`#E59838`).
- **Secondary Accent (`#E03A2F`):** Cardinal / Neon Vermilion. High-urgency triggers, live sports tags, event genre indicators, and dynamic "Live Now / EMU Gameday" badges.
- **Typography & Content (`#F5F2EB`):** Warm Biscuit / Cream serving as the primary text color to avoid harsh digital white and preserve a tavern glow. Muted metadata sits at `#A8A196`.

## Typography

The typographic hierarchy establishes tension between the literary elegance of Playfair Display and the contemporary precision of Manrope and JetBrains Mono.

### Application Rules
- **Display & Headlines:** Use Playfair Display for all major section introductions, item titles, and storytelling headers. This honors the heritage and bar-craft narrative.
- **Body & Descriptions:** Use Manrope for high-legibility readability in dim light environments (e.g. patrons checking the menu on mobile inside the bar).
- **Stamps, Badges & Metadata:** Render all utility tags ('EST. YPSILANTI, MI', 'CROSS STREET · EMU', 'LUNCH 11-3PM') in JetBrains Mono, fully uppercase with generous letter spacing (`0.12em` to `0.18em`) to mimic stamped cellar tags and tap handles.

## Layout & Spacing

A 12-column responsive fluid grid on desktop transitioning to a 4-column structure on mobile. Generous vertical breathing room anchors the editorial tavern aesthetic, ensuring food photography and event listings don't feel cluttered.

### Responsive Behaviors
- **Desktop (1024px+):** Max layout container capped at 1280px with 48px outer canvas margins (`margin: 3rem`) and 24px column gutters (`gutter: 1.5rem`). Menu grids span 2 or 3 columns; calendar showcases operate in 2-column card sequences.
- **Tablet (768px – 1023px):** 8-column layout, 32px canvas margins, menu showcases reflow into 2-column alternating blocks.
- **Mobile (<768px):** 4-column layout, 20px outer canvas margins (`margin-mobile: 1.25rem`) and 16px gutters (`gutter-mobile: 1rem`). Menu items, daily specials, and hours collapse into full-width stacked cards.

## Elevation & Depth

Visual hierarchy does not rely on sterile gray dropshadows; rather, it uses ambient warmth, tonal layering, and hairline low-contrast borders inspired by dim back-bar lighting.

### Surface Tiers & Depth Metaphors
- **Level 0 (Canvas):** `#121110`. Deep matte finish with no cast light.
- **Level 1 (Card & Content Blocks):** `#1A1816` bound by a 1px border of `#2F2B26`. Provides clean contrast against food photography and dark typography blocks.
- **Level 2 (Active/Hovered Containers):** `#22201D` bordered by `#3D3832`. Augmented with an ambient warm amber glow: `box-shadow: 0 10px 30px -10px rgba(217, 130, 43, 0.18)`.
- **Level 3 (Sticky Elements & Modals):** `#1A1816` with a frosted backdrop filter (`backdrop-filter: blur(12px)`) and a bottom border of `#3D3832` to elevate navigation bars above scrollable content.
- **High-Impact Glows:** Primary CTA buttons and live event chips emit a localized neon reflection: `0 0 20px rgba(217, 130, 43, 0.35)`.

## Shapes

The design system adopts a **Soft (Level 1)** geometric form language. In accordance with this style:
- Standard cards, interactive controls, inputs, and image viewports use `0.25rem` (4px) rounded corners.
- Larger modular containers, hero feature frames, and event calendar wrappers use `rounded-lg` at `0.5rem` (8px).
- Modal backdrops and focal cards scale to `rounded-xl` at `0.75rem` (12px).
- Pill badges and stamps (e.g. status tags, hours indicators, day tags) are full pill radius (`9999px`) to create geometric contrast against the architectural, sharp corners of the menu cards and photo frames.

## Components

### Buttons & CTAs
- **Primary CTA ("Order Online (Toast)"):** Solid background in Bourbon Amber (`#D9822B`), font `Manrope` 700, text `#121110`. Subtle hover shift to `#E59838` with an amber ambient halo (`box-shadow: 0 4px 20px rgba(217, 130, 43, 0.4)`).
- **Secondary CTA ("View Menu", "Reserve"):** Ghost button with 1px border in `#3D3832`, text in Warm Cream (`#F5F2EB`). On hover, background shifts to `#22201D` and border illuminates to `#D9822B`.
- **Icon / Pagination Arrows:** 36x36px squares with 4px border-radius, 1px border in `#2F2B26`, cream arrows, subtle transition to amber border on hover.

### Badges, Stamps & Chips
- **Collegiate / Location Stamp:** JetBrains Mono uppercase, letter-spacing `0.15em`, enclosed in a 1px border pill with background `rgba(217, 130, 43, 0.08)`, border `#D9822B`, and text `#D9822B`.
- **Status Indicator ("Open Daily · Across from EMU"):** Live status pill featuring an active green pulsating dot (`#22C55E`), background `#1A1816`, border `#2F2B26`.
- **Day & Genre Pills:** Event badges in weekly lineups display the day (e.g. "MONDAY") in a high-contrast `#2F2B26` background pill with `#F5F2EB` text, paired with an optional Cardinal Red (`#E03A2F`) dot for live stage acts.

### Menu Item Showcase Cards
- **Card Anatomy:** Dark surface (`#1A1816`), 1px border (`#2F2B26`), containing high-resolution food/drink imagery with a 4px corner radius.
- **Header Row:** Item name in Playfair Display (`#F5F2EB`), aligned with a monospace price badge (`#D9822B`) in bold Manrope.
- **Description:** Ingredients and preparation details set in Manrope body-sm (`#A8A196`).
- **Footer Trigger:** Direct Toast POS order trigger link with subtle right-arrow interaction.

### Weekly Event Calendar Module
- Split-row card structure highlighting event name (Playfair Display), date/time in JetBrains Mono (`#D9822B`), brief narrative description, and accompanying photography thumbnail. Divider lines between days use hairline `#2F2B26`.

### Hours & Location Consolidated Module
- Multi-column grid containing hours, physical address (705 W. Cross St., Ypsilanti, MI), parking tips for EMU visitors, and an interactive direct dial phone anchor (`734-905-7051`) rendered in Bourbon Amber.