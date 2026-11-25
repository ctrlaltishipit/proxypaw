# ProxyPaw Design System: "Garden Community"

Format follows VoltAgent/awesome-design-md. One system for the marketing site, the in-app mockups
(`src/mobile/screens.tsx`) and every future page.

## Overview

ProxyPaw is neighbours caring for each other's pets inside Hyderabad gated communities. The look is a
morning walk on the community lawn: fresh leaf greens, open sky, warm sun, the ProxyPaw marigold-orange
as the one call to action. Browns are gone except **soil brown**, used only for earth in illustrations.
Pages feel light, airy and calm; motion feels like life in a garden (swaying trees, a dog trotting,
towers rising), never flashy.

## Colors

### Brand & Accent
| Token | Hex | Use |
|---|---|---|
| marigold | `#E0662F` | Primary CTA, brand mark, key numbers. The one loud colour |
| marigold-dark | `#C24E1D` | CTA hover, links on light ground |
| leaf | `#2E7D4F` | Secondary actions, success, "verified", section eyebrows |
| leaf-bright | `#49A85A` | Live dots, progress, illustrations |
| sun | `#F0B429` | Highlights, "popular" badges, paw points |

### Surface
| Token | Hex | Use |
|---|---|---|
| canvas | `#F4F8EF` | Page ground (garden mist) |
| canvas-2 | `#FBFDF8` | Raised light bands, text on dark |
| surface | `#FFFFFF` | Cards, modals |
| leaf-pale | `#E7F4E4` | Chips, soft bands |
| band | `#EAF3E4` | Alternating section ground |
| sky | `#DCEFF6` | Sky in scenes, info chips |
| forest | `#14301F` | The one dark band (pricing, footer) |

### Hairlines & Borders
`#E1ECDC` cards, `#D8E8D2` bands, `#C9DCC4` outline buttons, `#CFE5CB` green chips.

### Text
ink `#14301F` · sub `#3F5547` · muted `#5E7266` · muted-2 `#7C8F83` · on-dark `#B9D3C0`.

### Illustration only
soil `#7A5230`, grass `#8BC34A`, deep leaf `#1F6B3A`, tower cream `#F3EFE6`, tower shade `#DCD6C8`,
window glow `#FFD978`, water `#9ED6EA`.

### Scrim
`rgba(20,48,31,.55)` modal backdrop; photo scrims fade from transparent at 42% to `.86` at the bottom.

## Typography

### Font Family
- Headings: **Plus Jakarta Sans** 600-800, letter-spacing -0.02em.
- Body and UI: **Inter** 400-600.
- Handwritten notes only (post-its, founder signature): Caveat.

### Hierarchy
| Role | Size | Weight |
|---|---|---|
| Display (hero h1) | clamp(40px, 5.6vw, 72px), line-height 1.02 | 800 |
| h2 | clamp(30px, 3.6vw, 48px), line-height 1.08 | 700 |
| h3 / card title | 18-22px | 700 |
| Body | 16-18px, line-height 1.6 | 400 |
| Small / meta | 13-14px | 500 |
| Eyebrow | 12.5px, 0.14em tracking, uppercase, leaf | 700 |

## Layout
- Max content width 1200px, side padding clamp(18px, 3vw, 28px), equal left and right edges.
- Section rhythm clamp(64px, 9vw, 120px). Grid gap clamp(14px, 1.8vw, 20px).
- Radius: cards 24px, photos 28px, chips and buttons pill (999px).

## Elevation
Soft, green-tinted shadows only: `0 18px 44px rgba(28,60,40,.12)` cards, `0 30px 70px rgba(28,60,40,.18)`
hero media. No brown shadows.

## Motion
- Hero enters once on load (fade + 16px rise, staggered 80ms).
- Sections reveal once on scroll (fade + rise); never on every card twice; all disabled under
  `prefers-reduced-motion`.
- Hover: buttons lift 1-2px, cards lift 2px, photos zoom 1.03 inside their frame.
- Illustrations: towers rise from the ground, trees sway 4-7s, dog trots along paths. Loops longer than
  5s have a pause control or stop on reduced motion.

## Components
- **Primary button**: marigold pill, white text, `0 12px 28px rgba(224,102,47,.3)`.
- **Secondary button**: white pill, 1.5px `#C9DCC4` border, ink text.
- **Chip**: leaf-pale ground, leaf text, live dot.
- **Card**: white, 1px `#E1ECDC`, radius 24.
- **Dark band**: forest ground, canvas-2 text, sun highlights.

## Imagery
- Real-looking photographs of Hyderabad gated communities (generated with the realistic-visuals skill;
  illustrative, never presented as real customers) in `public/real/`.
- Custom SVG scenes for the hero (rising towers), the walk simulator (community map) and cat visits.
- No text, logos or real brand marks inside any image.

## Content rules
- No invented stats, reviews or customers on the marketing site. Sample names live only inside app
  mockups and the walk demo, labelled as a demo.
- Community names are inspiration ("built for communities like ..."), never a claim of partnership.
