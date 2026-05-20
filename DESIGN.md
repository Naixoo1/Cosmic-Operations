---
name: Orbital Command Interface
colors:
  surface: '#0f131d'
  surface-dim: '#0f131d'
  surface-bright: '#353944'
  surface-container-lowest: '#0a0e18'
  surface-container-low: '#171b26'
  surface-container: '#1c1f2a'
  surface-container-high: '#262a35'
  surface-container-highest: '#313540'
  on-surface: '#dfe2f1'
  on-surface-variant: '#bbc9c7'
  inverse-surface: '#dfe2f1'
  inverse-on-surface: '#2c303b'
  outline: '#869491'
  outline-variant: '#3c4947'
  surface-tint: '#5adace'
  primary: '#6feee1'
  on-primary: '#003733'
  primary-container: '#4fd1c5'
  on-primary-container: '#005750'
  inverse-primary: '#006a63'
  secondary: '#ffb866'
  on-secondary: '#482900'
  secondary-container: '#955b01'
  on-secondary-container: '#ffe3c9'
  tertiary: '#7ef0a7'
  on-tertiary: '#00391d'
  tertiary-container: '#62d38e'
  on-tertiary-container: '#005930'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#79f7ea'
  primary-fixed-dim: '#5adace'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#00504a'
  secondary-fixed: '#ffddba'
  secondary-fixed-dim: '#ffb866'
  on-secondary-fixed: '#2b1700'
  on-secondary-fixed-variant: '#673d00'
  tertiary-fixed: '#88f9b0'
  tertiary-fixed-dim: '#6bdc96'
  on-tertiary-fixed: '#00210f'
  on-tertiary-fixed-variant: '#00522c'
  background: '#0f131d'
  on-background: '#dfe2f1'
  surface-variant: '#313540'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  data-lg:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.4'
  data-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.2'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin: 24px
  panel-padding: 12px
---

## Brand & Style

This design system is engineered for high-stakes astronomical simulation, prioritizing functional clarity over decorative flair. The aesthetic is inspired by NASA mission control centers and professional telescope software, aiming for an atmosphere of scientific authority and operational focus.

The design style leans heavily into **Minimalist Modernism** with a **Technical/Scientific** overlay. It utilizes a strict grid-based arrangement to handle high data density, ensuring that users can parse complex orbital mechanics without visual fatigue. The emotional goal is to make the user feel like a calm, capable director of a multi-billion dollar space asset. All elements are designed with a "utility-first" mindset, avoiding neon glows or cyberpunk tropes in favor of crisp edges, subtle borders, and intentional use of negative space.

## Colors

The palette is anchored by deep space neutrals to minimize eye strain during long-duration sessions. 

- **Primary (#4FD1C5):** Reserved for data paths, active orbital trajectories, and primary call-to-action elements.
- **Secondary (#F6AD55):** A functional amber used exclusively for cautionary data, orbital decay warnings, and system alerts.
- **Tertiary (#48BB78):** Used for mission success indicators and stable system status.
- **Surface & Neutrals:** Backgrounds utilize a deep navy-charcoal gradient to provide perceived depth without distracting from the UI overlay. Surfaces use a slightly lighter value to define modular panels.

## Typography

This design system employs a dual-font strategy to differentiate between narrative instruction and technical telemetry. 

**Inter** provides high legibility for menus, headers, and descriptions. Its neutral character ensures that the UI feels contemporary and professional.

**JetBrains Mono** is the workhorse for all numerical output and system parameters. The monospaced nature allows for "tabular figures," ensuring that numbers don't jump or jitter when telemetry values update rapidly. 

For mobile devices, `headline-lg` should scale down to 24px, while `data-sm` remains at 12px to maintain technical readability.

## Layout & Spacing

The layout follows a **Fixed Grid** model, emulating the static nature of physical flight consoles. The screen is divided into a 12-column grid with strict 16px gutters.

- **Modular Panels:** Content is organized into self-contained "Modules." Each module should snap to the grid.
- **Data Density:** Spacing is tight (utilizing a 4px base unit) to maximize the information visible on a single screen, typical of professional monitoring software.
- **Hierarchy of Space:** Use 24px margins for the primary viewport edge, while internal module padding is kept at a compact 12px to maintain the "instrument" feel.

## Elevation & Depth

In a scientific interface, depth is used to indicate priority and focus rather than physical layering.

- **Tonal Separation:** We avoid shadows entirely to maintain a flat, professional aesthetic. Depth is achieved by placing `#161B26` surfaces against the `#0B0F19` background.
- **Low-Contrast Outlines:** Every card or interactive panel is defined by a 1px solid border (#2D3748). This creates a "latched" look, as if components are part of a unified physical dashboard.
- **Interactive States:** Hovering over an element should not raise it (no shadow), but rather change the border color to the primary teal (#4FD1C5) or increase the background luminosity slightly.

## Shapes

The shape language is disciplined and geometric. 

- **Soft Edges (4px):** All panels and buttons use a subtle 0.25rem corner radius. This prevents the UI from feeling dangerously sharp or "brutalist" while maintaining a more professional appearance than fully rounded consumer apps.
- **Clipped Corners:** For decorative elements or specialized data readouts, 45-degree clipped corners (dog-ears) can be used sparingly to reinforce the aerospace aesthetic.

## Components

### Buttons
Buttons are strictly rectangular with 4px corners. 
- **Primary:** Solid teal (#4FD1C5) with black text for high contrast.
- **Ghost:** 1px teal border with teal text.
- **Action Labels:** Use `label-caps` typography for button text to enhance the "control panel" feel.

### Data Cards
Modules for telemetry should feature a 24px header bar in a slightly lighter grey (#2D3748) with the title set in `label-caps`. The body of the card should use `data-lg` for the primary metric and `data-sm` for secondary metadata.

### Input Fields
Inputs are dark-filled rectangles with a 1px border. When focused, the border glows with a subtle primary teal. All text within inputs must use the monospaced font family to match the telemetry style.

### System Indicators
Use small, circular "LED" icons for status. 
- **Active:** #4FD1C5
- **Warning:** #F6AD55
- **Stable/Success:** #48BB78
These should have a 2px inner glow of the same color to simulate a powered light source.

### Telemetry Lists
Lists of orbital data should use alternating row highlights (Zebra striping) using a 2% opacity white overlay to aid horizontal eye tracking across dense rows of data.