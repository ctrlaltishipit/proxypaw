/**
 * ProxyPaw mobile app UI — display mockups for the "Inside the app" page.
 *
 * Ten phone screens (390x844) in the "Garden Community" system (DESIGN.md):
 * garden-mist canvas, white hairline cards, leaf-green accents, marigold as
 * the one primary action, sun for highlights, Plus Jakarta Sans headings and
 * Inter body. Captured as uniform screenshots by the harness at /mshots.html.
 * Display-only: no live logic, sample data throughout (demo community
 * Prestige High Fields). No fake iOS status bar or keyboard, per
 * mobile-mockup rules — the real device draws those.
 */
import type { CSSProperties, ReactNode } from 'react';

export const C = {
  canvas: '#f4f8ef', canvas2: '#fbfdf8', card: '#ffffff', ink: '#14301f',
  orange: '#e0662f', orangeDark: '#c24e1d', green: '#2e7d4f', greenBright: '#49a85a',
  greenPale: '#e7f4e4', greenChip: '#cfe5cb', gold: '#f0b429', sunPale: '#fff5dc',
  sunBorder: '#f5e2a6', band: '#eaf3e4', border: '#e1ecdc', bandBorder: '#d8e8d2',
  muted: '#5e7266', muted2: '#7c8f83', sub: '#3f5547', btnBorder: '#c9dcc4',
  sky: '#dcf0f6', onDark: '#b9d3c0',
  /* legacy aliases, kept for any importer */
  cream: '#f4f8ef', cream2: '#fbfdf8', peach: '#fff5dc',
};
const F = "'Plus Jakarta Sans', system-ui, sans-serif";
const BODY = "'Inter', system-ui, sans-serif";

/* Local photoreal crops live in public/real/app/ (illustrative, generated).
   Unsplash only where no local image fits. */
const IMG = {
  biscuit: '/real/app/biscuit.jpg',
  momo: '/real/app/momo.jpg',
  walkPhoto: '/real/app/walk-photo.jpg',
  boarding: '/real/app/boarding-sq.jpg',
  sitting: '/real/app/sitting.jpg',
  walking: '/real/app/walking.jpg',
  priya: '/real/walker-avatar.jpg',
  lily: '/real/app/lily.jpg',
  lolio: '/real/app/lolio.jpg',
  chai: 'https://images.unsplash.com/photo-1518288774672-b94e808873ff?w=300&h=300&q=75&auto=format&fit=crop&crop=faces',
  donut: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&q=75&auto=format&fit=crop&crop=faces',
  rhea: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&q=75&auto=format&fit=crop&crop=faces',
  arjun: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&q=75&auto=format&fit=crop&crop=faces',
};

/* ------------------------------ icons ------------------------------ */

function Ic({ d, size = 20, color = C.ink, sw = 1.7, fill = 'none' }: { d: string; size?: number; color?: string; sw?: number; fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={fill === 'none' ? color : 'none'} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
const paths = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  calendar: 'M8 2v4M16 2v4M3 9h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  users: 'M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  plus: 'M12 5v14M5 12h14',
  chevR: 'M9 18l6-6-6-6',
  back: 'M19 12H5M12 19l-7-7 7-7',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
  pin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  camera: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  card: 'M1 4h22v16H1zM1 10h22',
  qr: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM20 14h1v1h-1zM14 20h1v1h-1zM18 18h3v3h-3z',
  check: 'M20 6 9 17l-5-5',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z',
  cash: 'M2 7h20v10H2zM12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  swap: 'M17 1l4 4-4 4M21 5H9a4 4 0 0 0-4 4v2M7 23l-4-4 4-4M3 19h12a4 4 0 0 0 4-4v-2',
  msg: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  leaf: 'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10zM2 21c0-3 1.85-5.36 5.08-6',
};
function Paw({ size = 18, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <ellipse cx="8.2" cy="7.4" rx="2.1" ry="2.9" /><ellipse cx="15.8" cy="7.4" rx="2.1" ry="2.9" />
      <ellipse cx="4.4" cy="12.2" rx="1.9" ry="2.5" /><ellipse cx="19.6" cy="12.2" rx="1.9" ry="2.5" />
      <path d="M12 11c3 0 5.6 2.4 5.9 5.3.2 2-1.3 3.7-3.3 3.7-1 0-1.8-.5-2.6-.5s-1.6.5-2.6.5c-2 0-3.5-1.7-3.3-3.7C6.4 13.4 9 11 12 11z" />
    </svg>
  );
}

/* ------------------------------ tokens ------------------------------ */

const H = (size: number, weight = 700): CSSProperties => ({ fontFamily: F, fontWeight: weight, fontSize: size, letterSpacing: '-0.02em' });
const card: CSSProperties = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 22, boxShadow: '0 6px 18px rgba(28,60,40,.05)' };
const field: CSSProperties = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 16 };
const label: CSSProperties = { ...H(13.5, 700), color: C.ink, marginBottom: 7, display: 'block' };
const hint: CSSProperties = { fontSize: 11, color: C.muted2, lineHeight: 1.45 };
const eyebrow: CSSProperties = { fontFamily: F, fontWeight: 700, fontSize: 11, letterSpacing: '0.14em', color: C.green, textTransform: 'uppercase' };
const primary: CSSProperties = { ...H(15.5, 700), letterSpacing: '-0.01em', textAlign: 'center', background: C.orange, color: '#fff', borderRadius: 999, padding: '15px 0', boxShadow: '0 12px 28px rgba(224,102,47,.3)' };
const ghost: CSSProperties = { ...H(12.5, 700), letterSpacing: '-0.01em', background: C.card, border: `1.5px solid ${C.btnBorder}`, color: C.ink, borderRadius: 999, padding: '8px 15px' };
const chip = (bg = C.greenPale, fg = C.green): CSSProperties => ({ fontFamily: F, fontWeight: 700, fontSize: 10.5, background: bg, color: fg, borderRadius: 999, padding: '4px 10px', whiteSpace: 'nowrap' });
const pill = (sel: boolean): CSSProperties => ({
  background: sel ? C.orange : C.card, color: sel ? '#fff' : C.ink,
  border: `1px solid ${sel ? C.orange : C.border}`,
  boxShadow: sel ? '0 8px 18px rgba(224,102,47,.26)' : 'none',
});

/* ------------------------------ shell ------------------------------ */

function Phone({ children, nav }: { children: ReactNode; nav?: 'home' | 'bookings' | 'community' | 'profile' }) {
  return (
    <div style={{ width: 390, height: 844, background: `linear-gradient(180deg, ${C.greenPale} 0%, ${C.canvas} 220px)`, color: C.ink, fontFamily: BODY, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', WebkitFontSmoothing: 'antialiased' }}>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>{children}</div>
      {nav && <BottomNav active={nav} />}
    </div>
  );
}

function BottomNav({ active }: { active: string }) {
  const items = [
    { key: 'home', label: 'Home', d: paths.home },
    { key: 'bookings', label: 'Bookings', d: paths.calendar },
    { key: 'book', label: '', d: paths.plus },
    { key: 'community', label: 'Community', d: paths.users },
    { key: 'profile', label: 'Profile', d: paths.user },
  ];
  return (
    <div style={{ position: 'absolute', left: 14, right: 14, bottom: 16, background: 'rgba(255,255,255,.96)', border: `1px solid ${C.border}`, borderRadius: 26, boxShadow: '0 14px 34px rgba(28,60,40,.14)', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '9px 6px 8px' }}>
      {items.map((it) =>
        it.key === 'book' ? (
          <div key={it.key} style={{ width: 50, height: 50, borderRadius: 999, background: C.orange, display: 'grid', placeItems: 'center', boxShadow: '0 10px 22px rgba(224,102,47,.38)', marginTop: -24, border: `4px solid ${C.canvas}` }}>
            <Ic d={it.d} size={22} color="#fff" sw={2.4} />
          </div>
        ) : (
          <div key={it.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 58 }}>
            <Ic d={it.d} size={20} color={active === it.key ? C.green : C.muted2} sw={active === it.key ? 2.1 : 1.7} />
            <span style={{ fontFamily: F, fontWeight: active === it.key ? 700 : 600, fontSize: 10.5, color: active === it.key ? C.green : C.muted2 }}>{it.label}</span>
            <span style={{ width: 4, height: 4, borderRadius: 99, background: active === it.key ? C.green : 'transparent' }} />
          </div>
        ),
      )}
    </div>
  );
}

function Header({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 20px 14px', flexShrink: 0 }}>
      <span style={{ width: 40, height: 40, borderRadius: 999, background: C.card, border: `1px solid ${C.border}`, display: 'grid', placeItems: 'center', boxShadow: '0 4px 12px rgba(28,60,40,.06)' }}>
        <Ic d={paths.back} size={18} />
      </span>
      <span style={{ ...H(19), flex: 1, whiteSpace: 'nowrap' }}>{title}</span>
      {right}
    </div>
  );
}

function Avatar({ src, size, radius = 999, ring = false }: { src: string; size: number; radius?: number; ring?: boolean }) {
  return <img src={src} alt="" style={{ width: size, height: size, borderRadius: radius, objectFit: 'cover', flexShrink: 0, border: ring ? `2.5px solid ${C.card}` : 'none', boxShadow: ring ? '0 4px 12px rgba(28,60,40,.14)' : 'none' }} />;
}

function Initial({ n, bg, size = 46 }: { n: string; bg: string; size?: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: 999, background: bg, display: 'grid', placeItems: 'center', color: '#fff', ...H(size * 0.38), flexShrink: 0 }}>{n}</span>
  );
}

/* ------------------------------ 1. HOME ------------------------------ */

function Home() {
  return (
    <Phone nav="home">
      <div style={{ padding: '22px 20px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.green, fontWeight: 600, marginBottom: 2 }}>
              <Ic d={paths.pin} size={12} color={C.green} sw={2} /> Prestige High Fields
            </div>
            <div style={{ ...H(23, 800) }}>Good morning, Ananya</div>
          </div>
          <span style={{ width: 42, height: 42, borderRadius: 999, background: C.card, border: `1px solid ${C.border}`, display: 'grid', placeItems: 'center', position: 'relative' }}>
            <Ic d={paths.bell} size={19} />
            <span style={{ position: 'absolute', top: 9, right: 10, width: 8, height: 8, borderRadius: 99, background: C.orange, border: `2px solid ${C.card}` }} />
          </span>
        </div>

        {/* pets */}
        <div style={{ display: 'flex', gap: 9, marginBottom: 16 }}>
          {[{ n: 'Biscuit', img: IMG.biscuit, on: true }, { n: 'Momo', img: IMG.momo, on: false }].map((p) => (
            <div key={p.n} style={{ display: 'flex', alignItems: 'center', gap: 8, background: p.on ? C.green : C.card, color: p.on ? '#fff' : C.ink, border: `1px solid ${p.on ? C.green : C.border}`, borderRadius: 99, padding: '5px 15px 5px 5px', boxShadow: p.on ? '0 8px 18px rgba(46,125,79,.25)' : 'none' }}>
              <img src={p.img} alt={p.n} style={{ width: 32, height: 32, borderRadius: 99, objectFit: 'cover', border: p.on ? '2px solid rgba(255,255,255,.7)' : 'none' }} />
              <span style={{ ...H(13.5) }}>{p.n}</span>
            </div>
          ))}
          <div style={{ display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 99, border: `1.5px dashed ${C.btnBorder}`, background: C.canvas2 }}>
            <Ic d={paths.plus} size={16} color={C.muted} />
          </div>
        </div>

        {/* next booking: photo card */}
        <div style={{ ...card, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ position: 'relative', height: 118 }}>
            <img src={IMG.walkPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,48,31,0) 30%, rgba(20,48,31,.7) 100%)' }} />
            <span style={{ position: 'absolute', left: 12, top: 12, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.94)', borderRadius: 99, padding: '5px 11px', fontFamily: F, fontWeight: 700, fontSize: 10.5, letterSpacing: '0.08em', color: C.green }}>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: C.greenBright }} /> NEXT UP · TODAY 7:00 AM
            </span>
            <div style={{ position: 'absolute', left: 14, bottom: 11, right: 14, display: 'flex', alignItems: 'center', gap: 9 }}>
              <Avatar src={IMG.priya} size={30} ring />
              <span style={{ ...H(16.5), color: '#fff' }}>1 hour walk with Priya</span>
            </div>
          </div>
          <div style={{ padding: '11px 14px 13px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ flex: 1, fontSize: 11.5, color: C.muted, lineHeight: 1.4 }}>Tower C lawn loop · photo every 15 min</span>
            <span style={{ ...H(12.5), background: C.orange, color: '#fff', borderRadius: 99, padding: '8px 14px', boxShadow: '0 8px 18px rgba(224,102,47,.28)' }}>Track live</span>
          </div>
        </div>

        {/* paw points */}
        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', marginBottom: 16, background: C.sunPale, borderColor: C.sunBorder, boxShadow: 'none' }}>
          <span style={{ width: 36, height: 36, borderRadius: 999, background: C.gold, display: 'grid', placeItems: 'center' }}><Paw size={17} color={C.ink} /></span>
          <div style={{ flex: 1 }}>
            <div style={{ ...H(14.5) }}>250 Paw Points</div>
            <div style={{ fontSize: 11.5, color: C.sub }}>+25 on every booking · redeem on your next walk</div>
          </div>
          <Ic d={paths.chevR} size={16} color={C.muted} />
        </div>

        {/* services */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ ...H(16.5) }}>Book a service</div>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: C.green }}>See all</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9, marginBottom: 16 }}>
          {[
            { t: 'Dog walking', p: 'from ₹149', img: IMG.walking },
            { t: 'Home boarding', p: 'from ₹449', img: IMG.boarding },
            { t: 'Pet sitting', p: '₹129 / visit', img: IMG.sitting },
          ].map((s) => (
            <div key={s.t} style={{ ...card, overflow: 'hidden', borderRadius: 18 }}>
              <img src={s.img} alt="" style={{ width: '100%', height: 66, objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: '8px 9px 10px' }}>
                <div style={{ ...H(12), lineHeight: 1.2 }}>{s.t}</div>
                <div style={{ fontSize: 10.5, color: C.orangeDark, fontWeight: 700, marginTop: 2 }}>{s.p}</div>
              </div>
            </div>
          ))}
        </div>

        {/* update feed */}
        <div style={{ ...H(16.5), marginBottom: 10 }}>From your last booking</div>
        <div style={{ ...card, display: 'flex', gap: 12, padding: 11 }}>
          <img src={IMG.biscuit} alt="" style={{ width: 62, height: 62, borderRadius: 16, objectFit: 'cover' }} />
          <div style={{ flex: 1 }}>
            <div style={{ ...H(13.5) }}>Priya sent 4 photos</div>
            <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.45 }}>"Biscuit made a new friend near Tower B. 2.1 km, all zoomies."</div>
            <div style={{ fontSize: 10.5, color: C.muted2, marginTop: 3 }}>Yesterday · 5:12 PM</div>
          </div>
        </div>
      </div>
    </Phone>
  );
}

/* ------------------------------ 2. SERVICES ------------------------------ */

function Services() {
  const rows = [
    {
      t: 'Dog walking & cleaning', img: IMG.walking, price: 'From ₹149 · 30 to 120 min',
      d: 'GPS-tracked walks by a verified neighbour, paws towelled before they come back up.',
      tags: ['Live GPS', 'Photo updates'],
    },
    {
      t: 'Home pet boarding', img: IMG.boarding, price: 'From ₹449 per night · day or overnight',
      d: 'Your dog or cat stays in their own home; a vetted neighbour moves in around their routine.',
      tags: ['Cage-free', 'Vet on call'],
    },
    {
      t: 'Pet sitting & feeding', img: IMG.sitting, price: '₹129 per visit',
      d: 'Feeding, litter box cleaning and play for adult dogs, puppies, adult cats and kittens.',
      tags: ['Litter care', 'All ages'],
    },
  ];
  return (
    <Phone nav="bookings">
      <Header title="Book a service" />
      <div style={{ padding: '2px 20px 20px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {rows.map((r) => (
            <div key={r.t} style={{ ...card, display: 'flex', gap: 12, padding: 11 }}>
              <img src={r.img} alt="" style={{ width: 88, height: 104, borderRadius: 16, objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...H(15.5), marginBottom: 2 }}>{r.t}</div>
                <div style={{ fontSize: 11.5, color: C.orangeDark, fontWeight: 700, marginBottom: 5 }}>{r.price}</div>
                <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.45 }}>{r.d}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 7 }}>
                  {r.tags.map((tg) => <span key={tg} style={chip()}>{tg}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ ...card, background: C.sunPale, borderColor: C.sunBorder, boxShadow: 'none', padding: 14, marginTop: 13 }}>
          <div style={{ display: 'flex', gap: 11 }}>
            <span style={{ width: 34, height: 34, borderRadius: 999, background: C.gold, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Paw size={16} color={C.ink} /></span>
            <div>
              <div style={{ ...H(13.5), marginBottom: 3 }}>Need something extra?</div>
              <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.5 }}>
                Missing food, medicine or equipment at home? Ask in your booking. If your volunteer accepts, they bring it at MRP, no markup.
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: C.greenPale, border: `1px solid ${C.greenChip}`, borderRadius: 999, padding: '10px 14px', marginTop: 11, fontSize: 11.5, fontWeight: 600, color: C.green }}>
          <Ic d={paths.leaf} size={13} color={C.green} sw={2} /> We only list what we can deliver. Grooming is next.
        </div>
      </div>
    </Phone>
  );
}

/* ------------------------------ 3. ADD PET ------------------------------ */

function Pet() {
  const traits = ['Calm', 'Active & zoomy', 'Shy at first', 'Friendly with dogs', 'Friendly with cats', 'Good with kids', 'Chaser (high prey drive)', 'Loves cuddles', 'Independent', 'Anxious when alone', 'Food motivated'];
  const on = ['Active & zoomy', 'Friendly with dogs', 'Loves cuddles', 'Food motivated'];
  return (
    <Phone>
      <Header title="Your pet" right={<span style={chip()}>Dog · Golden retriever</span>} />
      <div style={{ padding: '0 20px 30px', overflow: 'hidden' }}>
        {/* photo + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <div style={{ position: 'relative' }}>
            <img src={IMG.biscuit} alt="Biscuit" style={{ width: 78, height: 78, borderRadius: 999, objectFit: 'cover', border: `3px solid ${C.card}`, boxShadow: '0 10px 24px rgba(28,60,40,.18)' }} />
            <span style={{ position: 'absolute', right: -3, bottom: -3, width: 28, height: 28, borderRadius: 999, background: C.orange, display: 'grid', placeItems: 'center', border: `2.5px solid ${C.canvas}` }}>
              <Ic d={paths.camera} size={13} color="#fff" />
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <span style={label}>Name <span style={{ color: C.orangeDark }}>*</span></span>
            <div style={{ ...field, padding: '10px 14px', fontSize: 15, fontWeight: 600 }}>Biscuit</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <span style={label}>Birth date <span style={{ color: C.orangeDark }}>*</span></span>
            <div style={{ ...field, padding: '10px 14px', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              12 Mar 2024 <Ic d={paths.calendar} size={15} color={C.muted2} />
            </div>
          </div>
          <div style={{ width: 96 }}>
            <span style={label}>Age</span>
            <div style={{ borderRadius: 16, padding: '10px 14px', fontSize: 14, background: C.greenPale, border: `1px solid ${C.greenChip}`, color: C.green, fontWeight: 700 }}>2 yrs</div>
          </div>
        </div>

        {/* temperament */}
        <span style={label}>What's Biscuit like?</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 6 }}>
          {traits.map((t) => {
            const sel = on.includes(t);
            return (
              <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600, borderRadius: 99, padding: '6px 11px', background: sel ? C.green : C.card, color: sel ? '#fff' : C.sub, border: `1px solid ${sel ? C.green : C.border}` }}>
                {sel && <Ic d={paths.check} size={11} color="#fff" sw={3} />}{t}
              </span>
            );
          })}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 600, borderRadius: 99, padding: '6px 11px', background: C.canvas2, border: `1.5px dashed ${C.btnBorder}`, color: C.muted }}>
            Other: <em style={{ fontStyle: 'normal', color: C.ink }}>gentle giant energy</em>
          </span>
        </div>
        <div style={{ ...hint, marginBottom: 12 }}>Other: 5 words max.</div>

        {/* medical */}
        <span style={label}>Medical & care <span style={{ fontWeight: 500, color: C.muted2 }}>(optional)</span></span>
        <div style={{ ...field, padding: '10px 14px', fontSize: 12.5, color: C.sub, lineHeight: 1.5, marginBottom: 4 }}>
          Monthly deworming on the 5th. Fish-oil capsule with dinner. Mild chicken allergy, no chicken treats.
        </div>
        <div style={{ ...hint, display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span>Allergies, medication, supplements.</span><span>17/200 words</span>
        </div>

        {/* instructions */}
        <span style={label}>Instructions for your volunteer <span style={{ fontWeight: 500, color: C.muted2 }}>(optional)</span></span>
        <div style={{ ...field, padding: '10px 14px', fontSize: 12.5, color: C.sub, lineHeight: 1.5, marginBottom: 4 }}>
          Photo update every 15 minutes on walks. For boarding: dinner at 8 PM, one scoop, and he sleeps with the hallway light on.
        </div>
        <div style={{ ...hint, marginBottom: 16, display: 'flex', gap: 6 }}>
          <Ic d={paths.shield} size={12} color={C.green} sw={2} />
          <span>Keep it practical: only requests our volunteers can actually carry out. 200 words max. Only your booked volunteer sees this.</span>
        </div>

        <div style={{ ...primary, marginBottom: 6 }}>Save Biscuit's profile</div>
      </div>
    </Phone>
  );
}

/* ------------------------------ 4. WALKERS ------------------------------ */

function Walkers() {
  const vols = [
    { n: 'Priya S.', tower: 'Tower C · 2 min away', rating: '4.9', walks: 98, badge: 'Walks Biscuit weekly', top: true, img: IMG.priya },
    { n: 'Marcus R.', tower: 'Tower A · 4 min away', rating: '5.0', walks: 127, badge: 'Boarding host', top: true },
    { n: 'Ananya M.', tower: 'Tower B · 3 min away', rating: '4.9', walks: 84, badge: 'Great with cats', top: false },
    { n: 'Rahul K.', tower: 'Tower D · 6 min away', rating: '4.7', walks: 63, badge: 'Weekend sitter', top: false },
  ];
  const colors = [C.green, C.green, C.greenBright, '#1f6b3a'];
  return (
    <Phone>
      <Header title="Volunteers nearby" right={<span style={chip()}>Prestige High Fields</span>} />
      <div style={{ padding: '0 20px 20px', overflow: 'hidden' }}>
        <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 12, lineHeight: 1.5 }}>
          Every volunteer lives in your community: Aadhaar-verified, background-checked and safety-trained before their first booking.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {vols.map((v, i) => (
            <div key={v.n} style={{ ...card, padding: 13 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  {v.img ? <Avatar src={v.img} size={48} /> : <Initial n={v.n[0]} bg={colors[i]} size={48} />}
                  <span style={{ position: 'absolute', right: -2, bottom: -2, width: 18, height: 18, borderRadius: 99, background: C.card, display: 'grid', placeItems: 'center' }}>
                    <span style={{ width: 14, height: 14, borderRadius: 99, background: C.green, display: 'grid', placeItems: 'center' }}><Ic d={paths.check} size={8} color="#fff" sw={3.5} /></span>
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ ...H(15) }}>{v.n}</span>
                    {v.top && <span style={{ ...chip(C.gold, C.ink), fontSize: 9, padding: '2px 8px', letterSpacing: '0.04em' }}>TOP RATED</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: C.muted, marginTop: 2 }}>
                    <Ic d={paths.pin} size={11} color={C.muted2} /> {v.tower}
                  </div>
                </div>
                <span style={{ ...H(13), background: C.orange, color: '#fff', borderRadius: 99, padding: '9px 17px', boxShadow: '0 8px 18px rgba(224,102,47,.25)' }}>Book</span>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.band}`, fontSize: 11.5, color: C.sub, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Ic d={paths.star} size={12} color={C.gold} fill={C.gold} /> <b style={{ fontWeight: 700, color: C.ink }}>{v.rating}</b> · {v.walks} bookings</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: C.green, fontWeight: 600 }}><Ic d={paths.shield} size={12} color={C.green} /> Verified</span>
                <span style={{ color: C.muted2 }}>{v.badge}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ ...card, background: C.greenPale, borderColor: C.greenChip, boxShadow: 'none', padding: 13, marginTop: 13, display: 'flex', gap: 11, alignItems: 'center' }}>
          <span style={{ width: 38, height: 38, borderRadius: 999, background: C.green, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Ic d={paths.shield} size={18} color="#fff" />
          </span>
          <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.5 }}>
            <span style={{ ...H(12.5), color: C.green }}>Meet them first, always.</span> Every first booking starts with a free meet-and-greet at your door, and volunteers keep 70% of what you pay.
          </div>
        </div>
      </div>
    </Phone>
  );
}

/* ------------------------------ 5. BOOKING ------------------------------ */

function Booking() {
  return (
    <Phone>
      <Header title="Book a walk" right={<span style={chip()}>Step 2 of 3</span>} />
      <div style={{ padding: '0 20px 20px', overflow: 'hidden' }}>
        {/* pet */}
        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 11, padding: 10, marginBottom: 16 }}>
          <Avatar src={IMG.biscuit} size={46} />
          <div style={{ flex: 1 }}>
            <div style={{ ...H(14.5) }}>Biscuit</div>
            <div style={{ fontSize: 11.5, color: C.muted }}>Golden retriever · 2 yrs · Active & zoomy</div>
          </div>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: C.green, paddingRight: 6 }}>Change</span>
        </div>

        <span style={label}>Duration</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
          {([['30 min', '₹149', false], ['1 hour', '₹249', true], ['1.5 hrs', '₹349', false], ['2 hrs', '₹449', false]] as const).map(([t, p, sel]) => (
            <div key={t} style={{ textAlign: 'center', borderRadius: 16, padding: '10px 0', ...pill(sel) }}>
              <div style={{ ...H(12.5) }}>{t}</div>
              <div style={{ fontSize: 11, color: sel ? '#ffe4d2' : C.orangeDark, fontWeight: 700 }}>{p}</div>
            </div>
          ))}
        </div>

        <span style={label}>Day · September</span>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {([['Mon', '8', false], ['Tue', '9', true], ['Wed', '10', false], ['Thu', '11', false], ['Fri', '12', false]] as const).map(([d, n, sel]) => (
            <div key={d} style={{ flex: 1, textAlign: 'center', borderRadius: 16, padding: '9px 0', ...pill(sel) }}>
              <div style={{ fontSize: 10.5, opacity: 0.8 }}>{d}</div>
              <div style={{ ...H(15.5) }}>{n}</div>
            </div>
          ))}
        </div>

        <span style={label}>Time</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {([['6:30 AM', false], ['7:00 AM', true], ['7:30 AM', false], ['6:00 PM', false], ['6:30 PM', false]] as const).map(([t, sel]) => (
            <span key={t} style={{ ...H(12.5, 600), letterSpacing: 0, borderRadius: 99, padding: '8px 15px', ...pill(sel) }}>{t}</span>
          ))}
        </div>

        <span style={label}>Anything extra? <span style={{ fontWeight: 500, color: C.muted2 }}>(optional)</span></span>
        <div style={{ ...field, padding: '10px 14px', fontSize: 12.5, color: C.sub, marginBottom: 5 }}>
          We're out of poop bags, please bring a roll.
        </div>
        <div style={{ ...hint, marginBottom: 18 }}>If your volunteer accepts, they bring it at MRP, added to the bill.</div>

        <div style={{ ...card, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 12, marginBottom: 12, borderBottom: `1px dashed ${C.bandBorder}` }}>
            <Avatar src={IMG.priya} size={34} />
            <div style={{ flex: 1, fontSize: 11.5, color: C.muted, lineHeight: 1.4 }}>
              <div style={{ ...H(13), color: C.ink }}>Priya S. · Tower C</div>
              Tuesday 9 Sep · 7:00 AM · 1 hour
            </div>
            <span style={chip()}>+25 Paw Points</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: C.muted2 }}>Total</div>
              <div style={{ ...H(21, 800) }}>₹249</div>
            </div>
            <span style={{ ...H(14.5), background: C.orange, color: '#fff', borderRadius: 99, padding: '13px 30px', boxShadow: '0 12px 28px rgba(224,102,47,.3)' }}>Confirm</span>
          </div>
        </div>
      </div>
    </Phone>
  );
}

/* ------------------------------ 6. PAYMENT ------------------------------ */

function Payment() {
  return (
    <Phone>
      {/* dimmed booking behind the sheet */}
      <div style={{ filter: 'blur(2px)', opacity: 0.35, pointerEvents: 'none' }}>
        <Header title="Book a walk" />
        <div style={{ padding: '0 20px' }}>
          <div style={{ ...card, padding: 14, marginBottom: 12, display: 'flex', gap: 11, alignItems: 'center' }}>
            <Avatar src={IMG.biscuit} size={44} />
            <div>
              <div style={{ ...H(15) }}>Biscuit · 1 hour walk</div>
              <div style={{ fontSize: 12, color: C.muted }}>Tuesday 9 Sep · 7:00 AM · Priya S.</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,48,31,.28)' }} />

      {/* bottom sheet */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: C.card, borderRadius: '28px 28px 0 0', boxShadow: '0 -18px 50px rgba(20,48,31,.2)', padding: '10px 20px 26px' }}>
        <div style={{ width: 42, height: 5, borderRadius: 99, background: C.bandBorder, margin: '0 auto 16px' }} />
        <div style={{ ...eyebrow, marginBottom: 4 }}>Checkout · ₹249</div>
        <div style={{ ...H(20), marginBottom: 2 }}>How would you like to pay?</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>Pay now online, or after the service.</div>

        {/* pay now (selected) */}
        <div style={{ border: `1.5px solid ${C.orange}`, background: '#fff8f3', borderRadius: 20, padding: 13, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
            <span style={{ width: 19, height: 19, borderRadius: 99, border: `6px solid ${C.orange}`, background: '#fff' }} />
            <span style={{ ...H(14.5) }}>Pay now</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <span style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, ...H(12.5, 600), letterSpacing: 0, borderRadius: 999, padding: '10px 0', background: C.card, border: `1px solid ${C.border}`, color: C.sub }}>
              <Ic d={paths.card} size={15} color={C.muted} /> Pay online (via card)
            </span>
            <span style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, ...H(12.5, 700), letterSpacing: 0, borderRadius: 999, padding: '10px 0', background: C.green, color: '#fff' }}>
              <Ic d={paths.qr} size={15} color="#fff" /> Pay by UPI
            </span>
          </div>
          {/* QR */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 12 }}>
            <img src="/mobile/upi-qr.png" alt="UPI QR" style={{ width: 104, height: 104, borderRadius: 10 }} />
            <div style={{ flex: 1 }}>
              <div style={{ ...H(13.5), marginBottom: 2 }}>Scan with any UPI app</div>
              <div style={{ fontSize: 12.5, color: C.ink, fontWeight: 600, marginBottom: 8 }}>proxypaw•••@upi · ₹249</div>
              <span style={chip()}>GPay · PhonePe · Paytm</span>
            </div>
          </div>
        </div>

        {/* pay after */}
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 20, padding: 13, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ width: 19, height: 19, borderRadius: 99, border: `1.5px solid ${C.btnBorder}`, background: '#fff' }} />
          <div style={{ flex: 1 }}>
            <span style={{ ...H(14.5) }}>Pay after the service</span>
            <div style={{ fontSize: 11.5, color: C.muted }}>UPI or cash, once the booking is done</div>
          </div>
          <Ic d={paths.cash} size={18} color={C.muted2} />
        </div>

        <div style={{ fontSize: 11, color: C.muted2, lineHeight: 1.55, textAlign: 'center', marginBottom: 12 }}>
          Pay with a card or with UPI, before or after the service. Pay before using these two online methods, or pay after the service using UPI or cash.
        </div>
        <div style={primary}>Confirm booking</div>
      </div>
    </Phone>
  );
}

/* ------------------------------ 7. LIVE WALK ------------------------------ */

/** Top-down garden-community map: lawn, path loop, towers, trees, pond. */
function CommunityMap() {
  const tower = (x: number, y: number, w: number, h: number, name: string) => (
    <g key={name}>
      <rect x={x + 3} y={y + 4} width={w} height={h} rx="7" fill="#1f6b3a" opacity=".14" />
      <rect x={x} y={y} width={w} height={h} rx="7" fill="#f3efe6" stroke="#dcd6c8" />
      <rect x={x + 6} y={y + 6} width={w - 12} height={h - 12} rx="4" fill="#dcd6c8" opacity=".55" />
      {[0, 1, 2].map((r) => (
        <rect key={r} x={x + 10} y={y + 11 + r * ((h - 22) / 3)} width={w - 20} height="3" rx="1.5" fill="#ffd978" opacity=".8" />
      ))}
      <rect x={x + w / 2 - 17} y={y + h + 5} width="34" height="15" rx="7.5" fill="#fff" stroke="#e1ecdc" />
      <text x={x + w / 2} y={y + h + 15.5} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#3f5547" fontFamily="Inter, sans-serif">{name}</text>
    </g>
  );
  const tree = (x: number, y: number, r: number, k: string) => (
    <g key={k}>
      <circle cx={x + 2} cy={y + 3} r={r} fill="#1f6b3a" opacity=".18" />
      <circle cx={x} cy={y} r={r} fill="#49a85a" />
      <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.55} fill="#8bc34a" opacity=".75" />
    </g>
  );
  const trees: [number, number, number][] = [
    [22, 128, 10], [30, 152, 8], [128, 22, 9], [150, 30, 7], [330, 130, 10], [318, 156, 8],
    [196, 20, 8], [128, 282, 9], [206, 286, 8], [228, 274, 6], [120, 106, 7], [236, 100, 8],
    [104, 196, 6], [268, 214, 7], [176, 92, 5],
  ];
  return (
    <svg width="100%" height="100%" viewBox="0 0 350 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="350" height="300" fill="#cfe8c4" />
      {/* lawn texture */}
      {Array.from({ length: 40 }).map((_, i) => (
        <circle key={i} cx={(i * 83) % 350} cy={(i * 47) % 300} r="1.4" fill="#8bc34a" opacity=".35" />
      ))}
      {/* central lawn */}
      <ellipse cx="176" cy="160" rx="78" ry="56" fill="#b9dca8" />
      <ellipse cx="176" cy="160" rx="78" ry="56" fill="none" stroke="#a6d18f" strokeWidth="2" strokeDasharray="2 5" />
      {/* pond */}
      <ellipse cx="196" cy="168" rx="26" ry="15" fill="#9ed6ea" />
      <ellipse cx="190" cy="164" rx="9" ry="3" fill="#fff" opacity=".5" />
      {/* walking path loop */}
      <path d="M58 104 C 110 70, 240 66, 290 104 S 310 230, 250 244 S 90 250, 66 210 S 30 130, 58 104 Z" fill="none" stroke="#dfe9d8" strokeWidth="15" strokeLinejoin="round" />
      <path d="M58 104 C 110 70, 240 66, 290 104 S 310 230, 250 244 S 90 250, 66 210 S 30 130, 58 104 Z" fill="none" stroke="#eef6e9" strokeWidth="11" strokeLinejoin="round" />
      {/* towers */}
      {tower(20, 22, 76, 56, 'Tower C')}
      {tower(258, 18, 74, 60, 'Tower A')}
      {tower(14, 228, 72, 44, 'Tower B')}
      {tower(270, 226, 66, 46, 'Tower D')}
      {trees.map(([x, y, r], i) => tree(x, y, r, `t${i}`))}
      <text x="176" y="128" textAnchor="middle" fontSize="9" fontWeight="700" fill="#1f6b3a" fontFamily="Inter, sans-serif" letterSpacing="1">CENTRAL LAWN</text>
      {/* walked route */}
      <path d="M62 102 C 110 72, 240 68, 288 104 S 312 200, 296 218" fill="none" stroke="#e0662f" strokeWidth="4" strokeLinecap="round" strokeDasharray="0.5 8" />
      <circle cx="62" cy="102" r="7" fill="#2e7d4f" stroke="#fff" strokeWidth="2.5" />
    </svg>
  );
}

function Track() {
  return (
    <Phone>
      <Header title="Live walk" right={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...chip(), fontSize: 11.5, padding: '6px 12px' }}><span style={{ width: 7, height: 7, borderRadius: 99, background: C.greenBright, boxShadow: '0 0 0 3px rgba(73,168,90,.25)' }} />LIVE</span>} />
      <div style={{ padding: '0 20px 20px', overflow: 'hidden' }}>
        {/* garden community map */}
        <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', border: `1px solid ${C.border}`, height: 318, marginBottom: 12, boxShadow: '0 12px 30px rgba(28,60,40,.10)' }}>
          <CommunityMap />
          <div style={{ position: 'absolute', left: 264, top: 210, width: 42, height: 42, borderRadius: 99, background: C.orange, display: 'grid', placeItems: 'center', border: '3px solid #fff', boxShadow: '0 0 0 8px rgba(224,102,47,.18), 0 8px 22px rgba(224,102,47,.45)' }}>
            <Paw size={19} />
          </div>
          <div style={{ position: 'absolute', left: 12, bottom: 12, right: 12, display: 'flex', gap: 8 }}>
            {[['18 min', 'elapsed'], ['1.2 km', 'walked'], ['2', 'photos sent']].map(([v, k]) => (
              <div key={k} style={{ flex: 1, background: 'rgba(255,255,255,.95)', border: `1px solid ${C.border}`, borderRadius: 16, padding: '8px 0', textAlign: 'center', boxShadow: '0 6px 16px rgba(28,60,40,.08)' }}>
                <div style={{ ...H(15.5, 800) }}>{v}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{k}</div>
              </div>
            ))}
          </div>
        </div>

        {/* walker strip */}
        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 11, padding: 11, marginBottom: 10 }}>
          <Avatar src={IMG.priya} size={44} />
          <div style={{ flex: 1 }}>
            <div style={{ ...H(14.5) }}>Priya is walking Biscuit</div>
            <div style={{ fontSize: 11.5, color: C.muted }}>Photo updates every 15 min, as you asked</div>
          </div>
          <span style={{ width: 40, height: 40, borderRadius: 999, background: C.greenPale, display: 'grid', placeItems: 'center' }}><Ic d={paths.msg} size={17} color={C.green} sw={2} /></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 14 }}>
          <Ic d={paths.swap} size={12} color={C.orangeDark} />
          <span style={{ fontSize: 11.5, color: C.orangeDark, fontWeight: 600 }}>Not working out? Request a change, no questions asked</span>
        </div>

        {/* timeline */}
        <div style={{ ...H(15.5), marginBottom: 10 }}>Walk updates</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {([
            ['7:02 AM', 'Picked up Biscuit, towel and poop bags packed', true, null],
            ['7:09 AM', 'Photo update sent · lawn zoomies in progress', true, IMG.walkPhoto],
            ['7:15 AM', 'Water break at Tower C gate', true, null],
            ['7:20 AM', 'Heading back via the shaded path', false, null],
          ] as const).map(([t, txt, done, img], i, arr) => (
            <div key={t} style={{ display: 'flex', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ width: 22, height: 22, borderRadius: 99, background: done ? C.green : C.card, border: `1.5px solid ${done ? C.green : C.btnBorder}`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  {done ? <Ic d={paths.check} size={11} color="#fff" sw={3} /> : <Ic d={paths.clock} size={11} color={C.muted2} />}
                </span>
                {i < arr.length - 1 && <span style={{ width: 2, flex: 1, background: done ? C.greenChip : C.band, minHeight: 14 }} />}
              </div>
              <div style={{ paddingBottom: 12, flex: 1, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10.5, color: C.muted2, fontWeight: 600 }}>{t}</div>
                  <div style={{ fontSize: 13, color: C.sub }}>{txt}</div>
                </div>
                {img && <img src={img} alt="" style={{ width: 46, height: 46, borderRadius: 12, objectFit: 'cover' }} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Phone>
  );
}

/* ------------------------------ 9. SWITCH ------------------------------ */

function Switch() {
  return (
    <Phone nav="bookings">
      <Header title="Request a change" />
      <div style={{ padding: '0 20px 20px', overflow: 'hidden' }}>
        {/* current volunteer */}
        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 11, padding: 12, marginBottom: 18 }}>
          <Avatar src={IMG.priya} size={46} />
          <div style={{ flex: 1 }}>
            <div style={{ ...H(14.5) }}>Priya S. · walking Biscuit</div>
            <div style={{ fontSize: 11.5, color: C.muted }}>Your current volunteer for this booking</div>
          </div>
          <span style={chip()}>ACTIVE</span>
        </div>

        {/* reason */}
        <span style={label}>What is not working?</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
          {([['Late or missed visits', true], ['Instructions not followed', false], ['My pet seems uneasy', false], ['Something else', false]] as const).map(([t, sel]) => (
            <span key={t} style={{ ...H(12.5, 600), letterSpacing: 0, borderRadius: 99, padding: '9px 15px', ...pill(sel) }}>{t}</span>
          ))}
        </div>

        {/* what happens next */}
        <div style={{ ...card, padding: 15, marginBottom: 12 }}>
          <div style={{ ...eyebrow, marginBottom: 11 }}>What happens next</div>
          {[
            'Your ticket reaches our team instantly',
            'The next best verified volunteer is assigned right away',
            'Your current volunteer continues until the new one arrives, so care never pauses',
          ].map((t, i) => (
            <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: i < 2 ? 10 : 0 }}>
              <span style={{ width: 22, height: 22, borderRadius: 99, background: C.greenPale, color: C.green, display: 'grid', placeItems: 'center', ...H(11, 800), flexShrink: 0 }}>{i + 1}</span>
              <span style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.5 }}>{t}</span>
            </div>
          ))}
        </div>

        {/* no awkwardness */}
        <div style={{ ...card, background: C.greenPale, borderColor: C.greenChip, boxShadow: 'none', padding: 13, marginBottom: 18, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ width: 34, height: 34, borderRadius: 999, background: C.green, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Ic d={paths.shield} size={16} color="#fff" />
          </span>
          <div style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.55 }}>
            <span style={{ ...H(12.5), color: C.green }}>Switch until it feels right.</span> Volunteers
            stay professional and will not ask why: our team has that conversation for you. Once
            you are happy, the same volunteer comes for every booking after.
          </div>
        </div>

        <div style={primary}>Raise ticket and switch</div>
        <div style={{ textAlign: 'center', fontSize: 11, color: C.muted2, marginTop: 9 }}>
          Your replacement is arranged immediately, no questions asked.
        </div>
      </div>
    </Phone>
  );
}

/* ------------------------------ 10. COMMUNITY ------------------------------ */

function Community() {
  const pets = [
    { n: 'Chai', img: IMG.chai, breed: 'Persian cat', tower: 'Tower 2', need: 'Feeding + play, weekday evenings' },
    { n: 'Donut', img: IMG.donut, breed: 'French bulldog', tower: 'Tower 5', need: 'Evening walks + weekend boarding' },
    { n: 'Lily', img: IMG.lily, breed: 'Tabby cat', tower: 'Tower 5', need: 'Litter + cuddles when parents travel' },
    { n: 'Lolio', img: IMG.lolio, breed: 'Retriever', tower: 'Tower 7', need: 'Morning walks, 30 min' },
  ];
  return (
    <Phone nav="community">
      <div style={{ padding: '22px 20px 96px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ ...H(23, 800) }}>Your community</div>
          <span style={{ ...chip(), fontSize: 11 }}>Prestige High Fields</span>
        </div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 13 }}>Every pet in your towers, and what they are looking for.</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 12 }}>
          {pets.map((pt) => (
            <div key={pt.n} style={{ ...card, padding: 10, display: 'flex', alignItems: 'center', gap: 11 }}>
              <img src={pt.img} alt={pt.n} style={{ width: 48, height: 48, borderRadius: 999, objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ ...H(14) }}>{pt.n}</span>
                  <span style={{ ...chip(), fontSize: 10, padding: '2px 8px' }}>{pt.tower}</span>
                </div>
                <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>{pt.breed} &middot; {pt.need}</div>
              </div>
              <span style={{ ...H(11.5), letterSpacing: '-0.01em', background: C.orange, color: '#fff', borderRadius: 99, padding: '8px 12px', flexShrink: 0 }}>Raise a request</span>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 10.5, color: C.muted2, textAlign: 'center', marginBottom: 14 }}>
          Requests reach our team instantly. Smart volunteer auto-assign is on the way.
        </div>

        <div style={{ ...H(15.5), marginBottom: 10 }}>What neighbours say</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {[
            { n: 'Rhea M.', t: 'Tower 5', img: IMG.rhea, q: 'Donut waits at the door for his walker now. I get photos before I even think to ask.' },
            { n: 'Arjun T.', t: 'Tower 2', img: IMG.arjun, q: 'Ten days away: Chai was fed, brushed and entertained at home, and stayed calm.' },
          ].map((r) => (
            <div key={r.n} style={{ ...card, padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
                <img src={r.img} alt={r.n} style={{ width: 32, height: 32, borderRadius: 99, objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <span style={{ ...H(13) }}>{r.n}</span>
                  <span style={{ fontSize: 11, color: C.muted2 }}> &middot; {r.t}</span>
                </div>
                <span style={{ display: 'inline-flex', gap: 2 }}>
                  {[0, 1, 2, 3, 4].map((i) => <Ic key={i} d={paths.star} size={11} color={C.gold} fill={C.gold} />)}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.55 }}>&ldquo;{r.q}&rdquo;</div>
            </div>
          ))}
        </div>
      </div>
    </Phone>
  );
}

/* ------------------------------ 8. BOOKINGS ------------------------------ */

function Bookings() {
  return (
    <Phone nav="bookings">
      <div style={{ padding: '22px 20px 0', overflow: 'hidden' }}>
        <div style={{ ...H(23, 800), marginBottom: 12 }}>Your bookings</div>
        <div style={{ display: 'flex', gap: 6, background: C.card, border: `1px solid ${C.border}`, borderRadius: 999, padding: 4, marginBottom: 16 }}>
          {['All', 'Walks', 'Boarding', 'Sitting'].map((t, i) => (
            <span key={t} style={{ flex: 1, textAlign: 'center', ...H(12, 700), letterSpacing: 0, borderRadius: 999, padding: '7px 0', background: i === 0 ? C.green : 'transparent', color: i === 0 ? '#fff' : C.muted }}>{t}</span>
          ))}
        </div>

        <div style={{ ...eyebrow, marginBottom: 8 }}>Upcoming</div>
        <div style={{ ...card, padding: 14, marginBottom: 16, background: `linear-gradient(135deg, #ffffff 55%, ${C.greenPale})` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar src={IMG.biscuit} size={42} />
            <div style={{ flex: 1 }}>
              <div style={{ ...H(14.5) }}>1 hour walk · Biscuit</div>
              <div style={{ fontSize: 11.5, color: C.muted }}>Today 7:00 AM · Priya S. · ₹249</div>
            </div>
            <span style={chip()}>CONFIRMED</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <span style={{ flex: 1, textAlign: 'center', ...H(12.5), background: C.orange, color: '#fff', borderRadius: 99, padding: '9px 0', boxShadow: '0 8px 18px rgba(224,102,47,.25)' }}>Track live</span>
            <span style={{ flex: 1, textAlign: 'center', ...ghost }}>Reschedule</span>
          </div>
        </div>

        <div style={{ ...eyebrow, marginBottom: 8 }}>Earlier</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { t: 'Overnight boarding · Momo', d: 'Sat 30 Aug · 2 nights · Marcus R. · ₹898', ph: '6 photos', img: IMG.momo },
            { t: '1 hour walk · Biscuit', d: 'Fri 29 Aug · Priya S. · ₹249', ph: '4 photos', img: IMG.biscuit },
            { t: 'Pet sitting & feeding · Momo', d: 'Thu 28 Aug · Ananya M. · ₹129', ph: '2 photos', img: IMG.momo },
          ].map((b) => (
            <div key={b.d} style={{ ...card, padding: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar src={b.img} size={42} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ ...H(13.5) }}>{b.t}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{b.d}</div>
                </div>
                <span style={ghost}>Rebook</span>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 9, paddingTop: 9, borderTop: `1px solid ${C.band}`, fontSize: 11, color: C.sub, alignItems: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Ic d={paths.star} size={11} color={C.gold} fill={C.gold} /> Rated 5.0</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Ic d={paths.camera} size={11} color={C.muted2} /> {b.ph}</span>
                <span style={{ marginLeft: 'auto', color: C.green, fontWeight: 600 }}>+25 Paw Points</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <span style={{ fontSize: 11.5, color: C.muted2 }}>Every booking, every photo, every rating, kept for you.</span>
        </div>
      </div>
    </Phone>
  );
}

export const MOBILE_SCREENS: Record<string, () => ReactNode> = {
  home: Home,
  services: Services,
  pet: Pet,
  walkers: Walkers,
  booking: Booking,
  bookings: Bookings,
  payment: Payment,
  track: Track,
  switch: Switch,
  community: Community,
};
