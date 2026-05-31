---
name: OmniBook Enterprise
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#434654'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#737686'
  outline-variant: '#c3c5d7'
  surface-tint: '#1353d8'
  primary: '#003fb1'
  on-primary: '#ffffff'
  primary-container: '#1a56db'
  on-primary-container: '#d4dcff'
  inverse-primary: '#b5c4ff'
  secondary: '#53606c'
  on-secondary: '#ffffff'
  secondary-container: '#d6e4f3'
  on-secondary-container: '#586672'
  tertiary: '#005438'
  on-tertiary: '#ffffff'
  tertiary-container: '#006f4b'
  on-tertiary-container: '#68f5b8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b5c4ff'
  on-primary-fixed: '#00174d'
  on-primary-fixed-variant: '#003dab'
  secondary-fixed: '#d6e4f3'
  secondary-fixed-dim: '#bac8d6'
  on-secondary-fixed: '#0f1d27'
  on-secondary-fixed-variant: '#3b4854'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.5rem
  sm: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The design system is engineered for high-stakes enterprise scheduling and appointment management. It prioritizes **clarity, efficiency, and reliability**. The aesthetic leans into a refined **Corporate/Modern** style, utilizing generous whitespace to reduce cognitive load in data-dense environments. 

The emotional response should be one of "effortless control." By avoiding harsh borders and cluttered layouts, the UI feels expansive and professional. The interplay of soft blues and crisp whites establishes a calm atmosphere, essential for users managing complex calendars and high volumes of client data.

## Colors
This design system utilizes a hierarchical color strategy to guide user intent:
- **Primary (Ocean Blue):** Reserved for headers, navigation states, and primary brand indicators. It conveys authority and trust.
- **Secondary (Soft Blue):** Used for card backgrounds, subtle hover states, and grouping related information without creating visual noise.
- **Tertiary (Success Green):** Strictly for final Action CTAs (Save, Confirm, Book) and positive status indicators.
- **Neutral:** A range of grays used for body text, icons, and metadata to maintain high legibility against the white base.

## Typography
The typography system uses **Inter** for core UI and body copy due to its exceptional legibility and systematic feel. **Geist** is introduced for labels and technical data to provide a sharp, developer-grade precision to the appointment metrics and timestamps. 

Hierarchy is established through weight and optical sizing rather than dramatic color shifts. For enterprise scalability, line heights are kept generous (1.5x for body) to ensure readability during prolonged usage.

## Layout & Spacing
The design system employs a **12-column fluid grid** for desktop and a **4-column grid** for mobile. Separation is achieved through a strict spacing scale rather than lines. 

- **Containers:** Content is housed in cards with `1.5rem` (24px) internal padding.
- **Section Spacing:** Use `3rem` (48px) to separate major vertical modules.
- **Alignment:** All elements must snap to a 4px baseline grid to ensure mathematical harmony across custom dashboard widgets.
- **Breakpoints:** Mobile (<600px), Tablet (600px - 1024px), Desktop (>1024px).

## Elevation & Depth
Depth is created through **Tonal Layers** combined with **Ambient Shadows**. Instead of traditional borders, surfaces use elevation to indicate interactivity:

- **Level 0 (Background):** Crisp White (#FFFFFF).
- **Level 1 (Cards):** Soft Blue (#E1EFFE) or White with a 1px inner stroke of 5% black.
- **Shadows:** Use ultra-soft, diffused shadows. For example: `0 4px 20px rgba(26, 86, 219, 0.05)`. The tint should be a fraction of the primary Ocean Blue to keep shadows feeling "airy" rather than muddy.
- **Interactive Depth:** On hover, cards should lift slightly (increase shadow spread) rather than changing background color.

## Shapes
The shape language is approachable yet structured. The design system standardizes on a **0.75rem (12px) to 1rem (16px)** corner radius for all primary containers and buttons. 

- **Standard Buttons:** 12px corner radius.
- **Main Content Cards:** 16px corner radius.
- **Input Fields:** 8px corner radius to maintain a slightly firmer, more functional appearance.
- **Selection Chips:** Full pill-shape for maximum contrast against rectangular data cells.

## Components
- **Buttons:** Primary buttons use Ocean Blue with white text. Success CTAs use Success Green. All buttons utilize a 12px radius and subtle shadow.
- **Cards:** The core of the system. Cards must have 24px padding and a 16px radius. No borders; use the Soft Blue (#E1EFFE) as a background for secondary information blocks.
- **Input Fields:** White background with a 1px border in a light neutral gray. Focus state should use an Ocean Blue 2px outer glow.
- **Lists:** Use "Zebra" striping with Soft Blue at 30% opacity instead of horizontal dividers.
- **Calendar Widgets:** Use Ocean Blue for the current day/selection and Success Green for available "Open" slots.
- **Chips/Status:** Use Soft Blue backgrounds with Ocean Blue text for "Pending," and light green backgrounds with Success Green text for "Confirmed."