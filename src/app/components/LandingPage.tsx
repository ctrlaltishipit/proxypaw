/**
 * Landing page — built from the "Proxy Paw UI redesign" Claude Design artifact,
 * with a motion-and-rhythm pass on top:
 *  - one consistent spacing scale (SECTION_PAD / uniform GRID_GAP)
 *  - pricing split into two buckets: walks & home visits, overnight boarding
 *  - scroll reveals: cards pop in with stagger (IO-based, disabled under
 *    prefers-reduced-motion)
 *  - decorative SVG layer: drifting paw prints, soft colour blobs, a walking
 *    paw-trail divider between sections
 *  - real mobile breakpoints (nav, hero chips, pricing grids, full-width CTAs)
 *
 * Photos are stand-ins (the artifact's originals were blob: URLs) — swap in
 * IMAGES below.
 */
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

const IMAGES = {
  heroDog: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=1000&q=80&auto=format&fit=crop',
  heroCat: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400&q=80&auto=format&fit=crop',
  catChip: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=120&q=80&auto=format&fit=crop',
  walker: 'https://i.pravatar.cc/80?img=47',
  walks: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1000&q=80&auto=format&fit=crop',
  boarding: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1000&q=80&auto=format&fit=crop',
  ctaPuppy: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=240&q=80&auto=format&fit=crop',
};

const C = {
  cream: '#f6f1e7',
  ink: '#2a2118',
  orange: '#e0662f',
  orangeDark: '#c24e1d',
  card: '#fffdf8',
  cardBorder: '#eee3cf',
  muted: '#8b7a63',
  muted2: '#a08e73',
  sub: '#6f5f4b',
  green: '#3f6c51',
  greenPale: '#eef0e4',
  greenBorder: '#d9dec4',
  greenText: '#5a6b3f',
  dotGreen: '#7a9a4e',
  gold: '#f0b429',
  star: '#c9a227',
  band: '#f1eadb',
  bandBorder: '#e9ddc8',
  btnBorder: '#d9cbb2',
  peach: '#f9e7da',
  cream2: '#fdf9f0',
  darkSub: '#c9b799',
};

const sora = "'Sora', system-ui, sans-serif";
const shell: CSSProperties = { maxWidth: 1200, margin: '0 auto' };

/** One vertical rhythm for every section — the fix for uneven spacing. */
const SECTION_PAD = 'clamp(52px, 7vw, 88px)';
const SIDE_PAD = 'clamp(18px, 3vw, 28px)';
const GRID_GAP = 'clamp(14px, 1.8vw, 20px)';

const COMMUNITIES = [
  'My Home Bhooja', 'My Home Vihanga', 'My Home Avatar', 'My Home Abhra',
  'My Home Ankura', 'My Home Tarkshya', 'My Home Krishe', 'My Home Nishada',
  'My Home Sayuk', 'My Home Vipina', 'Aparna Sarovar Zenith',
  'Aparna Cyber Life', 'Aparna CyberZon', 'Aparna Luxor Park',
];

const STEPS = [
  {
    n: '1',
    title: 'meet your neighbours',
    body: 'Browse verified walkers, cat sitters and boarding hosts who live in your towers. Every profile is Aadhaar-checked and community-rated.',
  },
  {
    n: '2',
    title: 'book in 30 seconds',
    body: 'Pick a day, a time and a duration. Pay by UPI. Your sitter gets your pet’s quirks, routes and vet info automatically.',
  },
  {
    n: '3',
    title: 'watch the tail wag (or the slow blink)',
    body: 'Live GPS on every walk, photo updates from every visit and sleepover, and paw points on every booking.',
  },
];

/** Pricing, split into the two service buckets. */
const WALK_TIERS = [
  { label: '30 min walk', price: '₹149', note: 'perfect first trial', featured: false },
  { label: '1 hour walk', price: '₹249', note: 'most popular', featured: true },
  { label: '1.5 hour walk', price: '₹349', note: 'for the zoomies', featured: false },
  { label: '2 hour walk', price: '₹449', note: 'weekend best value', featured: false },
  { label: 'cat home visit', price: '₹129', note: 'feed, play, litter', featured: false },
];

const BOARDING_TIERS = [
  { label: 'dog boarding', price: '₹549', per: '/ night', note: 'sleepover at a vetted host', featured: true },
  { label: 'cat boarding', price: '₹449', per: '/ night', note: 'quiet homes, daily photos', featured: false },
  { label: 'extended stay', price: '₹499', per: '/ night', note: '5+ nights, dogs & cats', featured: false },
];

const POSTS = [
  {
    tag: 'grooming',
    img: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=900&q=80&auto=format&fit=crop',
    title: 'the apartment grooming guide for dogs & cats',
    body: 'Brushing beats bathing, monsoon coat care, and the nail-click rule every flat-dweller should know.',
  },
  {
    tag: 'cats',
    img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=900&q=80&auto=format&fit=crop',
    title: 'the indoor cat’s guide to a bigger life',
    body: 'Vertical territory, window theatre and scent games that turn a flat into a kingdom.',
  },
  {
    tag: 'walking',
    img: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=900&q=80&auto=format&fit=crop',
    title: 'walking do’s and don’ts in a gated community',
    body: 'Short leads in lobbies, the 7-second pavement test, and why sniffing beats marching.',
  },
];

/* ----------------------------- SVG bits ----------------------------- */

function PawSvg({ size = 24, color = '#fff', style }: { size?: number; color?: string; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style} aria-hidden="true">
      <ellipse cx="8.2" cy="7.4" rx="2.1" ry="2.9" />
      <ellipse cx="15.8" cy="7.4" rx="2.1" ry="2.9" />
      <ellipse cx="4.4" cy="12.2" rx="1.9" ry="2.5" />
      <ellipse cx="19.6" cy="12.2" rx="1.9" ry="2.5" />
      <path d="M12 11c3 0 5.6 2.4 5.9 5.3.2 2-1.3 3.7-3.3 3.7-1 0-1.8-.5-2.6-.5s-1.6.5-2.6.5c-2 0-3.5-1.7-3.3-3.7C6.4 13.4 9 11 12 11z" />
    </svg>
  );
}

function PawMark({ size, radius }: { size: number; radius: number }) {
  return (
    <span className="pp-logo" style={{ width: size, height: size, borderRadius: radius, background: C.orange, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
      <PawSvg size={size * 0.5} />
    </span>
  );
}

/** Hand-drawn squiggle underline for the hero accent, drawn in on load. */
function Squiggle() {
  return (
    <svg viewBox="0 0 220 14" aria-hidden="true" style={{ display: 'block', width: 'min(220px, 52vw)', marginTop: 6 }}>
      <path
        d="M3 9 C 30 3, 55 12, 82 7 S 135 3, 162 8 S 200 11, 217 6"
        fill="none" stroke={C.orange} strokeWidth="4" strokeLinecap="round" opacity=".85"
        style={{ strokeDasharray: 300, strokeDashoffset: 300, animation: 'pp-draw 1.1s .45s ease forwards' }}
      />
    </svg>
  );
}

/** A trail of paw prints padding across the page between sections. */
function PawTrail() {
  return (
    <div aria-hidden="true" style={{ display: 'flex', justifyContent: 'center', gap: 26, padding: '6px 0' }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className="pp-trail-paw" style={{ animationDelay: `${i * 0.18}s`, ['--r' as string]: `${i % 2 ? 14 : -14}deg` }}>
          <PawSvg size={15} color={C.muted2} style={{ opacity: 0.55 }} />
        </span>
      ))}
    </div>
  );
}

/** Soft colour blobs + drifting paws behind the hero. Pure decoration. */
function HeroDecor() {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', top: -140, right: -120, width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(224,102,47,.10), transparent 65%)' }} />
      <div style={{ position: 'absolute', bottom: -180, left: -140, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(63,108,81,.09), transparent 65%)' }} />
      {[
        { top: '12%', left: '4%', size: 26, rot: -18, dur: 9 },
        { top: '64%', left: '9%', size: 18, rot: 22, dur: 11 },
        { top: '26%', left: '46%', size: 20, rot: 8, dur: 10 },
        { top: '80%', left: '55%', size: 24, rot: -10, dur: 12 },
      ].map((p, i) => (
        <span key={i} style={{ position: 'absolute', top: p.top, left: p.left, transform: `rotate(${p.rot}deg)`, animation: `pp-floaty ${p.dur}s ease-in-out ${i * 0.7}s infinite` }}>
          <PawSvg size={p.size} color={C.orange} style={{ opacity: 0.08 }} />
        </span>
      ))}
    </div>
  );
}

/* --------------------------- scroll reveal --------------------------- */

function Reveal({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        ...style,
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(26px) scale(.975)',
        transition: `opacity .65s cubic-bezier(.16,1,.3,1) ${delay}ms, transform .65s cubic-bezier(.16,1,.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* --------------------------- pricing card --------------------------- */

interface Tier {
  label: string;
  price: string;
  per?: string;
  note: string;
  featured: boolean;
}

function TierCard({ t }: { t: Tier }) {
  return (
    <div
      className="pp-tier"
      style={{
        background: t.featured ? C.gold : 'rgba(253,249,240,.06)',
        border: `1px solid ${t.featured ? C.gold : 'rgba(253,249,240,.14)'}`,
        borderRadius: 18, padding: '18px 16px', height: '100%', boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {t.featured && (
        <span style={{ position: 'absolute', top: -10, right: 10, background: C.ink, color: C.gold, fontFamily: sora, fontWeight: 700, fontSize: 10, letterSpacing: '.06em', padding: '4px 10px', borderRadius: 999 }}>
          &#9733; POPULAR
        </span>
      )}
      <div style={{ fontSize: 12.5, color: t.featured ? 'rgba(42,33,24,.7)' : C.darkSub, marginBottom: 7 }}>{t.label}</div>
      <div style={{ fontFamily: sora, fontWeight: 800, fontSize: 'clamp(22px, 2vw, 26px)', letterSpacing: '-0.02em', color: t.featured ? C.ink : C.cream2 }}>
        {t.price}
        {t.per && <span style={{ fontSize: 12.5, fontWeight: 500, color: t.featured ? 'rgba(42,33,24,.65)' : C.darkSub, marginLeft: 3 }}>{t.per}</span>}
      </div>
      <div style={{ fontSize: 12, color: t.featured ? 'rgba(42,33,24,.7)' : C.darkSub, marginTop: 6, lineHeight: 1.4 }}>{t.note}</div>
    </div>
  );
}

/* ------------------------------ page ------------------------------ */

const eyebrow: CSSProperties = {
  fontSize: 13.5, fontWeight: 700, color: C.orange,
  letterSpacing: '0.13em', marginBottom: 12, fontFamily: sora,
};
const h2: CSSProperties = {
  fontFamily: sora, fontWeight: 800, letterSpacing: '-0.03em',
  lineHeight: 1.1, margin: 0,
};
const bucketHead: CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 10,
  fontFamily: sora, fontWeight: 700, fontSize: 15.5, color: C.cream2,
  margin: '0 0 14px',
};

interface LandingPageProps {
  /** Opens the waitlist modal. `source` records which CTA was clicked. */
  onJoin: (source: string) => void;
  onBlogClick: () => void;
  onTourClick: () => void;
}

export default function LandingPage({ onJoin, onBlogClick, onTourClick }: LandingPageProps) {
  return (
    <div style={{ minHeight: '100vh', background: C.cream, color: C.ink, overflowX: 'clip', textTransform: 'capitalize' }}>
      <style>{`
        @keyframes pp-fadeUp { from { opacity:0; transform:translateY(18px);} to {opacity:1;transform:translateY(0);} }
        @keyframes pp-floaty { 0%,100% { transform:translateY(0);} 50% { transform:translateY(-11px);} }
        @keyframes pp-pulse  { 0%,100% { opacity:1;} 50% { opacity:.35;} }
        @keyframes pp-drift  { from { transform:translateX(0);} to { transform:translateX(-50%);} }
        @keyframes pp-draw   { to { stroke-dashoffset: 0; } }
        @keyframes pp-wiggle { 0%,100% { transform:rotate(-6deg);} 50% { transform:rotate(8deg);} }
        @keyframes pp-step   { 0%,55%,100% { opacity:.55; transform:translateY(0) rotate(var(--r,0deg)); } 25% { opacity:1; transform:translateY(-5px) rotate(var(--r,0deg)); } }

        .pp-screen { animation:.5s cubic-bezier(.16,1,.3,1) both pp-fadeUp; }
        .pp-nav:hover { color:${C.orange} !important; }
        .pp-logo { transition: transform .3s; }
        .pp-brand:hover .pp-logo { animation: pp-wiggle .55s ease; }
        .pp-dark-btn:hover { background:${C.orange} !important; transform:translateY(-2px); }
        .pp-cta:hover { transform:translateY(-2px); box-shadow:0 18px 38px rgba(224,102,47,.42) !important; }
        .pp-ghost:hover { border-color:${C.orange} !important; color:${C.orange} !important; }
        .pp-step-card:hover { transform:translateY(-5px); box-shadow:0 18px 40px rgba(74,52,24,.10); }
        .pp-step-card:hover .pp-step-n { transform: rotate(-8deg) scale(1.08); }
        .pp-step-n { transition: transform .3s cubic-bezier(.16,1,.3,1); }
        .pp-service { transition: transform .4s cubic-bezier(.16,1,.3,1); }
        .pp-service:hover { transform:scale(1.015); }
        .pp-service img { transition: transform 6s ease; }
        .pp-service:hover img { transform: scale(1.06); }
        .pp-tier { transition: transform .25s, box-shadow .25s; }
        .pp-tier:hover { transform:translateY(-5px); box-shadow: 0 14px 30px rgba(0,0,0,.28); }
        .pp-post { transition: .3s; }
        .pp-post:hover { transform:translateY(-5px); box-shadow:0 18px 40px rgba(74,52,24,.12); }
        .pp-trail-paw { display:inline-flex; animation: pp-step 2.6s ease-in-out infinite; }

        /* pricing grids: even columns at every width, uniform gap */
        .pp-price-grid { display:grid; grid-template-columns:repeat(5, 1fr); gap:12px; }
        .pp-board-grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; }
        @media (max-width: 1020px) { .pp-price-grid { grid-template-columns:repeat(3, 1fr); } }
        @media (max-width: 620px)  {
          .pp-price-grid { grid-template-columns:repeat(2, 1fr); }
          .pp-board-grid { grid-template-columns:1fr; }
        }

        /* mobile */
        @media (max-width: 700px) {
          .pp-nav { font-size:13.5px !important; }
          .pp-nav-row { gap:14px !important; margin-left:0 !important; width:100%; justify-content:center; }
          .pp-hero-img { height: clamp(300px, 78vw, 420px) !important; }
          .pp-chip-points { right: 6px !important; bottom: 18px !important; padding:12px 15px !important; }
          .pp-chip-live { left: 6px !important; top: 14px !important; }
          .pp-chip-cats { display:none !important; }
          .pp-hero-cat { width:110px !important; height:110px !important; bottom:-14px !important; left:-8px !important; }
        }
        @media (max-width: 480px) {
          .pp-hero-ctas { flex-direction:column; }
          .pp-hero-ctas button { width:100%; justify-content:center; }
          .pp-stats { gap:22px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pp-screen, [data-floaty], [data-marquee], .pp-trail-paw { animation: none !important; }
        }
      `}</style>

      <div className="pp-screen">
        {/* ---------- header ---------- */}
        <header style={{ ...shell, padding: `18px ${SIDE_PAD}`, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div className="pp-brand" style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'default' }}>
            <PawMark size={38} radius={13} />
            <span style={{ fontFamily: sora, fontWeight: 800, fontSize: 21, letterSpacing: '-0.02em' }}>proxypaw</span>
          </div>
          <nav className="pp-nav-row" style={{ display: 'flex', gap: 24, marginLeft: 14, flexWrap: 'wrap' }}>
            {[
              { label: 'how it works', go: () => scrollTo('how') },
              { label: 'services', go: () => scrollTo('services') },
              { label: 'pricing', go: () => scrollTo('pricing') },
              { label: 'inside the app', go: onTourClick },
              { label: 'blog', go: () => scrollTo('blog') },
            ].map((item) => (
              <span
                key={item.label}
                className="pp-nav"
                onClick={item.go}
                style={{ fontSize: 15, color: C.muted, cursor: 'pointer', transition: 'color .2s', whiteSpace: 'nowrap' }}
              >
                {item.label}
              </span>
            ))}
          </nav>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => onJoin('nav-login')}
              style={{ border: 'none', background: 'transparent', fontSize: 15, fontWeight: 500, color: C.ink, cursor: 'pointer', padding: '10px 14px' }}
            >
              log in
            </button>
            <button
              className="pp-dark-btn"
              onClick={() => onJoin('nav-get-started')}
              style={{
                border: 'none', background: C.ink, color: C.cream2, fontFamily: sora,
                fontWeight: 600, fontSize: 14.5, padding: '12px 22px',
                borderRadius: 999, cursor: 'pointer', transition: '.25s',
              }}
            >
              get started
            </button>
          </div>
        </header>

        {/* ---------- hero ---------- */}
        <section
          style={{
            ...shell, position: 'relative',
            padding: `clamp(26px, 4vw, 44px) ${SIDE_PAD} ${SECTION_PAD}`,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 440px), 1fr))',
            gap: 'clamp(34px, 5vw, 56px)', alignItems: 'center',
          }}
        >
          <HeroDecor />
          <div style={{ position: 'relative' }}>
            <div
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, background: C.greenPale,
                border: `1px solid ${C.greenBorder}`, color: C.greenText, padding: '8px 16px',
                borderRadius: 999, fontSize: 13.5, fontWeight: 500, marginBottom: 24,
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.dotGreen, animation: '2s ease infinite pp-pulse' }} />
              live in 10 gachibowli communities
            </div>
            <h1 style={{ fontFamily: sora, fontWeight: 800, fontSize: 'clamp(38px, 5.4vw, 68px)', lineHeight: 1.03, letterSpacing: '-0.04em', margin: '0 0 6px' }}>
              your neighbours.<br />your pets'<br />
              <span style={{ color: C.orange }}>best friends.</span>
            </h1>
            <Squiggle />
            <p style={{ fontSize: 'clamp(16px, 1.6vw, 18.5px)', lineHeight: 1.6, color: C.sub, maxWidth: 440, margin: '20px 0 30px', fontWeight: 300, textTransform: 'none' }}>
              Verified neighbours for dog walks, cat home visits and overnight boarding, all inside your gated community. From &#8377;149.
            </p>
            <div className="pp-hero-ctas" style={{ display: 'flex', gap: 13, flexWrap: 'wrap' }}>
              <button
                className="pp-cta"
                onClick={() => onJoin('hero-find-a-walker')}
                style={{
                  border: 'none', background: C.orange, color: '#fff', fontFamily: sora,
                  fontWeight: 600, fontSize: 16, padding: '16px 30px', borderRadius: 999,
                  cursor: 'pointer', boxShadow: '0 12px 28px rgba(224,102,47,.3)', transition: '.25s',
                }}
              >
                find a walker
              </button>
              <button
                className="pp-ghost"
                onClick={() => onJoin('hero-explore-boarding')}
                style={{
                  border: `1.5px solid ${C.btnBorder}`, background: C.card, color: C.ink,
                  fontFamily: sora, fontWeight: 600, fontSize: 16, padding: '16px 30px',
                  borderRadius: 999, cursor: 'pointer', transition: '.25s',
                  display: 'flex', alignItems: 'center', gap: 9,
                }}
              >
                explore boarding
                <span style={{ background: C.green, color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999, letterSpacing: '0.04em' }}>
                  new
                </span>
              </button>
            </div>
            <div className="pp-stats" style={{ display: 'flex', gap: 36, marginTop: 'clamp(32px, 4vw, 48px)', flexWrap: 'wrap' }}>
              {[
                { big: '2,400+', small: 'walks & visits done' },
                { big: '4.9', star: true, small: 'average rating' },
                { big: '180+', small: 'verified neighbours' },
              ].map((s) => (
                <div key={s.small}>
                  <div style={{ fontFamily: sora, fontWeight: 800, fontSize: 'clamp(23px, 2.2vw, 28px)', letterSpacing: '-0.02em' }}>
                    {s.big} {s.star && <span style={{ color: C.star }}>&#9733;</span>}
                  </div>
                  <div style={{ fontSize: 13.5, color: C.muted, marginTop: 3 }}>{s.small}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative', minHeight: 'clamp(340px, 40vw, 480px)' }}>
            <img
              className="pp-hero-img"
              src={IMAGES.heroDog}
              alt="happy puppy running"
              style={{ width: '100%', height: 500, objectFit: 'cover', borderRadius: 36, display: 'block', boxShadow: '0 30px 70px rgba(74,52,24,.18)' }}
            />
            <img
              className="pp-hero-cat"
              src={IMAGES.heroCat}
              alt="curious cat"
              style={{
                position: 'absolute', bottom: -20, left: -16, width: 140, height: 140,
                objectFit: 'cover', borderRadius: 26, border: `5px solid ${C.cream}`,
                boxShadow: '0 18px 40px rgba(74,52,24,.22)', transform: 'rotate(-4deg)',
              }}
            />
            <div
              className="pp-chip-live"
              data-floaty
              style={{
                position: 'absolute', top: 24, left: -12, background: C.card,
                border: `1px solid ${C.cardBorder}`, borderRadius: 20, padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 11,
                boxShadow: '0 16px 40px rgba(74,52,24,.14)', animation: '5s ease-in-out infinite pp-floaty',
              }}
            >
              <img src={IMAGES.walker} alt="priya" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <div style={{ fontFamily: sora, fontWeight: 700, fontSize: 13.5, textTransform: 'none' }}>Priya is walking Biscuit</div>
                <div style={{ fontSize: 12, color: C.dotGreen, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.dotGreen, animation: '1.6s ease infinite pp-pulse' }} />
                  live &middot; tower c lawn
                </div>
              </div>
            </div>
            <div
              className="pp-chip-points"
              data-floaty
              style={{
                position: 'absolute', bottom: 32, right: -8, background: C.ink, color: C.cream2,
                borderRadius: 20, padding: '14px 18px', boxShadow: '0 20px 44px rgba(42,33,24,.3)',
                animation: '6s ease-in-out 1s infinite pp-floaty',
              }}
            >
              <div style={{ fontSize: 12, color: C.darkSub, marginBottom: 3 }}>paw points earned</div>
              <div style={{ fontFamily: sora, fontWeight: 800, fontSize: 20, color: C.gold }}>
                +25 pts <span style={{ fontSize: 12.5, fontWeight: 400, color: C.darkSub }}>per booking</span>
              </div>
            </div>
            <div
              className="pp-chip-cats"
              data-floaty
              style={{
                position: 'absolute', top: '44%', right: -14, background: C.card,
                border: `1px solid ${C.cardBorder}`, borderRadius: 999, padding: '8px 16px 8px 9px',
                display: 'flex', alignItems: 'center', gap: 9,
                boxShadow: '0 14px 34px rgba(74,52,24,.14)', animation: '5.5s ease-in-out .5s infinite pp-floaty',
              }}
            >
              <img src={IMAGES.catChip} alt="cat" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
              <span style={{ fontFamily: sora, fontWeight: 700, fontSize: 13 }}>cats too: visits &amp; boarding</span>
            </div>
          </div>
        </section>

        {/* ---------- community marquee ---------- */}
        <div style={{ borderTop: `1px solid ${C.bandBorder}`, borderBottom: `1px solid ${C.bandBorder}`, background: C.band, overflow: 'hidden', padding: '16px 0' }}>
          <div data-marquee style={{ display: 'flex', gap: 52, width: 'max-content', animation: '34s linear infinite pp-drift' }}>
            {[...COMMUNITIES, ...COMMUNITIES].map((name, i) => (
              <span key={i} style={{ fontFamily: sora, fontWeight: 600, fontSize: 14, color: C.muted2, whiteSpace: 'nowrap', letterSpacing: '0.02em', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <PawSvg size={10} color={C.muted2} style={{ opacity: 0.5 }} />
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* ---------- how it works ---------- */}
        <section id="how" style={{ ...shell, padding: `${SECTION_PAD} ${SIDE_PAD} 0` }}>
          <Reveal>
            <div style={eyebrow}>HOW IT WORKS</div>
            <h2 style={{ ...h2, fontSize: 'clamp(28px, 3.4vw, 44px)', margin: '0 0 clamp(28px, 4vw, 44px)', maxWidth: 560 }}>
              three steps between your dog and a great day
            </h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: GRID_GAP }}>
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 110}>
                <div className="pp-step-card" style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 24, padding: 'clamp(24px, 2.6vw, 30px)', transition: '.3s', height: '100%', boxSizing: 'border-box' }}>
                  <div className="pp-step-n" style={{ fontFamily: sora, fontWeight: 800, fontSize: 15, color: '#fff', background: C.orange, width: 36, height: 36, borderRadius: 12, display: 'grid', placeItems: 'center', marginBottom: 18 }}>
                    {s.n}
                  </div>
                  <div style={{ fontFamily: sora, fontWeight: 700, fontSize: 19, marginBottom: 9 }}>{s.title}</div>
                  <div style={{ fontSize: 15, lineHeight: 1.6, color: C.muted, fontWeight: 300, textTransform: 'none' }}>{s.body}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <div style={{ padding: 'clamp(26px, 3.5vw, 40px) 0 0' }}><PawTrail /></div>

        {/* ---------- services ---------- */}
        <section id="services" style={{ ...shell, padding: `clamp(26px, 3.5vw, 44px) ${SIDE_PAD} 0` }}>
          <Reveal>
            <div style={eyebrow}>SERVICES</div>
            <h2 style={{ ...h2, fontSize: 'clamp(28px, 3.4vw, 44px)', margin: '0 0 clamp(28px, 4vw, 44px)' }}>walks by day. boarding by night.</h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: GRID_GAP }}>
            {[
              {
                img: IMAGES.walks, alt: 'neighbour walking dogs', badge: null,
                title: 'walks & home visits',
                body: 'A trained neighbour walks your dog, GPS-tracked with photo updates. Cats get play, feeding and litter visits at home.',
                price: 'dogs from ₹149 · cats ₹129',
                scrim: 'linear-gradient(rgba(42,33,24,0) 30%, rgba(42,33,24,.86) 100%)',
              },
              {
                img: IMAGES.boarding, alt: 'dog relaxing at a host home', badge: 'NEW',
                title: 'overnight boarding',
                body: "Travelling? Your dog or cat sleeps over at a vetted host's home in your community, daily photos, vet on call.",
                price: 'dogs & cats · from ₹449',
                scrim: 'linear-gradient(rgba(30,42,33,0) 30%, rgba(24,36,27,.88) 100%)',
              },
            ].map((s, i) => (
              <Reveal key={s.title} delay={i * 130}>
                <div
                  className="pp-service"
                  onClick={() => onJoin(`service-${s.title}`)}
                  style={{ position: 'relative', borderRadius: 28, overflow: 'hidden', cursor: 'pointer', minHeight: 'clamp(320px, 34vw, 400px)', height: '100%' }}
                >
                  <img src={s.img} alt={s.alt} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: s.scrim }} />
                  {s.badge && (
                    <div style={{ position: 'absolute', top: 20, left: 20, background: C.green, color: '#fff', fontFamily: sora, fontWeight: 700, fontSize: 12, padding: '6px 14px', borderRadius: 999, letterSpacing: '0.06em' }}>
                      {s.badge}
                    </div>
                  )}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'clamp(20px, 2.6vw, 30px)' }}>
                    <div style={{ fontFamily: sora, fontWeight: 800, fontSize: 'clamp(23px, 2.4vw, 28px)', color: '#fff', letterSpacing: '-0.02em', marginBottom: 7 }}>{s.title}</div>
                    <div style={{ fontSize: 15, color: 'rgba(255,251,242,.85)', maxWidth: 380, lineHeight: 1.55, marginBottom: 14, textTransform: 'none' }}>{s.body}</div>
                    <div style={{ display: 'inline-flex', background: 'rgba(255,253,248,.16)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,253,248,.3)', color: '#fff', padding: '8px 16px', borderRadius: 999, fontFamily: sora, fontWeight: 600, fontSize: 14 }}>
                      {s.price}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------- pricing: two buckets ---------- */}
        <section id="pricing" style={{ ...shell, padding: `${SECTION_PAD} ${SIDE_PAD} 0` }}>
          <Reveal>
            <div style={{ background: C.ink, borderRadius: 32, padding: 'clamp(26px, 4vw, 52px)', color: C.cream2, position: 'relative', overflow: 'hidden' }}>
              <span aria-hidden="true" style={{ position: 'absolute', top: -18, right: -14, transform: 'rotate(18deg)' }}>
                <PawSvg size={120} color={C.cream2} style={{ opacity: 0.05 }} />
              </span>

              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 'clamp(26px, 3.4vw, 40px)' }}>
                <div>
                  <div style={{ ...eyebrow, color: C.gold }}>SIMPLE PRICING</div>
                  <h2 style={{ ...h2, fontSize: 'clamp(26px, 3vw, 38px)' }}>longer walks,<br />better value.</h2>
                </div>
                <div style={{ fontSize: 14.5, color: C.darkSub, maxWidth: 300, lineHeight: 1.55, textTransform: 'none' }}>
                  Every booking is insured, GPS-tracked and earns paw points. Walkers keep 70%.
                </div>
              </div>

              {/* bucket 1: walks & home visits */}
              <div style={bucketHead}>
                <span style={{ width: 26, height: 26, borderRadius: 9, background: C.orange, display: 'grid', placeItems: 'center' }}>
                  <PawSvg size={13} />
                </span>
                walks &amp; home visits
                <span style={{ flex: 1, height: 1, background: 'rgba(253,249,240,.12)' }} />
              </div>
              <div className="pp-price-grid" style={{ marginBottom: 'clamp(26px, 3.4vw, 38px)' }}>
                {WALK_TIERS.map((t, i) => (
                  <Reveal key={t.label} delay={i * 70}><TierCard t={t} /></Reveal>
                ))}
              </div>

              {/* bucket 2: overnight boarding */}
              <div style={bucketHead}>
                <span style={{ width: 26, height: 26, borderRadius: 9, background: C.green, display: 'grid', placeItems: 'center' }}>
                  {/* tiny moon for the overnight bucket */}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                    <path d="M20.6 14.5A8.6 8.6 0 0 1 9.5 3.4 8.9 8.9 0 1 0 20.6 14.5z" />
                  </svg>
                </span>
                overnight boarding
                <span style={{ flex: 1, height: 1, background: 'rgba(253,249,240,.12)' }} />
              </div>
              <div className="pp-board-grid">
                {BOARDING_TIERS.map((t, i) => (
                  <Reveal key={t.label} delay={i * 70}><TierCard t={t} /></Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        <div style={{ padding: 'clamp(26px, 3.5vw, 40px) 0 0' }}><PawTrail /></div>

        {/* ---------- the paw journal ---------- */}
        <section id="blog" style={{ ...shell, padding: `clamp(26px, 3.5vw, 44px) ${SIDE_PAD} 0` }}>
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap', marginBottom: 'clamp(24px, 3vw, 34px)' }}>
              <div>
                <div style={eyebrow}>THE PAW JOURNAL</div>
                <h2 style={{ ...h2, fontSize: 'clamp(26px, 3vw, 40px)' }}>care guides for dogs and cats</h2>
              </div>
              <button
                className="pp-ghost"
                onClick={onBlogClick}
                style={{ border: `1.5px solid ${C.btnBorder}`, background: 'transparent', color: C.ink, fontFamily: sora, fontWeight: 600, fontSize: 14.5, padding: '12px 24px', borderRadius: 999, cursor: 'pointer', transition: '.25s' }}
              >
                read all guides &rarr;
              </button>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: GRID_GAP }}>
            {POSTS.map((p, i) => (
              <Reveal key={p.tag} delay={i * 110}>
                <article className="pp-post" onClick={onBlogClick} style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 24, overflow: 'hidden', cursor: 'pointer', height: '100%', boxSizing: 'border-box' }}>
                  <div style={{ width: '100%', height: 165, backgroundImage: `url("${p.img}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <div style={{ padding: 20 }}>
                    <div style={{ display: 'inline-flex', background: C.peach, color: C.orangeDark, fontSize: 11.5, fontWeight: 700, padding: '5px 12px', borderRadius: 999, letterSpacing: '0.05em', marginBottom: 11 }}>
                      {p.tag}
                    </div>
                    <div style={{ fontFamily: sora, fontWeight: 700, fontSize: 16.5, lineHeight: 1.3, marginBottom: 8 }}>{p.title}</div>
                    <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.55, textTransform: 'none' }}>{p.body}</div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------- closing cta ---------- */}
        <section style={{ ...shell, padding: `${SECTION_PAD} ${SIDE_PAD}`, textAlign: 'center', position: 'relative' }}>
          <span aria-hidden="true" style={{ position: 'absolute', left: '12%', top: '30%', transform: 'rotate(-16deg)', animation: 'pp-floaty 9s ease-in-out infinite' }}>
            <PawSvg size={22} color={C.orange} style={{ opacity: 0.12 }} />
          </span>
          <span aria-hidden="true" style={{ position: 'absolute', right: '13%', top: '52%', transform: 'rotate(14deg)', animation: 'pp-floaty 11s ease-in-out 1s infinite' }}>
            <PawSvg size={18} color={C.green} style={{ opacity: 0.14 }} />
          </span>
          <Reveal>
            <img
              src={IMAGES.ctaPuppy}
              alt="puppy"
              style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', border: `4px solid ${C.card}`, boxShadow: '0 12px 30px rgba(74,52,24,.18)', marginBottom: 20 }}
            />
            <h2 style={{ ...h2, fontSize: 'clamp(28px, 3.8vw, 48px)', margin: '0 0 14px' }}>ready when your pets are.</h2>
            <p style={{ fontSize: 16.5, color: C.muted, margin: '0 0 28px', fontWeight: 300, textTransform: 'none' }}>
              Join your community's pack in under a minute.
            </p>
            <button
              className="pp-cta"
              onClick={() => onJoin('closing-cta')}
              style={{
                border: 'none', background: C.orange, color: '#fff', fontFamily: sora,
                fontWeight: 600, fontSize: 16.5, padding: '17px 38px', borderRadius: 999,
                cursor: 'pointer', boxShadow: '0 14px 32px rgba(224,102,47,.32)', transition: '.25s',
              }}
            >
              get started, it's free
            </button>
          </Reveal>
        </section>

        {/* ---------- footer ---------- */}
        <footer style={{ borderTop: `1px solid ${C.bandBorder}` }}>
          <div style={{ ...shell, padding: `28px ${SIDE_PAD}`, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div className="pp-brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <PawMark size={28} radius={9} />
              <span style={{ fontFamily: sora, fontWeight: 700, fontSize: 16 }}>proxypaw</span>
            </div>
            <div style={{ fontSize: 13.5, color: C.muted2 }}>
              made with love in gachibowli &middot; walks &middot; boarding &middot; community
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
