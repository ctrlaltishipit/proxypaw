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
- **Buttons are glass** (`.pp-glass-btn` in `src/styles/fonts.css`): translucent white pill, blur, inner
  highlight, springy hover (`cubic-bezier(.34,1.56,.64,1)`) and a squish on press.
  `.pp-glass-primary` is the marigold version (the one CTA colour); `.pp-glass-dark` sits on photos.
- **No icons in front of words.** Nav items, chips, buttons, list items and badges are words only.
  No arrows after labels either. Numbers ("01") are fine as step markers.
- **Nav**: a glass capsule; the current page is a leaf-green pill, never an underline.
- **Chip**: soft glass ground, leaf text, no dot.
- **Card**: white, 1px `#E1ECDC`, radius 24. Glass cards (white 62–82% + blur) sit over the 3D world.
- **Dark band**: forest ground, canvas-2 text, sun highlights.

## Interactive worlds
- **3D community** (`landing/CommunityWorld.tsx`, three.js, lazy-loaded): ten towers laid out from a
  published master plan, ring road, walking loop, pools, clubhouse, pet garden. Real swaying grass
  blades, layered planting, palms, flower beds on soil. Story cards play "the dog walk" and "the cat
  visit" inside a flat, then hand over a free walk with a checklist, photo updates and a payment
  summary. Always show the human, the dog and the leash together.
- **Inside the app** (`landing/AppWalkthrough.tsx`): the live app screens operated by a cursor.
  Auto-plays on the landing page; on `/tour` it is scroll-driven (phone pinned, text cards scroll,
  the cursor clicks the button that leads to the next screen).
- Everything respects `prefers-reduced-motion` and works by touch at phone width.

## Imagery
- Real-looking photographs of Hyderabad gated communities (generated with the realistic-visuals skill;
  illustrative, never presented as real customers) in `public/real/`.
- Custom SVG scenes for the hero (rising towers), the walk simulator (community map) and cat visits.
- No text, logos or real brand marks inside any image.

## Content rules
- No invented stats, reviews or customers on the marketing site. Sample names live only inside app
  mockups and the walk demo, labelled as a demo.
- Community names are inspiration ("built for communities like ..."), never a claim of partnership.
- The 3D model carries a line saying it is illustrative and not affiliated with the developer.
- Journal articles carry a date, cite their sources, and end with "general information, not veterinary advice".
