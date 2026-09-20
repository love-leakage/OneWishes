# Design System

## Style
"Text-first, black & white" — bold typographic/editorial (Swiss poster
influence). No illustration, no color accent, no icons. The words are the
visual.

## Typography
- Display/headlines: Fraunces (weight 900 for hero, mixed with italic light
  for emphasis words)
- Body/UI: Inter

## Colors
- Black: #0A0A0A
- White: #FAFAF8
- Grey 1 (dark UI text on white): #1A1A1A
- Grey 2 (muted body text): #5C5C58
- Grey 3 (faint numerals/labels): #B8B8B2
No other colors — strictly monochrome.

## Layout
Single-column, left-aligned, generous whitespace. Tiers shown as numbered
text rows (01/02/03), not cards or icons.

## Motion Principles
- One orchestrated hero reveal (staggered text rise), nothing scattered.
- Transform/opacity only, respects `prefers-reduced-motion`.
- View-wish screen inverts to black background / white text for contrast.

## Buttons
- Solid: black background, white text
- Outline: transparent, black border, inverts on hover

## Reliability requirements
- Site must never hard-crash on a network hiccup — Supabase client init and
  all reads/writes are wrapped in try/catch with a visible error message
  instead of a silent failure or blank screen.
- An offline banner appears if the browser goes offline.

