# Proxypaw

Verified neighbours for dog walks, cat home visits and overnight boarding, inside
gated communities in Gachibowli, Hyderabad.

Live: <https://www.proxypaw.com>

## Stack

| Layer | What |
|---|---|
| Frontend | React 18 + Vite 6 + Tailwind v4, shadcn/ui components |
| Type | Sora (headings) · Outfit (body) |
| Backend | Supabase edge function `make-server-0cfbd72b` (Deno + Hono) |
| Hosting | Vercel — `proxypaw` project |

## Running locally

```bash
npm install
npm run dev     # http://localhost:5173
```

`npm run build` produces the static `dist/` that Vercel serves.

## Layout

```
src/app/App.tsx              screen switcher (all routing is one useState)
src/app/components/
  LandingPage.tsx            marketing home — built from the Claude Design artifact
  BlogPage.tsx               The Paw Journal index
  Dashboard, BookingPage, PaymentScreen, VolunteerList, ...
  ui/                        shadcn/ui primitives
src/app/supabase/functions/  Deno edge function source (deployed separately)
src/styles/globals.css       design tokens — the palette lives here
design/ProxyPaw.dc.html      source design artifact
```

## Design tokens

The whole palette is CSS custom properties at the top of `src/styles/globals.css`.
Changing `--primary`, `--background` etc. re-skins every screen at once.

Core values: cream `#f6f1e7` · ink `#2a2118` · orange `#e0662f` · forest `#3f6c51` · gold `#f0b429`

## Known follow-ups

- **Photos are placeholders.** The design artifact's images were browser `blob:`
  URLs and could not be recovered. Swap the `IMAGES` block at the top of
  `LandingPage.tsx` and `POSTS[].img` in `BlogPage.tsx` for real assets.
- **Google Maps key is hardcoded** in `components/GoogleMapView.tsx` and ships to
  the browser. It needs an HTTP-referrer restriction in Google Cloud Console.
- **No URL routing.** All 19 screens sit behind one `useState`, so no page is
  directly linkable and the back button doesn't work. Worth moving to React Router.
