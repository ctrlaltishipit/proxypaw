/**
 * ProxyPaw landing page, "Garden Community" redesign (see DESIGN.md).
 *
 * Story order: hero (towers rising, a dog on the lawn) → the communities it is
 * built for → why it exists (founder's cats) → life in the community (photoreal
 * scenes) → how it works → try a walk (interactive demo ending in a receipt) →
 * services → pricing with "where your money goes" → founding perks and the
 * volunteer path → journal → FAQ → close.
 *
 * Photos in /public/real are generated photoreal scenes of Hyderabad gated
 * communities (realistic-visuals skill); they are illustrative, never presented
 * as real customers. Sample names only appear inside the walk demo, labelled.
 */
import { useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import CommunityScene from './landing/CommunityScene';
import WalkSimulator from './landing/WalkSimulator';
import {
  T, head, shell, SECTION, GAP, eyebrow, h2, lead, btnPrimary, btnSecondary, card,
  Reveal, RotatingWords, GLOBAL_CSS,
} from './landing/ui';

type JoinFn = (source: string, intent?: 'owner' | 'walker') => void;

const COMMUNITIES = [
  'Prestige High Fields', 'Rajapushpa Provincia', 'My Home Bhooja', 'My Home Avatar', 'My Home Vihanga',
  'Aparna Sarovar Zenith', 'Aparna Cyber Life', 'My Home Abhra', 'My Home Tarkshya', 'Aparna Luxor Park',
  'My Home Ankura', 'Aparna CyberZon',
];

const WALK_TIERS = [
  { label: '30 min walk', price: 149, min: 30, note: 'A first trial' },
  { label: '1 hour walk', price: 249, min: 60, note: 'Most popular', featured: true },
  { label: '1.5 hour walk', price: 349, min: 90, note: 'For the zoomies' },
  { label: '2 hour walk', price: 449, min: 120, note: 'Weekend long walk' },
];
const VISIT_TIERS = [
  { label: 'Cat home visit', price: 129, per: '', note: 'Feed, play, litter, photos' },
  { label: 'Dog boarding', price: 549, per: '/ night', note: 'Sleepover at a vetted host', featured: true },
  { label: 'Cat boarding', price: 449, per: '/ night', note: 'Quiet homes, daily photos' },
  { label: 'Extended stay', price: 499, per: '/ night', note: '5+ nights, dogs and cats' },
];
const PASSES = [
  { label: 'Day pass', price: 349, body: 'One 1-hour walk plus one home visit, same day', save: 'Save ₹29 vs booking singly' },
  { label: 'Week pass', price: 1499, body: 'A 1-hour walk every day for 7 days', save: 'About 14% off single walks' },
  { label: 'Month pass', price: 4999, body: '26 one-hour walks, priority booking, weekly photo report', save: 'About 23% off single walks', featured: true },
  { label: 'Cat month pass', price: 2999, body: 'A daily visit for 26 days: feed, play, litter, photo', save: 'About 11% off single visits' },
];

const POSTS = [
  { tag: 'Grooming', img: '/real/grooming.jpg', pos: '60% 35%', title: 'The apartment grooming guide for dogs and cats', body: 'Brushing beats bathing, monsoon coat care, and the nail-click rule every flat-dweller should know.' },
  { tag: 'Cats', img: '/real/cat-window.jpg', pos: '35% 45%', title: 'The indoor cat’s guide to a bigger life', body: 'Vertical territory, window theatre and scent games that turn a flat into a kingdom.' },
  { tag: 'Walking', img: '/real/walking-guide.jpg', pos: '45% 40%', title: 'Walking do’s and don’ts in a gated community', body: 'Short leads in lobbies, the 7-second pavement test, and why sniffing beats marching.' },
];

const FAQS = [
  { q: 'Who exactly will care for my pet?', a: 'A neighbour from your own gated community who loves animals and has passed every ProxyPaw check. You see their profile, meet them at your door first, and keep the same person for every walk, meal and stay.' },
  { q: 'How are volunteers checked?', a: 'Aadhaar verification, a one-on-one interview, pet-care and safety training, and an in-person meet-and-greet with you and your pet before the first booking. Community ratings keep it honest after that.' },
  { q: 'What do I see during a walk or visit?', a: 'Live GPS on every walk, photo updates during walks, visits and sleepovers, and a short report at the end. You can try it above with Biscuit.' },
  { q: 'Why does a 1-hour walk cost ₹249?', a: 'Because 70% of it, about ₹174, goes to your neighbour for a full hour of their time. The rest pays for verification, insurance, GPS tracking and support. Care passes bring the price down further.' },
  { q: 'Do you care for cats too?', a: 'Yes. Cat home visits (feeding, fresh water, litter, play and photos) from ₹129, and quiet-home cat boarding from ₹449 a night.' },
  { q: 'When can I book in my community?', a: 'ProxyPaw is opening one community at a time. Join the waitlist with your community’s name, and we will tell you the day booking opens for you.' },
];

const SHARE_URL = 'https://wa.me/?text=' + encodeURIComponent(
  'Found this for our community: ProxyPaw, verified neighbours for dog walks, cat visits and boarding. Join the waitlist so they open here: https://www.proxypaw.com',
);

/* ------------------------------- small parts ------------------------------ */

function Paw({ size = 16, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <ellipse cx="8.2" cy="7.4" rx="2.1" ry="2.9" /><ellipse cx="15.8" cy="7.4" rx="2.1" ry="2.9" />
      <ellipse cx="4.6" cy="12" rx="1.9" ry="2.5" /><ellipse cx="19.4" cy="12" rx="1.9" ry="2.5" />
      <path d="M12 11.5c-2.9 0-5.6 2.6-5.6 5.2 0 1.8 1.4 2.9 3 2.9 1 0 1.7-.4 2.6-.4s1.6.4 2.6.4c1.6 0 3-1.1 3-2.9 0-2.6-2.7-5.2-5.6-5.2z" />
    </svg>
  );
}

function Arrow({ color = 'currentColor' }: { color?: string }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}

function Section({ id, children, style, band }: { id?: string; children: ReactNode; style?: CSSProperties; band?: boolean }) {
  return (
    <section id={id} style={{ padding: `${SECTION} 0`, background: band ? T.band : undefined, scrollMarginTop: 80, ...style }}>
      <div style={shell}>{children}</div>
    </section>
  );
}

function Heading({ kicker, title, sub, center, action }: { kicker: string; title: ReactNode; sub?: ReactNode; center?: boolean; action?: ReactNode }) {
  return (
    <Reveal style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 'clamp(30px, 4vw, 52px)', textAlign: center ? 'center' : undefined }}>
      <div style={{ maxWidth: center ? 760 : 680, margin: center ? '0 auto' : undefined }}>
        <div style={eyebrow}>{kicker}</div>
        <h2 style={h2}>{title}</h2>
        {sub && <p style={{ ...lead, marginTop: 16 }}>{sub}</p>}
      </div>
      {action}
    </Reveal>
  );
}

/** Small custom illustrations for the three steps. */
function StepArt({ kind }: { kind: 'meet' | 'book' | 'watch' }) {
  if (kind === 'meet') return (
    <svg viewBox="0 0 220 120" width="100%" height="120" aria-hidden="true">
      <rect width="220" height="120" rx="18" fill={T.leafPale} />
      {[30, 70, 150, 190].map((x, i) => <rect key={x} x={x - 14} y={30 + (i % 2) * 8} width="28" height={70 - (i % 2) * 8} rx="5" fill="#f6f2ea" stroke="#e2dccf" />)}
      <circle cx="110" cy="70" r="30" fill="#ffffff" />
      <circle cx="98" cy="64" r="9" fill="#8d5a3b" /><rect x="90" y="74" width="16" height="16" rx="6" fill={T.leafBright} />
      <circle cx="122" cy="64" r="9" fill="#6b4630" /><rect x="114" y="74" width="16" height="16" rx="6" fill={T.marigold} />
      <path d="M104 60 q6 -8 12 0" stroke={T.marigold} strokeWidth="2.5" fill="none" />
      <circle cx="160" cy="26" r="11" fill={T.leaf} /><path d="M155 26l4 4 7-8" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </svg>
  );
  if (kind === 'book') return (
    <svg viewBox="0 0 220 120" width="100%" height="120" aria-hidden="true">
      <rect width="220" height="120" rx="18" fill={T.sunPale} />
      <rect x="70" y="14" width="80" height="106" rx="14" fill="#ffffff" stroke="#e1ecdc" />
      <rect x="80" y="28" width="60" height="8" rx="4" fill={T.line} />
      {[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => (
        <rect key={`${r}${c}`} x={80 + c * 15} y={44 + r * 14} width="11" height="10" rx="3" fill={r === 1 && c === 2 ? T.marigold : T.leafPale} />
      )))}
      <rect x="80" y="92" width="60" height="16" rx="8" fill={T.marigold} />
      <text x="110" y="103.5" textAnchor="middle" fontSize="8" fontWeight="700" fill="#fff" fontFamily="Inter, sans-serif">Confirm · ₹249</text>
    </svg>
  );
  return (
    <svg viewBox="0 0 220 120" width="100%" height="120" aria-hidden="true">
      <rect width="220" height="120" rx="18" fill="#e2f3f8" />
      <path d="M24 90 C 60 40 100 100 130 60 S 190 40 200 30" stroke="#efe3c6" strokeWidth="12" fill="none" strokeLinecap="round" />
      <path d="M24 90 C 60 40 100 100 130 60" stroke={T.marigold} strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="200" className="pp-draw" />
      <circle cx="130" cy="60" r="9" fill={T.marigold} stroke="#fff" strokeWidth="3" />
      <rect x="146" y="70" width="58" height="36" rx="8" fill="#ffffff" />
      <rect x="152" y="76" width="20" height="24" rx="4" fill="#9fd67f" />
      <rect x="176" y="80" width="22" height="5" rx="2.5" fill={T.line} /><rect x="176" y="90" width="16" height="5" rx="2.5" fill={T.line} />
    </svg>
  );
}

/** Pricing: pick an item, see where the money goes and what the time buys. */
function PriceExplainer({ onJoin }: { onJoin: JoinFn }) {
  const [tab, setTab] = useState<'walks' | 'visits' | 'passes'>('walks');
  const [pick, setPick] = useState(1);
  const [vpick, setVpick] = useState(0);

  const sel = tab === 'walks' ? WALK_TIERS[pick] : tab === 'visits' ? VISIT_TIERS[vpick] : null;
  const price = sel?.price ?? 0;
  const yours = Math.round(price * 0.7);

  const timeline = useMemo(() => {
    if (tab === 'walks') {
      const m = WALK_TIERS[pick].min;
      return [
        { k: 'Pick-up, harness and leash check', m: 5, c: T.sun },
        { k: `The walk: about ${((m - 12) / 60 * 3.4).toFixed(1)} km, sniff stops included`, m: m - 12, c: T.leafBright },
        { k: 'Water break and paw wipe', m: 4, c: '#9ed6ea' },
        { k: 'Photos and your GPS report', m: 3, c: T.marigold },
      ];
    }
    if (vpick === 0) return [
      { k: 'Fresh food and water', m: 8, c: T.sun },
      { k: 'Litter scooped', m: 5, c: '#9ed6ea' },
      { k: 'Play and cuddles', m: 14, c: T.leafBright },
      { k: 'Photos, windows and lock check', m: 3, c: T.marigold },
    ];
    return [
      { k: 'Evening walk or play', m: 3, c: T.leafBright },
      { k: 'Dinner, as you noted', m: 2, c: T.sun },
      { k: 'A night in a quiet home', m: 14, c: '#9ed6ea' },
      { k: 'Morning walk, breakfast and photos', m: 5, c: T.marigold },
    ];
  }, [tab, pick, vpick]);
  const tlTotal = timeline.reduce((a, b) => a + b.m, 0);

  const tabBtn = (id: typeof tab, label: string) => (
    <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className="pp-tab"
      style={{ border: 'none', cursor: 'pointer', fontFamily: head, fontWeight: 700, fontSize: 15, padding: '11px 18px', borderRadius: 999, minHeight: 44, background: tab === id ? T.ink : 'transparent', color: tab === id ? '#fff' : T.sub }}>
      {label}
    </button>
  );

  return (
    <div>
      <div role="tablist" aria-label="Price list" style={{ display: 'inline-flex', background: T.surface, border: `1px solid ${T.line}`, borderRadius: 999, padding: 4, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabBtn('walks', 'Dog walks')}{tabBtn('visits', 'Visits and boarding')}{tabBtn('passes', 'Care passes')}
      </div>

      {tab !== 'passes' ? (
        <div className="pp-split" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.1fr)', gap: GAP }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10, alignContent: 'start' }}>
            {(tab === 'walks' ? WALK_TIERS : VISIT_TIERS).map((t, i) => {
              const on = tab === 'walks' ? pick === i : vpick === i;
              return (
                <button key={t.label} aria-pressed={on} onClick={() => (tab === 'walks' ? setPick(i) : setVpick(i))} className="pp-lift"
                  style={{ textAlign: 'left', cursor: 'pointer', background: on ? T.ink : T.surface, color: on ? '#fff' : T.ink, border: `1.5px solid ${on ? T.ink : T.line}`, borderRadius: 20, padding: 18, position: 'relative', minHeight: 120 }}>
                  {'featured' in t && t.featured && (
                    <span style={{ position: 'absolute', top: 12, right: 12, background: T.sun, color: T.ink, fontSize: 11, fontWeight: 800, padding: '3px 9px', borderRadius: 99 }}>Popular</span>
                  )}
                  <div style={{ fontSize: 13.5, fontWeight: 600, opacity: .8 }}>{t.label}</div>
                  <div style={{ fontFamily: head, fontWeight: 800, fontSize: 30, letterSpacing: '-.02em', margin: '6px 0 2px' }}>
                    ₹{t.price}<span style={{ fontSize: 14, fontWeight: 600, opacity: .7 }}>{'per' in t ? ` ${t.per}` : ''}</span>
                  </div>
                  <div style={{ fontSize: 13, opacity: .75 }}>{t.note}</div>
                </button>
              );
            })}
          </div>

          <div style={{ ...card, padding: 'clamp(20px, 2.4vw, 30px)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.leaf, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Where your ₹{price} goes</div>
            <div style={{ display: 'flex', height: 14, borderRadius: 99, overflow: 'hidden', margin: '6px 0 12px' }}>
              <div style={{ width: '70%', background: T.leafBright, transition: 'width .5s' }} />
              <div style={{ width: '30%', background: T.marigold }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22 }}>
              <div>
                <div style={{ fontFamily: head, fontWeight: 800, fontSize: 24, color: T.ink }}>₹{yours}</div>
                <div style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.45 }}>to your neighbour, for their time and care</div>
              </div>
              <div>
                <div style={{ fontFamily: head, fontWeight: 800, fontSize: 24, color: T.ink }}>₹{price - yours}</div>
                <div style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.45 }}>to ProxyPaw: checks, insurance, GPS and support</div>
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.leaf, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10 }}>
              {tab === 'walks' ? `What ${WALK_TIERS[pick].min} minutes looks like` : vpick === 0 ? 'What a 30-minute visit looks like' : 'What a night looks like'}
            </div>
            <div style={{ display: 'flex', height: 34, borderRadius: 12, overflow: 'hidden', gap: 3 }}>
              {timeline.map((s) => (
                <div key={s.k} title={s.k} style={{ flex: s.m, background: s.c, transition: 'flex .6s cubic-bezier(.2,.7,.2,1)' }} />
              ))}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 0', display: 'grid', gap: 8 }}>
              {timeline.map((s) => (
                <li key={s.k} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, color: T.sub }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: s.c, flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{s.k}</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums', color: T.muted, fontSize: 13 }}>
                    {tab === 'visits' && vpick > 0 ? `${s.m} h` : `${s.m} min`}
                  </span>
                </li>
              ))}
            </ul>
            <div style={{ fontSize: 12.5, color: T.muted2, marginTop: 12 }}>
              {tab === 'visits' && vpick > 0 ? `${tlTotal} hours of care, with daily photos and a vet on call.` : 'Every booking is GPS-tracked, insured and earns paw points.'}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))', gap: GAP }}>
          {PASSES.map((p) => (
            <div key={p.label} className="pp-lift" style={{ ...card, padding: 22, position: 'relative', border: `1.5px solid ${p.featured ? T.leaf : T.line}` }}>
              {p.featured && <span style={{ position: 'absolute', top: 14, right: 14, background: T.leafPale, color: T.leaf, fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 99 }}>Best value</span>}
              <div style={{ fontSize: 14, fontWeight: 600, color: T.muted }}>{p.label}</div>
              <div style={{ fontFamily: head, fontWeight: 800, fontSize: 32, letterSpacing: '-.02em', margin: '6px 0' }}>₹{p.price.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: 14, color: T.sub, lineHeight: 1.5, minHeight: 42 }}>{p.body}</div>
              <div style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: T.marigoldDark }}>{p.save}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: GAP, marginTop: GAP }}>
        {[
          { t: 'Free to join.', d: 'Registering and exploring costs nothing. Booking opens with early access: join the waitlist and you are first in line.' },
          { t: 'New pet parent?', d: 'Add a coaching visit to any booking: a trained volunteer walks you through feeding, grooming and routines, in your own home.' },
          { t: 'Priced below the market.', d: 'Passes undercut every comparable plan we found in Hyderabad, and volunteers still keep their 70%.' },
        ].map((n) => (
          <div key={n.t} style={{ background: T.leafPale, borderRadius: 20, padding: 18, fontSize: 14.5, color: T.sub, lineHeight: 1.55 }}>
            <strong style={{ color: T.ink }}>{n.t}</strong> {n.d}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 22, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="pp-btn pp-btn-primary" style={btnPrimary} onClick={() => onJoin('pricing')}>Lock in founding prices <Arrow /></button>
      </div>
    </div>
  );
}

/* --------------------------------- page ---------------------------------- */

export default function LandingPage({ onJoin, onBlogClick, onTourClick, onAboutClick }: {
  onJoin: JoinFn;
  onBlogClick: () => void;
  onTourClick: () => void;
  onAboutClick: () => void;
}) {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="pp-land">
      <style>{GLOBAL_CSS + `
        .pp-draw { stroke-dashoffset: 200; animation: pp-drawline 3s ease-in-out infinite alternate; }
        @keyframes pp-drawline { to { stroke-dashoffset: 0; } }
        .pp-mosaic { display: grid; grid-template-columns: 1.5fr 1fr 1fr; grid-template-rows: 260px 260px; gap: ${GAP}; }
        .pp-mosaic > :first-child { grid-row: span 2; }
        @media (max-width: 860px) { .pp-mosaic { grid-template-columns: 1fr 1fr; grid-template-rows: 300px 200px 200px; } .pp-mosaic > :first-child { grid-column: span 2; grid-row: auto; } }
        @media (max-width: 520px) { .pp-mosaic { grid-template-columns: 1fr; grid-template-rows: none; grid-auto-rows: 230px; } .pp-mosaic > :first-child { grid-column: auto; } }
      `}</style>

      {/* ------------------------------- hero ------------------------------- */}
      <section style={{ position: 'relative', padding: 'clamp(28px, 4vw, 56px) 0 clamp(48px, 6vw, 80px)', background: `linear-gradient(180deg, ${T.canvas} 0%, #eef7e8 100%)` }}>
        <div style={shell}>
          <div className="pp-hero-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.05fr)', gap: 'clamp(28px, 4vw, 56px)', alignItems: 'center' }}>
            <div>
              <div className="pp-enter" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: T.surface, border: `1px solid ${T.line}`, color: T.leaf, padding: '8px 14px', borderRadius: 999, fontSize: 13.5, fontWeight: 600, marginBottom: 22 }}>
                <span className="pp-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: T.leafBright }} />
                Waitlist open in Gachibowli and the Financial District
              </div>
              <h1 className="pp-enter" style={{ fontFamily: head, fontWeight: 800, fontSize: 'clamp(36px, 4.4vw, 60px)', lineHeight: 1.04, letterSpacing: '-0.035em', margin: 0, color: T.ink, animationDelay: '.08s' }}>
                Trusted neighbours<br />to <RotatingWords color={T.marigold} words={['walk your dog.', 'feed your cat.', 'host sleepovers.', 'send you photos.']} />
              </h1>
              <p className="pp-enter" style={{ ...lead, maxWidth: 500, margin: '22px 0 30px', animationDelay: '.16s' }}>
                ProxyPaw matches you with verified pet lovers who live in your own gated community, for dog walks, cat home visits and overnight boarding. From ₹149.
              </p>
              <div className="pp-enter pp-hero-ctas" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', animationDelay: '.24s' }}>
                <button className="pp-btn pp-btn-primary" style={btnPrimary} onClick={() => onJoin('hero-join')}>Join the waitlist <Arrow /></button>
                <button className="pp-btn pp-btn-secondary" style={btnSecondary} onClick={() => scrollTo('walk')}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: T.leafPale, display: 'grid', placeItems: 'center' }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1l7 4-7 4z" fill={T.leaf} /></svg>
                  </span>
                  Watch a walk
                </button>
              </div>
              <div className="pp-enter" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', justifyContent: 'start', gap: 'clamp(18px, 3vw, 40px)', marginTop: 34, animationDelay: '.32s' }}>
                {[
                  { big: '₹149', small: 'for a 30-minute walk' },
                  { big: '70%', small: 'goes to your neighbour' },
                  { big: '6 checks', small: 'before anyone meets your pet' },
                ].map((s) => (
                  <div key={s.small}>
                    <div style={{ fontFamily: head, fontWeight: 800, fontSize: 'clamp(22px, 2.2vw, 28px)', letterSpacing: '-.02em' }}>{s.big}</div>
                    <div style={{ fontSize: 13.5, color: T.muted, marginTop: 2 }}>{s.small}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pp-enter" style={{ position: 'relative', animationDelay: '.2s' }}>
              <div style={{ borderRadius: 32, overflow: 'hidden', boxShadow: '0 40px 80px rgba(28,60,40,.18)', aspectRatio: '560 / 500', background: '#dff0f4' }}>
                <CommunityScene />
              </div>
              <div className="pp-float pp-hide-sm" style={{ position: 'absolute', left: -22, bottom: -26, width: 'clamp(150px, 15vw, 196px)', background: T.surface, borderRadius: 20, padding: 8, boxShadow: '0 24px 50px rgba(28,60,40,.2)' }}>
                <img src="/real/hero.jpg" alt="A neighbour walking a golden retriever on a community lawn at sunrise" style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', objectPosition: '72% 50%', borderRadius: 14, display: 'block' }} />
                <div style={{ padding: '8px 4px 2px', fontSize: 12.5, fontWeight: 600, color: T.sub, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="pp-pulse" style={{ width: 7, height: 7, borderRadius: '50%', background: T.leafBright }} />
                  7:04 am · the lawn loop
                </div>
              </div>
              <div className="pp-float pp-hide-sm" style={{ position: 'absolute', right: -14, top: 26, background: T.surface, borderRadius: 18, padding: '10px 14px', boxShadow: '0 18px 40px rgba(28,60,40,.16)', display: 'flex', gap: 10, alignItems: 'center', animationDelay: '-2s' }}>
                <img src="/real/cat-chip.jpg" alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <div style={{ fontFamily: head, fontWeight: 700, fontSize: 13.5 }}>Cat visit done</div>
                  <div style={{ fontSize: 12, color: T.leaf, fontWeight: 600 }}>fed · litter · cuddles</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------- communities ---------------------------- */}
      <div className="pp-marquee-wrap" style={{ borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}`, background: T.surface, padding: '18px 0', overflow: 'hidden' }}>
        <div style={{ ...shell, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.muted, whiteSpace: 'nowrap' }} className="pp-hide-sm">Built for communities like</div>
          <div style={{ overflow: 'hidden', flex: 1, maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)' }}>
            <div className="pp-marquee">
              {[...COMMUNITIES, ...COMMUNITIES].map((c, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 999, background: T.leafPale, color: T.leafDeep, fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>
                  <Paw size={13} color={T.leaf} />{c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------- story ------------------------------- */}
      <Section>
        <div className="pp-split" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 'clamp(28px, 5vw, 72px)', alignItems: 'center' }}>
          <Reveal>
            <div style={eyebrow}>Why ProxyPaw exists</div>
            <h2 style={h2}>It started with two cats and a weekend away.</h2>
            <div style={{ marginTop: 28, display: 'grid', gap: 18 }}>
              {[
                { n: '01', t: 'Every trip is a worry', d: 'Pet parents travel more than ever, and every trip starts with the same question: who do we trust with them this time?' },
                { n: '02', t: 'Strangers are still strangers', d: 'A sitter from an app is a profile on a screen. You meet them for the first time on the day you hand over your pet.' },
                { n: '03', t: 'So we asked the neighbours', d: 'Pets cannot tell you when care goes wrong, so trust has to be built before the booking. The safest person is the one you will meet in the lift tomorrow.' },
              ].map((b) => (
                <div key={b.n} style={{ display: 'flex', gap: 16 }}>
                  <div style={{ fontFamily: head, fontWeight: 800, color: T.marigold, fontSize: 15, paddingTop: 3, minWidth: 26 }}>{b.n}</div>
                  <div>
                    <div style={{ fontFamily: head, fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{b.t}</div>
                    <div style={{ fontSize: 15.5, color: T.sub, lineHeight: 1.6 }}>{b.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={120}>
            <figure style={{ margin: 0, position: 'relative' }}>
              <div className="pp-zoom" style={{ borderRadius: 28, boxShadow: '0 30px 70px rgba(28,60,40,.16)' }}>
                <img src="/founder/pablo-leo.jpg" alt="Pablo and Leo, the founder's two cats" loading="lazy" style={{ width: '100%', aspectRatio: '4 / 3.4', objectFit: 'cover', display: 'block', filter: 'saturate(1.05) contrast(1.03)' }} />
              </div>
              <blockquote style={{ margin: '-60px 18px 0', position: 'relative', background: T.surface, borderRadius: 22, padding: 'clamp(18px, 2.4vw, 26px)', boxShadow: '0 20px 50px rgba(28,60,40,.14)' }}>
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: T.ink }}>
                  “I have two cats I am hopelessly in love with, and leaving them even for a weekend was hard enough that I built the app I wished existed. Neighbours who love pets, verified properly, caring for pets they will meet again in the lift tomorrow.”
                </p>
                <footer style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, color: T.muted }}><strong style={{ color: T.ink }}>Deekshitha</strong>, founder, with Pablo and Leo</span>
                  <button onClick={onAboutClick} className="pp-btn" style={{ border: 'none', background: 'none', color: T.marigoldDark, fontWeight: 700, fontSize: 14.5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 0', minHeight: 44 }}>
                    Read her story <Arrow />
                  </button>
                </footer>
              </blockquote>
            </figure>
          </Reveal>
        </div>
      </Section>

      {/* ----------------------------- community ----------------------------- */}
      <Section band>
        <Heading
          kicker="Life in your community"
          title="Your neighbours already know your pet’s name."
          sub="Morning loops on the lawn, the evening dog-park hour, a quiet cat visit while you are at work. ProxyPaw turns the care that already happens between neighbours into something you can book and trust."
        />
        <div className="pp-mosaic">
          {[
            { src: '/real/community.jpg', alt: 'A Hyderabad gated community at sunrise: towers around a big central garden, one still under construction', label: 'Towers rising, gardens growing', pos: '50% 60%' },
            { src: '/real/dogpark.jpg', alt: 'Three neighbours chatting at the community dog park with a beagle, an indie dog and a black labrador', label: 'The 6 pm dog-park hour', pos: '40% 50%' },
            { src: '/real/meet-greet.jpg', alt: 'A volunteer greeting a golden retriever at an apartment door', label: 'Meet-and-greet at your door', pos: '45% 50%' },
            { src: '/real/cat-visit.jpg', alt: 'A volunteer petting a fluffy grey cat during a home visit', label: 'Cat visits, in your own home', pos: '55% 45%' },
            { src: '/real/walks.jpg', alt: 'A neighbour walking an indie dog down the tree-lined community road', label: 'The tree-lined evening walk', pos: '70% 55%' },
          ].map((p, i) => (
            <Reveal key={p.src} delay={i * 90} className="pp-zoom" style={{ position: 'relative', borderRadius: 24, minHeight: 200 }}>
              <img src={p.src} alt={p.alt} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: p.pos }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(20,48,31,0) 55%, rgba(20,48,31,.55))' }} />
              <span style={{ position: 'absolute', left: 14, bottom: 14, background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(6px)', color: T.ink, fontWeight: 700, fontSize: 13.5, padding: '8px 13px', borderRadius: 999 }}>{p.label}</span>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ------------------------------ how it works ------------------------------ */}
      <Section id="how">
        <Heading kicker="How it works" title="Three steps between your dog and a great day." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: GAP }}>
          {[
            { k: 'meet' as const, n: '1', t: 'Meet your neighbours', d: 'Pick your community and see its towers, the pets who live there and the verified neighbours who can care for them. Every profile is Aadhaar-checked and community-rated.' },
            { k: 'book' as const, n: '2', t: 'Book in 30 seconds', d: 'Pick a day, a time and a duration. Pay by UPI or card. Your first booking always starts with an in-person meet-and-greet at your door.' },
            { k: 'watch' as const, n: '3', t: 'Watch the tail wag', d: 'Live GPS on every walk, photo updates from every visit and sleepover, and paw points on every booking. (Or the slow blink, for cats.)' },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 110}>
              <div className="pp-lift" style={{ ...card, padding: 18, height: '100%', boxSizing: 'border-box' }}>
                <StepArt kind={s.k} />
                <div style={{ padding: '18px 6px 6px' }}>
                  <div style={{ display: 'inline-grid', placeItems: 'center', width: 30, height: 30, borderRadius: 10, background: T.marigold, color: '#fff', fontFamily: head, fontWeight: 800, fontSize: 14, marginBottom: 12 }}>{s.n}</div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em', margin: '0 0 8px' }}>{s.t}</h3>
                  <p style={{ margin: 0, fontSize: 15, color: T.sub, lineHeight: 1.6 }}>{s.d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ------------------------------ try a walk ------------------------------ */}
      <Section id="walk" band>
        <Heading
          kicker="Try it now"
          title="Take Biscuit for a walk. It takes 20 seconds."
          sub="Pick a length and press start. Watch an hour of a ProxyPaw walk: the route, the updates on your phone, and the receipt at the end. Or switch to a cat visit."
        />
        <Reveal><WalkSimulator onJoin={onJoin} /></Reveal>
      </Section>

      {/* ------------------------------- services ------------------------------- */}
      <Section id="services">
        <Heading kicker="Services" title="Walks by day. Visits at home. Boarding by night." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: GAP }}>
          {[
            { img: '/real/walks.jpg', pos: '70% 55%', alt: 'A neighbour walking an indie dog on the community road', t: 'Dog walks', d: 'A trained neighbour walks your dog, GPS-tracked, with photo updates.', p: 'From ₹149' },
            { img: '/real/cat-visit.jpg', pos: '58% 40%', alt: 'A volunteer petting a grey cat at home', t: 'Cat home visits', d: 'Feeding, fresh water, litter and play, in your cat’s own home.', p: 'From ₹129' },
            { img: '/real/boarding.jpg', pos: '75% 70%', alt: 'A beagle asleep on a rug at a host home while a cat watches', t: 'Overnight boarding', d: 'Your dog or cat sleeps over at a vetted host’s home in your community. Daily photos, vet on call.', p: 'From ₹449 a night', badge: 'New' },
          ].map((s, i) => (
            <Reveal key={s.t} delay={i * 110}>
              <button onClick={() => onJoin(`service-${s.t}`)} className="pp-lift pp-zoom" style={{ ...card, padding: 0, overflow: 'hidden', cursor: 'pointer', textAlign: 'left', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden' }}>
                  <img src={s.img} alt={s.alt} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: s.pos, display: 'block' }} />
                  {s.badge && <span style={{ position: 'absolute', top: 14, left: 14, background: T.leaf, color: '#fff', fontWeight: 800, fontSize: 12, padding: '5px 12px', borderRadius: 99 }}>{s.badge}</span>}
                </div>
                <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: 21, fontWeight: 800, letterSpacing: '-.02em', color: T.ink }}>{s.t}</h3>
                  <p style={{ margin: 0, fontSize: 15, color: T.sub, lineHeight: 1.55, flex: 1 }}>{s.d}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <span style={{ fontFamily: head, fontWeight: 800, color: T.ink }}>{s.p}</span>
                    <span style={{ color: T.marigoldDark, fontWeight: 700, fontSize: 14, display: 'inline-flex', gap: 6, alignItems: 'center' }}>Get early access <Arrow /></span>
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* -------------------------------- pricing -------------------------------- */}
      <Section id="pricing" band>
        <Heading
          kicker="Pricing"
          title="Clear prices. Your neighbour keeps 70%."
          sub="Tap any price to see exactly where the money goes and what that time with your pet looks like."
        />
        <Reveal><PriceExplainer onJoin={onJoin} /></Reveal>
      </Section>

      {/* ---------------------------- founding + volunteer ---------------------------- */}
      <Section>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: GAP }}>
          <Reveal>
            <div style={{ borderRadius: 28, padding: 'clamp(26px, 3.4vw, 40px)', background: `linear-gradient(140deg, ${T.marigold}, #ef8a4a)`, color: '#fff', height: '100%', boxSizing: 'border-box', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: -30, bottom: -40, opacity: .14 }}><Paw size={220} /></div>
              <div style={{ ...eyebrow, color: '#fff', opacity: .9 }}>Founding 1,000</div>
              <h3 style={{ fontFamily: head, fontWeight: 800, fontSize: 'clamp(26px, 2.8vw, 36px)', letterSpacing: '-.025em', lineHeight: 1.1, margin: '0 0 12px' }}>
                Be one of the first 1,000 pet parents.
              </h3>
              <p style={{ margin: '0 0 22px', fontSize: 16, lineHeight: 1.6, opacity: .95, maxWidth: 440 }}>
                A free onboarding session for your pet, plus ₹100 off your first booking. ProxyPaw opens one community at a time, so tell your tower.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="pp-btn" onClick={() => onJoin('founding-1000')} style={{ ...btnPrimary, background: '#fff', color: T.marigoldDark, boxShadow: 'none' }}>Claim my founding spot</button>
                <a className="pp-btn" href={SHARE_URL} target="_blank" rel="noreferrer" style={{ ...btnSecondary, background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,.6)', textDecoration: 'none' }}>Share with your tower</a>
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="pp-zoom" style={{ borderRadius: 28, position: 'relative', minHeight: 360, height: '100%', color: '#fff' }}>
              <img src="/real/meet-greet.jpg" alt="A volunteer kneeling to greet a golden retriever at a neighbour's door" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '40% 50%' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(20,48,31,.88) 0%, rgba(20,48,31,.55) 55%, rgba(20,48,31,.1) 100%)' }} />
              <div style={{ position: 'relative', padding: 'clamp(26px, 3.4vw, 40px)', maxWidth: 380 }}>
                <div style={{ ...eyebrow, color: '#b9d3c0' }}>Love animals?</div>
                <h3 style={{ fontFamily: head, fontWeight: 800, fontSize: 'clamp(26px, 2.8vw, 36px)', letterSpacing: '-.025em', lineHeight: 1.1, margin: '0 0 12px' }}>
                  Earn 70% caring for pets in your own community.
                </h3>
                <p style={{ margin: '0 0 22px', fontSize: 16, lineHeight: 1.6, opacity: .92 }}>
                  Walk dogs before work, visit cats after class. Training, insurance and a steady set of furry regulars, a lift ride from home.
                </p>
                <button className="pp-btn pp-btn-primary" style={btnPrimary} onClick={() => onJoin('volunteer-band', 'walker')}>Become a volunteer <Arrow /></button>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* -------------------------------- journal -------------------------------- */}
      <Section id="blog" band>
        <Heading
          kicker="The Paw Journal"
          title="Care guides for dogs and cats."
          action={<button className="pp-btn pp-btn-secondary" style={btnSecondary} onClick={onBlogClick}>Read all guides <Arrow /></button>}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: GAP }}>
          {POSTS.map((p, i) => (
            <Reveal key={p.tag} delay={i * 100}>
              <button onClick={onBlogClick} className="pp-lift pp-zoom" style={{ ...card, padding: 0, overflow: 'hidden', cursor: 'pointer', textAlign: 'left', width: '100%', height: '100%' }}>
                <div style={{ aspectRatio: '16 / 10', overflow: 'hidden' }}>
                  <img src={p.img} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: p.pos, display: 'block' }} />
                </div>
                <div style={{ padding: 20 }}>
                  <span style={{ display: 'inline-block', background: T.leafPale, color: T.leaf, fontSize: 12, fontWeight: 700, padding: '5px 11px', borderRadius: 99, marginBottom: 12 }}>{p.tag}</span>
                  <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800, letterSpacing: '-.015em', color: T.ink, lineHeight: 1.3 }}>{p.title}</h3>
                  <p style={{ margin: 0, fontSize: 14.5, color: T.sub, lineHeight: 1.55 }}>{p.body}</p>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ---------------------------------- FAQ ---------------------------------- */}
      <Section id="faq">
        <div className="pp-split" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, .8fr) minmax(0, 1.2fr)', gap: 'clamp(24px, 5vw, 72px)' }}>
          <Reveal>
            <div style={eyebrow}>Questions</div>
            <h2 style={h2}>What pet parents ask first.</h2>
            <p style={{ ...lead, marginTop: 16 }}>Anything else? The founder reads every waitlist note herself.</p>
          </Reveal>
          <Reveal delay={100}>
            <div style={{ display: 'grid', gap: 10 }}>
              {FAQS.map((f, i) => (
                <details key={f.q} className="pp-faq" open={i === 0} style={{ ...card, padding: '4px 20px' }}>
                  <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '16px 0', fontFamily: head, fontWeight: 700, fontSize: 17, color: T.ink, minHeight: 44 }}>
                    {f.q}
                    <span className="pp-faq-plus" aria-hidden="true" style={{ width: 30, height: 30, borderRadius: '50%', background: T.leafPale, display: 'grid', placeItems: 'center', flexShrink: 0, color: T.leaf, fontSize: 20, fontWeight: 600 }}>+</span>
                  </summary>
                  <p style={{ margin: '0 0 18px', fontSize: 15.5, color: T.sub, lineHeight: 1.65 }}>{f.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </Section>

      {/* --------------------------------- close --------------------------------- */}
      <section style={{ padding: `0 0 ${SECTION}` }}>
        <div style={shell}>
          <Reveal>
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 32, minHeight: 420, display: 'grid', alignItems: 'end' }}>
              <img src="/real/community.jpg" alt="" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 70%' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,48,31,.15) 0%, rgba(20,48,31,.82) 100%)' }} />
              <div style={{ position: 'relative', padding: 'clamp(28px, 5vw, 64px)', color: '#fff', maxWidth: 720 }}>
                <h2 style={{ ...h2, color: '#fff' }}>Your community’s pack is forming.</h2>
                <p style={{ ...lead, color: 'rgba(255,255,255,.9)', marginTop: 14 }}>
                  Join in under a minute. Somewhere in your tower, a wagging tail is already waiting.
                </p>
                <div className="pp-hero-ctas" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 26 }}>
                  <button className="pp-btn pp-btn-primary" style={btnPrimary} onClick={() => onJoin('closing-cta')}>Join the waitlist, it’s free <Arrow /></button>
                  <button className="pp-btn" style={{ ...btnSecondary, background: 'rgba(255,255,255,.12)', color: '#fff', borderColor: 'rgba(255,255,255,.5)' }} onClick={onTourClick}>See inside the app</button>
                </div>
              </div>
            </div>
          </Reveal>
          <p style={{ fontSize: 12.5, color: T.muted2, marginTop: 16, textAlign: 'center' }}>
            Photographs are illustrative scenes of Hyderabad gated communities. Community names show where ProxyPaw is built for, not partnerships.
          </p>
        </div>
      </section>
    </div>
  );
}
