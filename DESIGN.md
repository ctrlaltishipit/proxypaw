# ProxyPaw Design System: "Garden Community"

Format follows VoltAgent/awesome-design-md. One system for the marketing site, the in-app mockups
(`src/mobile/screens.tsx`) and every future page.

## Overview

ProxyPaw is neighbours caring for each other's pets inside Hyderabad gated communities. The look is a
morning walk on the community lawn: fresh leaf greens, open sky, warm sun, the ProxyPaw marigold-orange
as the one call to action. Browns are gone except **soil brown**, used only for earth in illustrations.
Pages feel light, airy and calm; motion feels like life in a garden (swaying trees, a dog trotting,
towers rising), never flashy.

Two rules hold the whole site together:
1. **Green is a tint, never a block.** Green appears as light seen through glass (8–18% leaf over white
   or canvas), as text, and inside the garden itself. There are no solid dark-green bands, tiles or pills.
   The garden (the 3D world, photographs) is where green is allowed to be lush.
2. **The page is a walk.** The home page is read as a walk with stops (see "The walk"); the same words
   ("stop", "walk", "track") are used in the scroll bar, the section kickers and the 3D community.

## Colors

### Brand & Accent
| Token | Hex | Use |
|---|---|---|
| marigold | `#E0662F` | Primary CTA, brand mark, key numbers. The one loud colour |
| marigold-dark | `#C24E1D` | CTA hover, links on light ground |
| leaf | `#2E7D4F` | Secondary actions, success, "verified", section eyebrows |
| leaf-bright | `#6BB47C` | Live dots, progress bars, illustrations (softened Nov 2026) |
| leaf-glass | `rgba(46,125,79,.10)` | Tinted fills: notes, chips, the stop pill |
| leaf-glass-2 | `rgba(46,125,79,.18)` | Selected tab or tile, with a `rgba(46,125,79,.32)` hairline |
| sun | `#F0B429` | Highlights, "popular" badges, paw points |

### Surface
| Token | Hex | Use |
|---|---|---|
| canvas | `#F4F8EF` | Page ground (garden mist) |
| canvas-2 | `#FBFDF8` | Raised light bands, text on dark |
| surface | `#FFFFFF` | Cards, modals |
| leaf-pale | `#EDF6EA` | Chips, soft bands |
| band | `#EFF5EB` | Alternating section ground |
| sky | `#DCEFF6` | Sky in scenes, info chips |
| sage | `#E2EFDD` → `#EAF3E6` | Footer band (light; ink text) |
| charcoal | `#30353A` | The jogging track only (scroll bar, walk tracker, 3D community), always with white stripes |

### Hairlines & Borders
`#E1ECDC` cards, `#D8E8D2` bands, `#C9DCC4` outline buttons, `#CFE5CB` green chips.

### Text
ink `#14301F` · sub `#3F5547` · muted `#5E7266` · muted-2 `#7C8F83`. Ink is for text only, never a fill.
White text appears only on photographs (over a scrim) and on the marigold button.

### Illustration only
soil `#7A5230`, grass `#A3D491`, lawn `#D3E9C6` (2D maps), deep leaf `#1F6B3A`, golden canopy `#F3CF5F`, tower cream `#F3EFE6`, tower shade `#DCD6C8`,
window glow `#FFD978`, water `#9ED6EA`.

### Scrim
`rgba(20,48,31,.55)` modal backdrop; photo scrims fade from transparent to at most `.74` behind text.

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
- Blocks reveal once on scroll: fade, a short travel and a blur that clears. Paired columns arrive from
  the left and the right, photo tiles zoom in (`<Reveal from="left|right|zoom">`). On phones the blur and
  sideways travel are dropped.
- Blocks you have finished reading fade and shrink slightly as they leave under the header (CSS scroll
  timelines, where supported; nothing happens elsewhere).
- Chapters are **sheets**: each section has a rounded top (`--pp-r`) and slides over the one before it.
- All of it is disabled under `prefers-reduced-motion`.
- Hover: buttons lift 1-2px, cards lift 2px, photos zoom 1.03 inside their frame.
- Illustrations: towers rise from the ground, trees sway 4-7s, dog trots along paths. Loops longer than
  5s have a pause control or stop on reduced motion.

## Components
- **Buttons are glass** (`.pp-glass-btn` in `src/styles/fonts.css`): translucent white pill, blur, inner
  highlight, springy hover (`cubic-bezier(.34,1.56,.64,1)`) and a squish on press.
  `.pp-glass-primary` is the marigold version (the one CTA colour); `.pp-glass-dark` sits on photos.
- **No icons in front of words.** Nav items, chips, buttons, list items and badges are words only.
  No arrows after labels either. Numbers ("01") are fine as step markers.
- **Nav**: a glass capsule; the current page is a tinted leaf-glass pill with leaf text, never an
  underline and never a solid green pill.
- **Selected state** (tabs, price tiles): leaf-glass-2 fill, leaf hairline and a soft 4px halo. Ink text.
- **Chip**: soft glass ground, leaf text, no dot.
- **Card**: white, 1px `#E1ECDC`, radius 24. Glass cards (white 62–82% + blur) sit over the 3D world.
- **Footer**: a light sage band under a pale skyline, ink text, leaf column titles, plain links to
  "Terms and conditions" and "Privacy note".
- **Stop pill** (`.pp-stop`): "Stop 3 of 8" in front of a section kicker; leaf-glass until the walkers
  reach it, then marigold-pale with a small stamp animation.

## The walk (how the home page is gamified)
`landing/Trail.tsx`. A glass bar pinned to the bottom of the home page carries a charcoal jogging track
with white stripes. As the visitor scrolls, **Biscuit** (golden dog, marigold harness) and **Lily**
(ginger tabby) walk to the right along it, chasing a marigold ball stamped with the ProxyPaw paw. They
turn round when the visitor scrolls back.
- Eight stops, one per chapter: Why, Community, How, 3D visit, The app, Prices, Perks, Home. `STOPS` in
  `Trail.tsx` is the single list; section ids must match it.
- Reaching a stop collects it: the dot fills, the counter ticks up, the section's stop pill lights, and
  a glass card shows the one line that chapter teaches. Read in order, the eight lines explain ProxyPaw.
- The last stop shows a "Walk complete" card with the founding offer already stated on the page.
- The bar tucks away while someone is playing inside a chapter marked `quiet` (the 3D world), near the
  footer, and when hidden by the visitor; a small tab brings it back. Stops are buttons (keyboard and
  screen-reader reachable); the walkers are decorative.
- Cards sit bottom-right on desktop and bottom-centre on phones so they never cover the column being read.
- New chapters: add the section id to `STOPS`, give its `Heading` a `stop` prop, keep labels to one or
  two words, and keep the takeaway to one factual line that is already true elsewhere on the page.

## Interactive worlds
- **3D community** (`landing/CommunityWorld.tsx`, three.js, lazy-loaded): ten towers laid out from a
  published master plan, ring road, a charcoal jogging track with white stripes, pools, clubhouse, pet garden. Real swaying grass
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
