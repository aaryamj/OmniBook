---
name: OmniBook Superadmin
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#00668a'
  on-secondary: '#ffffff'
  secondary-container: '#40c2fd'
  on-secondary-container: '#004d6a'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#111c2d'
  on-tertiary-container: '#79849a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#7bd0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#d8e3fb'
  tertiary-fixed-dim: '#bcc7de'
  on-tertiary-fixed: '#111c2d'
  on-tertiary-fixed-variant: '#3c475a'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  sidebar-width: 280px
  container-max: 1440px
  gutter: 1.5rem
  margin-mobile: 1rem
  stack-compact: 0.5rem
  stack-default: 1rem
---

## Brand & Style

The design system is engineered for the "God Mode" experience of platform administrators. It transitions from the standard enterprise environment into a high-authority, data-dense interface that prioritizes rapid monitoring and global control. 

The aesthetic is **Corporate Modern** with a **Technical Edge**. It utilizes a deep slate core (#0F172A) to establish a distinct "command center" atmosphere, separating the Superadmin experience from standard user views. High-contrast data visualization and neon-blue accents ensure that critical system status indicators are immediately legible against the dark, authoritative backdrop. The emotional response is one of total control, precision, and institutional reliability.

## Colors

This design system utilizes a hybrid color strategy. While the global background remains a clean, high-contrast light neutral for readability of dense SaaS data, the navigation and command surfaces use the primary deep slate (#0F172A).

- **Primary (#0F172A):** Used for the sidebar, headers, and primary branding elements to establish authority.
- **Secondary (#38BDF8):** A neon-blue "Sky" accent used exclusively for active states, primary actions, and critical system paths.
- **Tertiary (#1E293B):** Used for secondary navigation tiers and hovered states within dark UI regions.
- **Neutral (#F8FAFC / #FFFFFF):** The canvas for data tables and management modules, ensuring maximum contrast with dark text.
- **Success/Warning/Critical:** Standard utility colors are boosted in saturation to remain visible against both light and dark backgrounds.

## Typography

The typography system relies on **Inter** for its neutral, systematic utility. For the Superadmin context, font weights are slightly heavier to maintain presence against dark backgrounds. 

A supplementary monospace font (JetBrains Mono) is introduced for technical data strings, IDs, and system logs to assist in rapid scanning of dense SaaS metrics. Headlines use tight letter-spacing for a modern, "locked-in" feel, while labels use expanded tracking and uppercase styling for clear section categorization in the sidebar and table headers.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. The sidebar is a fixed 280px width, rendered in the primary dark slate. The main content area is a fluid grid that expands to a maximum of 1440px to prevent excessive line lengths on ultra-wide monitors used by admins.

Spacing is tighter than the standard Enterprise version to allow for "at-a-glance" monitoring.
- **Desktop:** 12-column grid with 24px gutters.
- **Tablet:** 8-column grid with 16px gutters; sidebar collapses to an icon-only rail.
- **Mobile:** Single column with 16px margins; sidebar moves to a full-screen overlay.

## Elevation & Depth

This design system uses **Tonal Layers** rather than heavy shadows to maintain a "flat but layered" professional look.

- **Level 0 (Base):** The main content background (#F8FAFC).
- **Level 1 (Cards):** Pure white (#FFFFFF) with a 1px solid border (#E2E8F0). No shadow.
- **Level 2 (Dropdowns/Modals):** Pure white with a subtle, low-opacity ambient shadow (10% opacity Primary color) to indicate temporary overlay.
- **The Sidebar:** Treated as a recessed "Command Zone." It uses internal depth, where active menu items are inset with a subtle glow from the neon-blue accent.

## Shapes

The shape language is **Soft (0.25rem)**. This keeps the interface feeling professional and efficient without the playfulness of fully rounded corners. 

- **Small elements:** Buttons and input fields use 4px (0.25rem) radius.
- **Large elements:** Data cards and containers use 8px (0.5rem) radius.
- **Indicators:** Active state markers in the sidebar use a "pill" shape on the left vertical edge to create a sharp, directional focus.

## Components

### Buttons
- **Primary:** Background #0F172A, Text #FFFFFF. On hover, background shifts to #1E293B.
- **Action (Neon):** For global "Apply" or "Live" actions, use #38BDF8 with Primary text.
- **Ghost:** Transparent background, 1px border #E2E8F0.

### Sidebar Nav
- **Inactive:** Text #94A3B8 on #0F172A background.
- **Active:** Text #FFFFFF, Background #1E293B, with a 4px vertical neon-blue (#38BDF8) strip on the left edge.

### Data Tables
- **Header:** Background #F1F5F9, Uppercase Label-MD typography.
- **Rows:** 1px bottom border #F1F5F9. High-density padding (12px vertical).
- **Hover State:** Row background shifts to #F8FAFC.

### Status Chips
- **System Live:** Soft green background, dark green text, 4px radius.
- **Alert:** Soft red background, dark red text.
- All chips should use Mono-Data typography for status codes.

### Inputs
- **Search:** Dark-themed search bars when in the header (Primary background), light-themed with #E2E8F0 borders when in the content area.