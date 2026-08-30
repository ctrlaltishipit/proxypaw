/**
 * Landing page — a faithful build of the "Proxy Paw UI redesign" Claude Design
 * artifact. Colours, type scale, spacing and radii are taken verbatim from the
 * design; see design/ProxyPaw.dc.html for the source.
 *
 * The artifact's photos were browser blob: URLs and could not be recovered, so
 * IMAGES below points at stand-ins. Swap these for the real assets.
 */

import type { CSSProperties } from 'react';

const IMAGES = {
  heroDog: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=1000&q=80&auto=format&fit=crop',
  heroCat: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400&q=80&auto=format&fit=crop',
  catChip: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=120&q=80&auto=format&fit=crop',
  walker: 'https://i.pravatar.cc/80?img=47',
  walks: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1000&q=80&auto=format&fit=crop',
  boarding: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1000&q=80&auto=format&fit=crop',
  ctaPuppy: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=240&q=80&auto=format&fit=crop',
  blogGrooming: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=900&q=80&auto=format&fit=crop',
  blogCats: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=900&q=80&auto=format&fit=crop',
  blogWalking: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=900&q=80&auto=format&fit=crop',
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

const TIERS = [
  { label: '30 min', price: '₹149', note: 'perfect first trial', featured: false },
  { label: '1 hour', price: '₹249', note: 'most popular', featured: true },
  { label: '1.5 hours', price: '₹349', note: 'for the zoomies', featured: false },
  { label: '2 hours', price: '₹449', note: 'weekend best value', featured: false },
  { label: 'cat home visit', price: '₹129', note: 'feed, play, litter', featured: false },
];

const POSTS = [
  {
    tag: 'grooming',
    img: IMAGES.blogGrooming,
    title: 'the apartment grooming guide for dogs & cats',
    body: 'Brushing beats bathing, monsoon coat care, and the nail-click rule every flat-dweller should know.',
  },
  {
    tag: 'cats',
    img: IMAGES.blogCats,
    title: 'the indoor cat’s guide to a bigger life',
    body: 'Vertical territory, window theatre and scent games that turn a flat into a kingdom.',
  },
  {
    tag: 'walking',
    img: IMAGES.blogWalking,
    title: 'walking do’s and don’ts in a gated community',
    body: 'Short leads in lobbies, the 7-second pavement test, and why sniffing beats marching.',
  },
];

function PawMark({ size, radius }: { size: number; radius: number }) {
  return (
    <span
      style={{
        width: size, height: size, borderRadius: radius, background: C.orange,
        display: 'grid', placeItems: 'center', flexShrink: 0,
      }}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="#fff">
        <ellipse cx="8.2" cy="7.4" rx="2.1" ry="2.9" />
        <ellipse cx="15.8" cy="7.4" rx="2.1" ry="2.9" />
        <ellipse cx="4.4" cy="12.2" rx="1.9" ry="2.5" />
        <ellipse cx="19.6" cy="12.2" rx="1.9" ry="2.5" />
        <path d="M12 11c3 0 5.6 2.4 5.9 5.3.2 2-1.3 3.7-3.3 3.7-1 0-1.8-.5-2.6-.5s-1.6.5-2.6.5c-2 0-3.5-1.7-3.3-3.7C6.4 13.4 9 11 12 11z" />
      </svg>
    </span>
  );
}

const shell: CSSProperties = { maxWidth: 1200, margin: '0 auto' };
const sora = "'Sora', system-ui, sans-serif";
const eyebrow: CSSProperties = {
  fontSize: 14, fontWeight: 600, color: C.orange,
  letterSpacing: '0.12em', marginBottom: 14,
};
const h2: CSSProperties = {
  fontFamily: sora, fontWeight: 800, letterSpacing: '-0.03em',
  lineHeight: 1.1, margin: 0,
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
        @keyframes pp-floaty { 0%,100% { transform:translateY(0);} 50% { transform:translateY(-12px);} }
        @keyframes pp-pulse  { 0%,100% { opacity:1;} 50% { opacity:.35;} }
        @keyframes pp-drift  { from { transform:translateX(0);} to { transform:translateX(-50%);} }
        .pp-screen { animation:.5s cubic-bezier(.16,1,.3,1) both pp-fadeUp; }
        .pp-nav:hover { color:${C.orange} !important; }
        .pp-dark-btn:hover { background:${C.orange} !important; transform:translateY(-2px); }
        .pp-cta:hover { transform:translateY(-2px); box-shadow:0 18px 38px rgba(224,102,47,.42) !important; }
        .pp-ghost:hover { border-color:${C.orange} !important; color:${C.orange} !important; }
        .pp-step:hover { transform:translateY(-4px); box-shadow:0 18px 40px rgba(74,52,24,.10); }
        .pp-service:hover { transform:scale(1.015); }
        .pp-tier:hover { transform:translateY(-4px); }
        .pp-post:hover { transform:translateY(-4px); box-shadow:0 18px 40px rgba(74,52,24,.12); }
        @media (prefers-reduced-motion: reduce) {
          .pp-screen, [data-floaty], [data-marquee] { animation: none !important; }
        }
      `}</style>

      <div className="pp-screen">
        {/* ---------- header ---------- */}
        <header style={{ ...shell, padding: '22px 28px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <PawMark size={38} radius={13} />
            <span style={{ fontFamily: sora, fontWeight: 800, fontSize: 21, letterSpacing: '-0.02em' }}>proxypaw</span>
          </div>
          <nav style={{ display: 'flex', gap: 26, marginLeft: 16, flexWrap: 'wrap' }}>
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
                style={{ fontSize: 15, color: C.muted, cursor: 'pointer', transition: 'color .2s' }}
              >
                {item.label}
              </span>
            ))}
          </nav>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={() => onJoin('nav-login')}
              style={{ border: 'none', background: 'transparent', fontSize: 15, fontWeight: 500, color: C.ink, cursor: 'pointer', padding: '11px 16px' }}
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
            ...shell, padding: '44px 28px 80px', display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
            gap: 56, alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, background: C.greenPale,
                border: `1px solid ${C.greenBorder}`, color: C.greenText, padding: '8px 16px',
                borderRadius: 999, fontSize: 13.5, fontWeight: 500, marginBottom: 26,
              }}
            >
              <span data-floaty style={{ width: 7, height: 7, borderRadius: '50%', background: C.dotGreen, animation: '2s ease infinite pp-pulse' }} />
              live in 10 gachibowli communities
            </div>
            <h1 style={{ fontFamily: sora, fontWeight: 800, fontSize: 'clamp(42px, 5.6vw, 72px)', lineHeight: 1.02, letterSpacing: '-0.04em', margin: '0 0 24px' }}>
              your neighbours.<br />your pets'<br />
              <span style={{ color: C.orange }}>best friends.</span>
            </h1>
            <p style={{ fontSize: 18.5, lineHeight: 1.6, color: C.sub, maxWidth: 440, margin: '0 0 34px', fontWeight: 300, textTransform: 'none' }}>
              Verified neighbours for dog walks, cat home visits and overnight boarding, all inside your gated community. From &#8377;149.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button
                className="pp-cta"
                onClick={() => onJoin('hero-find-a-walker')}
                style={{
                  border: 'none', background: C.orange, color: '#fff', fontFamily: sora,
                  fontWeight: 600, fontSize: 16, padding: '17px 32px', borderRadius: 999,
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
                  fontFamily: sora, fontWeight: 600, fontSize: 16, padding: '17px 32px',
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
            <div style={{ display: 'flex', gap: 38, marginTop: 52, flexWrap: 'wrap' }}>
              {[
                { big: '2,400+', small: 'walks & visits done' },
                { big: '4.9', star: true, small: 'average rating' },
                { big: '180+', small: 'verified neighbours' },
              ].map((s) => (
                <div key={s.small}>
                  <div style={{ fontFamily: sora, fontWeight: 800, fontSize: 28, letterSpacing: '-0.02em' }}>
                    {s.big} {s.star && <span style={{ color: C.star }}>&#9733;</span>}
                  </div>
                  <div style={{ fontSize: 14, color: C.muted, marginTop: 3 }}>{s.small}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative', minHeight: 480 }}>
            <img
              src={IMAGES.heroDog}
              alt="happy puppy running"
              style={{ width: '100%', height: 520, objectFit: 'cover', borderRadius: 36, display: 'block', boxShadow: '0 30px 70px rgba(74,52,24,.18)' }}
            />
            <img
              src={IMAGES.heroCat}
              alt="curious cat"
              style={{
                position: 'absolute', bottom: -22, left: -20, width: 150, height: 150,
                objectFit: 'cover', borderRadius: 26, border: `5px solid ${C.cream}`,
                boxShadow: '0 18px 40px rgba(74,52,24,.22)', transform: 'rotate(-4deg)',
              }}
            />
            <div
              data-floaty
              style={{
                position: 'absolute', top: 26, left: -14, background: C.card,
                border: `1px solid ${C.cardBorder}`, borderRadius: 20, padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 12,
                boxShadow: '0 16px 40px rgba(74,52,24,.14)', animation: '5s ease-in-out infinite pp-floaty',
              }}
            >
              <img src={IMAGES.walker} alt="priya" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <div style={{ fontFamily: sora, fontWeight: 700, fontSize: 14, textTransform: 'none' }}>Priya is walking Biscuit</div>
                <div style={{ fontSize: 12.5, color: C.dotGreen, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.dotGreen, animation: '1.6s ease infinite pp-pulse' }} />
                  live &middot; tower c lawn
                </div>
              </div>
            </div>
            <div
              data-floaty
              style={{
                position: 'absolute', bottom: 34, right: -10, background: C.ink, color: C.cream2,
                borderRadius: 20, padding: '16px 20px', boxShadow: '0 20px 44px rgba(42,33,24,.3)',
                animation: '6s ease-in-out 1s infinite pp-floaty',
              }}
            >
              <div style={{ fontSize: 12.5, color: C.darkSub, marginBottom: 3 }}>paw points earned</div>
              <div style={{ fontFamily: sora, fontWeight: 800, fontSize: 22, color: C.gold }}>
                +25 pts <span style={{ fontSize: 13, fontWeight: 400, color: C.darkSub }}>per booking</span>
              </div>
            </div>
            <div
              data-floaty
              style={{
                position: 'absolute', top: '44%', right: -16, background: C.card,
                border: `1px solid ${C.cardBorder}`, borderRadius: 999, padding: '9px 18px 9px 10px',
                display: 'flex', alignItems: 'center', gap: 10,
                boxShadow: '0 14px 34px rgba(74,52,24,.14)', animation: '5.5s ease-in-out .5s infinite pp-floaty',
              }}
            >
              <img src={IMAGES.catChip} alt="cat" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
              <span style={{ fontFamily: sora, fontWeight: 700, fontSize: 13.5 }}>cats too: visits &amp; boarding</span>
            </div>
          </div>
        </section>

        {/* ---------- community marquee ---------- */}
        <div style={{ borderTop: `1px solid ${C.bandBorder}`, borderBottom: `1px solid ${C.bandBorder}`, background: C.band, overflow: 'hidden', padding: '18px 0' }}>
          <div data-marquee style={{ display: 'flex', gap: 56, width: 'max-content', animation: '34s linear infinite pp-drift' }}>
            {[...COMMUNITIES, ...COMMUNITIES].map((name, i) => (
              <span key={i} style={{ fontFamily: sora, fontWeight: 600, fontSize: 14.5, color: C.muted2, whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* ---------- how it works ---------- */}
        <section id="how" style={{ ...shell, padding: '96px 28px 40px' }}>
          <div style={eyebrow}>HOW IT WORKS</div>
          <h2 style={{ ...h2, fontSize: 'clamp(30px, 3.6vw, 46px)', margin: '0 0 48px', maxWidth: 560 }}>
            three steps between your dog and a great day
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 22 }}>
            {STEPS.map((s) => (
              <div key={s.n} className="pp-step" style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 28, padding: '34px 30px', transition: '.3s' }}>
                <div style={{ fontFamily: sora, fontWeight: 800, fontSize: 15, color: '#fff', background: C.orange, width: 36, height: 36, borderRadius: 12, display: 'grid', placeItems: 'center', marginBottom: 22 }}>
                  {s.n}
                </div>
                <div style={{ fontFamily: sora, fontWeight: 700, fontSize: 20, marginBottom: 10 }}>{s.title}</div>
                <div style={{ fontSize: 15.5, lineHeight: 1.6, color: C.muted, fontWeight: 300, textTransform: 'none' }}>{s.body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- services ---------- */}
        <section id="services" style={{ ...shell, padding: '72px 28px 40px' }}>
          <div style={eyebrow}>SERVICES</div>
          <h2 style={{ ...h2, fontSize: 'clamp(30px, 3.6vw, 46px)', margin: '0 0 48px' }}>walks by day. boarding by night.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 24 }}>
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
                price: 'dogs & cats · from ₹549',
                scrim: 'linear-gradient(rgba(30,42,33,0) 30%, rgba(24,36,27,.88) 100%)',
              },
            ].map((s) => (
              <div
                key={s.title}
                className="pp-service"
                onClick={() => onJoin(`service-${s.title}`)}
                style={{ position: 'relative', borderRadius: 32, overflow: 'hidden', cursor: 'pointer', minHeight: 420, transition: 'transform .35s' }}
              >
                <img src={s.img} alt={s.alt} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: s.scrim }} />
                {s.badge && (
                  <div style={{ position: 'absolute', top: 24, left: 24, background: C.green, color: '#fff', fontFamily: sora, fontWeight: 700, fontSize: 12.5, padding: '7px 15px', borderRadius: 999, letterSpacing: '0.06em' }}>
                    {s.badge}
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 34 }}>
                  <div style={{ fontFamily: sora, fontWeight: 800, fontSize: 30, color: '#fff', letterSpacing: '-0.02em', marginBottom: 8 }}>{s.title}</div>
                  <div style={{ fontSize: 15.5, color: 'rgba(255,251,242,.85)', maxWidth: 380, lineHeight: 1.55, marginBottom: 16, textTransform: 'none' }}>{s.body}</div>
                  <div style={{ display: 'inline-flex', background: 'rgba(255,253,248,.16)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,253,248,.3)', color: '#fff', padding: '9px 18px', borderRadius: 999, fontFamily: sora, fontWeight: 600, fontSize: 14.5 }}>
                    {s.price}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- pricing ---------- */}
        <section id="pricing" style={{ ...shell, padding: '72px 28px 90px' }}>
          <div style={{ background: C.ink, borderRadius: 36, padding: 'clamp(36px, 5vw, 64px)', color: C.cream2 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 44 }}>
              <div>
                <div style={{ ...eyebrow, color: C.gold }}>SIMPLE PRICING</div>
                <h2 style={{ ...h2, fontSize: 'clamp(28px, 3.4vw, 42px)' }}>longer walks,<br />better value.</h2>
              </div>
              <div style={{ fontSize: 15, color: C.darkSub, maxWidth: 300, lineHeight: 1.55, textTransform: 'none' }}>
                Every booking is insured, GPS-tracked and earns paw points. Walkers keep 70%.
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16 }}>
              {TIERS.map((t) => (
                <div
                  key={t.label}
                  className="pp-tier"
                  style={{
                    background: t.featured ? C.gold : 'rgba(253,249,240,.06)',
                    border: `1px solid ${t.featured ? C.gold : 'rgba(253,249,240,.14)'}`,
                    borderRadius: 24, padding: '26px 24px', transition: 'transform .25s',
                  }}
                >
                  <div style={{ fontSize: 14, color: t.featured ? 'rgba(42,33,24,.7)' : C.darkSub, marginBottom: 10 }}>{t.label}</div>
                  <div style={{ fontFamily: sora, fontWeight: 800, fontSize: 32, letterSpacing: '-0.02em', color: t.featured ? C.ink : C.cream2 }}>{t.price}</div>
                  <div style={{ fontSize: 13, color: t.featured ? 'rgba(42,33,24,.7)' : C.darkSub, marginTop: 8 }}>{t.note}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- the paw journal ---------- */}
        <section id="blog" style={{ ...shell, padding: '0 28px 96px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 36 }}>
            <div>
              <div style={eyebrow}>THE PAW JOURNAL</div>
              <h2 style={{ ...h2, fontSize: 'clamp(28px, 3.4vw, 42px)' }}>care guides for dogs and cats</h2>
            </div>
            <button
              className="pp-ghost"
              onClick={onBlogClick}
              style={{ border: `1.5px solid ${C.btnBorder}`, background: 'transparent', color: C.ink, fontFamily: sora, fontWeight: 600, fontSize: 14.5, padding: '13px 26px', borderRadius: 999, cursor: 'pointer', transition: '.25s' }}
            >
              read all guides &rarr;
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 22 }}>
            {POSTS.map((p) => (
              <article key={p.tag} className="pp-post" style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 28, overflow: 'hidden', cursor: 'pointer', transition: '.3s' }}>
                <div style={{ width: '100%', height: 180, backgroundImage: `url("${p.img}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div style={{ padding: 22 }}>
                  <div style={{ display: 'inline-flex', background: C.peach, color: C.orangeDark, fontSize: 11.5, fontWeight: 700, padding: '5px 12px', borderRadius: 999, letterSpacing: '0.05em', marginBottom: 12 }}>
                    {p.tag}
                  </div>
                  <div style={{ fontFamily: sora, fontWeight: 700, fontSize: 17.5, lineHeight: 1.3, marginBottom: 8 }}>{p.title}</div>
                  <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.55, textTransform: 'none' }}>{p.body}</div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ---------- closing cta ---------- */}
        <section style={{ ...shell, padding: '0 28px 100px', textAlign: 'center' }}>
          <img
            src={IMAGES.ctaPuppy}
            alt="puppy"
            style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: `4px solid ${C.card}`, boxShadow: '0 12px 30px rgba(74,52,24,.18)', marginBottom: 24 }}
          />
          <h2 style={{ ...h2, fontSize: 'clamp(30px, 4vw, 52px)', margin: '0 0 16px' }}>ready when your pets are.</h2>
          <p style={{ fontSize: 17, color: C.muted, margin: '0 0 32px', fontWeight: 300, textTransform: 'none' }}>
            Join your community's pack in under a minute.
          </p>
          <button
            className="pp-cta"
            onClick={() => onJoin('closing-cta')}
            style={{
              border: 'none', background: C.orange, color: '#fff', fontFamily: sora,
              fontWeight: 600, fontSize: 16.5, padding: '18px 40px', borderRadius: 999,
              cursor: 'pointer', boxShadow: '0 14px 32px rgba(224,102,47,.32)', transition: '.25s',
            }}
          >
            get started, it's free
          </button>
        </section>

        {/* ---------- footer ---------- */}
        <footer style={{ borderTop: `1px solid ${C.bandBorder}` }}>
          <div style={{ ...shell, padding: '34px 28px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
