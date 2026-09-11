/**
 * ProxyPaw mobile app UI — display mockups for the "Inside the app" page.
 *
 * Seven phone screens (390x844) in the site's design system: cream ground,
 * orange primary, ink, forest green and gold accents, Fredoka headings and
 * Nunito body. Captured as uniform screenshots by tools at /mshots.html.
 * Display-only: no live logic, sample data throughout. No fake iOS status
 * bar or keyboard, per mobile-mockup rules — the real device draws those.
 */
import type { CSSProperties, ReactNode } from 'react';

export const C = {
  cream: '#f6f1e7', card: '#fffdf8', ink: '#2a2118', orange: '#e0662f',
  orangeDark: '#c24e1d', green: '#3f6c51', greenPale: '#eef0e4', gold: '#f0b429',
  band: '#f1eadb', border: '#eee3cf', muted: '#8b7a63', muted2: '#a08e73',
  sub: '#6f5f4b', btnBorder: '#d9cbb2', peach: '#f9e7da', cream2: '#fdf9f0',
};
const F = "'Fredoka', system-ui, sans-serif";

const IMG = {
  biscuit: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&q=80&auto=format&fit=crop',
  momo: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&q=80&auto=format&fit=crop',
  walkPhoto: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&q=80&auto=format&fit=crop',
  boarding: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&q=80&auto=format&fit=crop',
  sitting: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=500&q=80&auto=format&fit=crop',
  walking: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=500&q=80&auto=format&fit=crop',
  chai: 'https://images.unsplash.com/photo-1518288774672-b94e808873ff?w=300&h=300&q=75&auto=format&fit=crop&crop=faces',
  lily: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=300&h=300&q=75&auto=format&fit=crop&crop=faces',
  lolio: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=300&h=300&q=75&auto=format&fit=crop&crop=faces',
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

/* ------------------------------ shell ------------------------------ */

function Phone({ children, nav }: { children: ReactNode; nav?: 'home' | 'bookings' | 'community' | 'profile' }) {
  return (
    <div style={{ width: 390, height: 844, background: C.cream, color: C.ink, fontFamily: "'Nunito', system-ui, sans-serif", position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
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
    <div style={{ background: C.card, borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '10px 8px 22px', flexShrink: 0 }}>
      {items.map((it) =>
        it.key === 'book' ? (
          <div key={it.key} style={{ width: 54, height: 54, borderRadius: 20, background: C.orange, display: 'grid', placeItems: 'center', boxShadow: '0 10px 22px rgba(224,102,47,.35)', marginTop: -26 }}>
            <Ic d={it.d} size={24} color="#fff" sw={2.4} />
          </div>
        ) : (
          <div key={it.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 58 }}>
            <Ic d={it.d} size={21} color={active === it.key ? C.orange : C.muted2} sw={active === it.key ? 2.1 : 1.7} />
            <span style={{ fontFamily: F, fontWeight: 500, fontSize: 10.5, color: active === it.key ? C.orange : C.muted2 }}>{it.label}</span>
          </div>
        ),
      )}
    </div>
  );
}

function Header({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 20px 14px', flexShrink: 0 }}>
      <span style={{ width: 38, height: 38, borderRadius: 13, background: C.card, border: `1px solid ${C.border}`, display: 'grid', placeItems: 'center' }}>
        <Ic d={paths.back} size={18} />
      </span>
      <span style={{ fontFamily: F, fontWeight: 600, fontSize: 18, flex: 1, whiteSpace: 'nowrap' }}>{title}</span>
      {right}
    </div>
  );
}

const card: CSSProperties = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 20 };
const label: CSSProperties = { fontFamily: F, fontWeight: 600, fontSize: 13.5, color: C.ink, marginBottom: 6, display: 'block' };
const hint: CSSProperties = { fontSize: 11, color: C.muted2, lineHeight: 1.45 };

/* ------------------------------ 1. HOME ------------------------------ */

function Home() {
  return (
    <Phone nav="home">
      <div style={{ padding: '22px 20px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 13, color: C.muted }}>Good morning</div>
            <div style={{ fontFamily: F, fontWeight: 600, fontSize: 22 }}>Ananya · Prestige High Fields</div>
          </div>
          <span style={{ width: 42, height: 42, borderRadius: 15, background: C.card, border: `1px solid ${C.border}`, display: 'grid', placeItems: 'center', position: 'relative' }}>
            <Ic d={paths.bell} size={19} />
            <span style={{ position: 'absolute', top: 9, right: 10, width: 8, height: 8, borderRadius: 99, background: C.orange, border: `2px solid ${C.card}` }} />
          </span>
        </div>

        {/* pets */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {[{ n: 'Biscuit', img: IMG.biscuit, on: true }, { n: 'Momo', img: IMG.momo, on: false }].map((p) => (
            <div key={p.n} style={{ display: 'flex', alignItems: 'center', gap: 8, background: p.on ? C.ink : C.card, color: p.on ? C.cream2 : C.ink, border: `1px solid ${p.on ? C.ink : C.border}`, borderRadius: 99, padding: '6px 14px 6px 6px' }}>
              <img src={p.img} alt={p.n} style={{ width: 30, height: 30, borderRadius: 99, objectFit: 'cover' }} />
              <span style={{ fontFamily: F, fontWeight: 600, fontSize: 13.5 }}>{p.n}</span>
            </div>
          ))}
          <div style={{ display: 'grid', placeItems: 'center', width: 42, height: 42, borderRadius: 99, border: `1.5px dashed ${C.btnBorder}`, color: C.muted2 }}>
            <Ic d={paths.plus} size={16} color={C.muted2} />
          </div>
        </div>

        {/* next booking */}
        <div style={{ ...card, background: C.ink, color: C.cream2, border: 'none', padding: 18, marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
          <span style={{ position: 'absolute', right: -14, top: -12, opacity: 0.08 }}><Paw size={90} /></span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, color: '#c9b799', marginBottom: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: '#7a9a4e' }} />
            NEXT UP · TODAY 7:00 AM
          </div>
          <div style={{ fontFamily: F, fontWeight: 600, fontSize: 18, marginBottom: 3 }}>1 hour walk with Priya</div>
          <div style={{ fontSize: 12.5, color: '#c9b799', marginBottom: 12 }}>Tower C lawn loop · Photo updates every 15 min</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontFamily: F, fontWeight: 600, fontSize: 12.5, background: C.orange, color: '#fff', borderRadius: 99, padding: '8px 16px' }}>Track live</span>
            <span style={{ fontFamily: F, fontWeight: 600, fontSize: 12.5, border: '1.2px solid rgba(253,249,240,.3)', borderRadius: 99, padding: '8px 16px' }}>Reschedule</span>
          </div>
        </div>

        {/* paw points */}
        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', marginBottom: 16 }}>
          <span style={{ width: 36, height: 36, borderRadius: 12, background: C.gold, display: 'grid', placeItems: 'center' }}><Paw size={17} color={C.ink} /></span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: F, fontWeight: 600, fontSize: 14.5 }}>250 Paw Points</div>
            <div style={{ fontSize: 11.5, color: C.muted }}>+25 on every booking · redeem on your next walk</div>
          </div>
          <Ic d={paths.chevR} size={16} color={C.muted2} />
        </div>

        {/* services */}
        <div style={{ fontFamily: F, fontWeight: 600, fontSize: 16.5, marginBottom: 10 }}>Book a service</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9, marginBottom: 16 }}>
          {[
            { t: 'Dog walking', p: 'from ₹149', img: IMG.walking },
            { t: 'Home boarding', p: 'from ₹449', img: IMG.boarding },
            { t: 'Pet sitting', p: '₹129 / visit', img: IMG.sitting },
          ].map((s) => (
            <div key={s.t} style={{ ...card, overflow: 'hidden' }}>
              <img src={s.img} alt="" style={{ width: '100%', height: 64, objectFit: 'cover' }} />
              <div style={{ padding: '8px 9px 10px' }}>
                <div style={{ fontFamily: F, fontWeight: 600, fontSize: 12, lineHeight: 1.2 }}>{s.t}</div>
                <div style={{ fontSize: 10.5, color: C.orangeDark, fontWeight: 700 }}>{s.p}</div>
              </div>
            </div>
          ))}
        </div>

        {/* update feed */}
        <div style={{ fontFamily: F, fontWeight: 600, fontSize: 16.5, marginBottom: 10 }}>From your last booking</div>
        <div style={{ ...card, display: 'flex', gap: 12, padding: 12 }}>
          <img src={IMG.walkPhoto} alt="" style={{ width: 64, height: 64, borderRadius: 14, objectFit: 'cover' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: F, fontWeight: 600, fontSize: 13.5 }}>Priya sent 4 photos</div>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rows.map((r) => (
            <div key={r.t} style={{ ...card, overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: 12, padding: 12 }}>
                <img src={r.img} alt="" style={{ width: 86, height: 86, borderRadius: 16, objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: F, fontWeight: 600, fontSize: 15.5, marginBottom: 2 }}>{r.t}</div>
                  <div style={{ fontSize: 11.5, color: C.orangeDark, fontWeight: 700, marginBottom: 5 }}>{r.price}</div>
                  <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.45 }}>{r.d}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 7 }}>
                    {r.tags.map((tg) => (
                      <span key={tg} style={{ fontSize: 10, fontWeight: 700, background: C.greenPale, color: C.green, borderRadius: 99, padding: '3px 9px' }}>{tg}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ ...card, background: C.peach, borderColor: '#f4d9c4', padding: 14, marginTop: 14 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <span style={{ width: 34, height: 34, borderRadius: 12, background: C.orange, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Paw size={16} /></span>
            <div>
              <div style={{ fontFamily: F, fontWeight: 600, fontSize: 13.5, marginBottom: 3 }}>Need something extra?</div>
              <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.5 }}>
                Missing food, medicine or equipment at home? Ask in your booking. If your volunteer accepts, they bring it at MRP, no markup.
              </div>
            </div>
          </div>
        </div>

        <div style={{ ...card, background: C.greenPale, borderColor: '#d9dec4', padding: '11px 14px', marginTop: 12, textAlign: 'center', fontSize: 12, fontWeight: 700, color: C.green }}>
          We only list what we can actually deliver. Grooming add-ons are next.
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
      <Header title="Your pet" />
      <div style={{ padding: '0 20px 30px', overflow: 'hidden' }}>
        {/* photo + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <div style={{ position: 'relative' }}>
            <img src={IMG.biscuit} alt="Biscuit" style={{ width: 76, height: 76, borderRadius: 26, objectFit: 'cover', border: `3px solid ${C.card}`, boxShadow: '0 8px 20px rgba(74,52,24,.16)' }} />
            <span style={{ position: 'absolute', right: -5, bottom: -5, width: 27, height: 27, borderRadius: 10, background: C.orange, display: 'grid', placeItems: 'center', border: `2px solid ${C.cream}` }}>
              <Ic d={paths.camera} size={13} color="#fff" />
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <span style={label}>Name <span style={{ color: C.orangeDark }}>*</span></span>
            <div style={{ ...card, borderRadius: 14, padding: '10px 14px', fontSize: 15, fontWeight: 700 }}>Biscuit</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <span style={label}>Birth date <span style={{ color: C.orangeDark }}>*</span></span>
            <div style={{ ...card, borderRadius: 14, padding: '10px 14px', fontSize: 14 }}>12 Mar 2024</div>
          </div>
          <div style={{ width: 96 }}>
            <span style={label}>Age</span>
            <div style={{ borderRadius: 14, padding: '10px 14px', fontSize: 14, background: C.greenPale, border: '1px solid #d9dec4', color: C.green, fontWeight: 700 }}>2 yrs</div>
          </div>
        </div>

        {/* temperament */}
        <span style={label}>What's Biscuit like?</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 6 }}>
          {traits.map((t) => {
            const sel = on.includes(t);
            return (
              <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, borderRadius: 99, padding: '6px 11px', background: sel ? C.orange : C.card, color: sel ? '#fff' : C.sub, border: `1px solid ${sel ? C.orange : C.border}` }}>
                {sel && <Ic d={paths.check} size={11} color="#fff" sw={3} />}{t}
              </span>
            );
          })}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, borderRadius: 99, padding: '6px 11px', background: C.card, border: `1.5px dashed ${C.btnBorder}`, color: C.muted }}>
            Other: <em style={{ fontStyle: 'normal', color: C.ink }}>gentle giant energy</em>
          </span>
        </div>
        <div style={{ ...hint, marginBottom: 12 }}>Other: 5 words max.</div>

        {/* medical */}
        <span style={label}>Medical & care <span style={{ fontWeight: 400, color: C.muted2 }}>(optional)</span></span>
        <div style={{ ...card, borderRadius: 14, padding: '10px 14px', fontSize: 12.5, color: C.sub, lineHeight: 1.5, marginBottom: 4 }}>
          Monthly deworming on the 5th. Fish-oil capsule with dinner. Mild chicken allergy, no chicken treats.
        </div>
        <div style={{ ...hint, display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span>Allergies, medication, supplements.</span><span>17/200 words</span>
        </div>

        {/* instructions */}
        <span style={label}>Instructions for your volunteer <span style={{ fontWeight: 400, color: C.muted2 }}>(optional)</span></span>
        <div style={{ ...card, borderRadius: 14, padding: '10px 14px', fontSize: 12.5, color: C.sub, lineHeight: 1.5, marginBottom: 4 }}>
          Photo update every 15 minutes on walks. For boarding: dinner at 8 PM, one scoop, and he sleeps with the hallway light on.
        </div>
        <div style={{ ...hint, marginBottom: 16 }}>
          Keep it practical: only requests our volunteers can actually carry out. 200 words max. Only your booked volunteer sees this.
        </div>

        <div style={{ fontFamily: F, fontWeight: 600, fontSize: 15.5, textAlign: 'center', background: C.orange, color: '#fff', borderRadius: 99, padding: '15px 0', boxShadow: '0 10px 24px rgba(224,102,47,.3)', marginBottom: 6 }}>
          Save Biscuit's profile
        </div>
      </div>
    </Phone>
  );
}

/* ------------------------------ 4. WALKERS ------------------------------ */

function Walkers() {
  const vols = [
    { n: 'Priya S.', tower: 'Tower C · 2 min away', rating: '4.9', walks: 98, badge: 'Walks Biscuit weekly', top: true },
    { n: 'Marcus R.', tower: 'Tower A · 4 min away', rating: '5.0', walks: 127, badge: 'Boarding host', top: true },
    { n: 'Ananya M.', tower: 'Tower B · 3 min away', rating: '4.9', walks: 84, badge: 'Great with cats', top: false },
    { n: 'Rahul K.', tower: 'Tower D · 6 min away', rating: '4.7', walks: 63, badge: 'Weekend sitter', top: false },
  ];
  const colors = [C.orange, C.green, C.gold, C.orangeDark];
  return (
    <Phone>
      <Header title="Volunteers nearby" right={<span style={{ fontFamily: F, fontWeight: 600, fontSize: 10.5, background: C.greenPale, color: C.green, borderRadius: 99, padding: '5px 10px', whiteSpace: 'nowrap' }}>Prestige High Fields</span>} />
      <div style={{ padding: '0 20px 20px', overflow: 'hidden' }}>
        <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 12, lineHeight: 1.5 }}>
          Every volunteer lives in your community: Aadhaar-verified, background-checked and safety-trained before their first booking.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {vols.map((v, i) => (
            <div key={v.n} style={{ ...card, padding: 14 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ width: 48, height: 48, borderRadius: 17, background: colors[i], display: 'grid', placeItems: 'center', color: '#fff', fontFamily: F, fontWeight: 600, fontSize: 17 }}>
                  {v.n[0]}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontFamily: F, fontWeight: 600, fontSize: 15 }}>{v.n}</span>
                    {v.top && <span style={{ fontSize: 9.5, fontWeight: 800, background: C.gold, color: C.ink, borderRadius: 99, padding: '2px 8px' }}>TOP RATED</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: C.muted, marginTop: 2 }}>
                    <Ic d={paths.pin} size={11} color={C.muted2} /> {v.tower}
                  </div>
                </div>
                <span style={{ fontFamily: F, fontWeight: 600, fontSize: 13.5, background: C.orange, color: '#fff', borderRadius: 99, padding: '9px 16px' }}>Book</span>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.band}`, fontSize: 11.5, color: C.sub, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Ic d={paths.star} size={12} color={C.gold} fill={C.gold} /> {v.rating} · {v.walks} bookings</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: C.green, fontWeight: 700 }}><Ic d={paths.shield} size={12} color={C.green} /> Verified</span>
                <span style={{ color: C.muted2 }}>{v.badge}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ ...card, background: C.greenPale, borderColor: '#dfe4cf', padding: 14, marginTop: 14, display: 'flex', gap: 11, alignItems: 'center' }}>
          <span style={{ width: 40, height: 40, borderRadius: 14, background: C.green, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Ic d={paths.shield} size={19} color="#fff" />
          </span>
          <div style={{ fontSize: 12, color: C.green, lineHeight: 1.5 }}>
            <span style={{ fontFamily: F, fontWeight: 600 }}>Meet them first, always.</span> Every first booking starts with a free meet-and-greet at your door, and volunteers keep 70% of what you pay.
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
      <Header title="Book a walk" />
      <div style={{ padding: '0 20px 20px', overflow: 'hidden' }}>
        {/* pet */}
        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 11, padding: 11, marginBottom: 14 }}>
          <img src={IMG.biscuit} alt="" style={{ width: 44, height: 44, borderRadius: 15, objectFit: 'cover' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: F, fontWeight: 600, fontSize: 14.5 }}>Biscuit</div>
            <div style={{ fontSize: 11.5, color: C.muted }}>Golden retriever · 2 yrs · Active & zoomy</div>
          </div>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: C.orangeDark }}>Change</span>
        </div>

        <span style={label}>Duration</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
          {[['30 min', '₹149', false], ['1 hour', '₹249', true], ['1.5 hrs', '₹349', false], ['2 hrs', '₹449', false]].map(([t, p, sel]) => (
            <div key={t as string} style={{ textAlign: 'center', borderRadius: 15, padding: '10px 0', background: sel ? C.orange : C.card, color: sel ? '#fff' : C.ink, border: `1px solid ${sel ? C.orange : C.border}` }}>
              <div style={{ fontFamily: F, fontWeight: 600, fontSize: 12.5 }}>{t}</div>
              <div style={{ fontSize: 11, color: sel ? '#ffe4d2' : C.orangeDark, fontWeight: 700 }}>{p}</div>
            </div>
          ))}
        </div>

        <span style={label}>Day</span>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[['Mon', '8', false], ['Tue', '9', true], ['Wed', '10', false], ['Thu', '11', false], ['Fri', '12', false]].map(([d, n, sel]) => (
            <div key={d as string} style={{ flex: 1, textAlign: 'center', borderRadius: 14, padding: '9px 0', background: sel ? C.orange : C.card, color: sel ? '#fff' : C.ink, border: `1px solid ${sel ? C.orange : C.border}` }}>
              <div style={{ fontSize: 10.5, opacity: 0.8 }}>{d}</div>
              <div style={{ fontFamily: F, fontWeight: 600, fontSize: 15 }}>{n}</div>
            </div>
          ))}
        </div>

        <span style={label}>Time</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {[['6:30 AM', false], ['7:00 AM', true], ['7:30 AM', false], ['6:00 PM', false], ['6:30 PM', false]].map(([t, sel]) => (
            <span key={t as string} style={{ fontFamily: F, fontWeight: 600, fontSize: 12.5, borderRadius: 99, padding: '8px 15px', background: sel ? C.orange : C.card, color: sel ? '#fff' : C.sub, border: `1px solid ${sel ? C.orange : C.border}` }}>{t}</span>
          ))}
        </div>

        <span style={label}>Anything extra? <span style={{ fontWeight: 400, color: C.muted2 }}>(optional)</span></span>
        <div style={{ ...card, borderRadius: 14, padding: '10px 14px', fontSize: 12.5, color: C.sub, marginBottom: 4 }}>
          We're out of poop bags, please bring a roll.
        </div>
        <div style={{ ...hint, marginBottom: 16 }}>If your volunteer accepts, they bring it at MRP, added to the bill.</div>

        <div style={{ ...card, display: 'flex', alignItems: 'center', padding: '13px 16px', marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11.5, color: C.muted }}>Tuesday 9 Sep · 7:00 AM · Priya S.</div>
            <div style={{ fontFamily: F, fontWeight: 600, fontSize: 17 }}>₹249 <span style={{ fontSize: 11, color: C.green, fontWeight: 700 }}>· earns 25 Paw Points</span></div>
          </div>
          <span style={{ fontFamily: F, fontWeight: 600, fontSize: 14.5, background: C.orange, color: '#fff', borderRadius: 99, padding: '13px 24px', boxShadow: '0 10px 24px rgba(224,102,47,.3)' }}>Confirm</span>
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
      <div style={{ filter: 'blur(2px)', opacity: 0.28, pointerEvents: 'none' }}>
        <Header title="Book a walk" />
        <div style={{ padding: '0 20px' }}>
          <div style={{ ...card, padding: 14, marginBottom: 12 }}>
            <div style={{ fontFamily: F, fontWeight: 600, fontSize: 15 }}>Biscuit · 1 hour walk</div>
            <div style={{ fontSize: 12, color: C.muted }}>Tuesday 9 Sep · 7:00 AM · Priya S.</div>
          </div>
        </div>
      </div>

      {/* bottom sheet */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: C.card, borderRadius: '26px 26px 0 0', boxShadow: '0 -18px 50px rgba(42,33,24,.25)', padding: '10px 20px 24px' }}>
        <div style={{ width: 42, height: 5, borderRadius: 99, background: C.band, margin: '0 auto 14px' }} />
        <div style={{ fontFamily: F, fontWeight: 600, fontSize: 18, marginBottom: 2 }}>₹249 · How would you like to pay?</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>Pay now online, or after the service.</div>

        {/* pay now (selected) */}
        <div style={{ border: `1.5px solid ${C.orange}`, background: '#fdf4ec', borderRadius: 18, padding: 13, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
            <span style={{ width: 19, height: 19, borderRadius: 99, border: `6px solid ${C.orange}`, background: '#fff' }} />
            <span style={{ fontFamily: F, fontWeight: 600, fontSize: 14.5 }}>Pay now</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <span style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: F, fontWeight: 600, fontSize: 12.5, borderRadius: 13, padding: '10px 0', background: C.card, border: `1px solid ${C.border}`, color: C.sub }}>
              <Ic d={paths.card} size={15} color={C.muted} /> Pay online (via card)
            </span>
            <span style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: F, fontWeight: 600, fontSize: 12.5, borderRadius: 13, padding: '10px 0', background: C.ink, color: C.cream2 }}>
              <Ic d={paths.qr} size={15} color={C.gold} /> Pay by UPI
            </span>
          </div>
          {/* QR */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 12 }}>
            <img src="/mobile/upi-qr.png" alt="UPI QR" style={{ width: 108, height: 108, borderRadius: 10 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: F, fontWeight: 600, fontSize: 13.5, marginBottom: 2 }}>Scan with any UPI app</div>
              <div style={{ fontSize: 12.5, color: C.ink, fontWeight: 700, marginBottom: 7 }}>proxypaw•••@upi · ₹249</div>
              <span style={{ fontSize: 10.5, fontWeight: 800, background: C.greenPale, color: C.green, borderRadius: 99, padding: '4px 10px' }}>GPay · PhonePe · Paytm</span>
            </div>
          </div>
        </div>

        {/* pay after */}
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 18, padding: 13, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ width: 19, height: 19, borderRadius: 99, border: `1.5px solid ${C.btnBorder}`, background: '#fff' }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontFamily: F, fontWeight: 600, fontSize: 14.5 }}>Pay after the service</span>
            <div style={{ fontSize: 11.5, color: C.muted }}>UPI or cash, once the booking is done</div>
          </div>
          <Ic d={paths.cash} size={18} color={C.muted2} />
        </div>

        <div style={{ fontSize: 11, color: C.muted2, lineHeight: 1.55, textAlign: 'center', marginBottom: 12 }}>
          Pay with a card or with UPI, before or after the service. Pay before using these two online methods, or pay after the service using UPI or cash.
        </div>
        <div style={{ fontFamily: F, fontWeight: 600, fontSize: 15.5, textAlign: 'center', background: C.orange, color: '#fff', borderRadius: 99, padding: '15px 0', boxShadow: '0 10px 24px rgba(224,102,47,.3)' }}>
          Confirm booking
        </div>
      </div>
    </Phone>
  );
}

/* ------------------------------ 7. LIVE WALK ------------------------------ */

function Track() {
  return (
    <Phone>
      <Header title="Live walk" right={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: F, fontWeight: 600, fontSize: 11.5, background: C.greenPale, color: C.green, borderRadius: 99, padding: '6px 12px' }}><span style={{ width: 7, height: 7, borderRadius: 99, background: '#7a9a4e' }} />LIVE</span>} />
      <div style={{ padding: '0 20px 20px', overflow: 'hidden' }}>
        {/* stylised community map */}
        <div style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', border: `1px solid ${C.border}`, background: '#f1ede1', height: 300, marginBottom: 14 }}>
          <svg width="100%" height="100%" viewBox="0 0 350 300" aria-hidden="true">
            <rect x="24" y="26" width="84" height="60" rx="8" fill="#e6dfd0" />
            <rect x="240" y="30" width="80" height="70" rx="8" fill="#e6dfd0" />
            <rect x="30" y="200" width="90" height="66" rx="8" fill="#e6dfd0" />
            <rect x="236" y="196" width="86" height="70" rx="8" fill="#e6dfd0" />
            <circle cx="176" cy="150" r="52" fill="#dde5cf" />
            <text x="152" y="154" fontSize="11" fontWeight="700" fill="#5a6b3f" fontFamily="Nunito">Lawn</text>
            <path d="M60 100 C 90 140, 120 110, 150 130 S 210 190, 250 170" fill="none" stroke="#e0662f" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 9" />
            <circle cx="60" cy="100" r="7" fill="#3f6c51" />
          </svg>
          <div style={{ position: 'absolute', left: 218, top: 148, width: 40, height: 40, borderRadius: 99, background: C.orange, display: 'grid', placeItems: 'center', border: '3px solid #fff', boxShadow: '0 8px 22px rgba(224,102,47,.45)' }}>
            <Paw size={19} />
          </div>
          <div style={{ position: 'absolute', left: 12, bottom: 12, right: 12, display: 'flex', gap: 8 }}>
            {[['18 min', 'elapsed'], ['1.2 km', 'walked'], ['2', 'photos sent']].map(([v, k]) => (
              <div key={k} style={{ flex: 1, background: 'rgba(255,253,248,.94)', border: `1px solid ${C.border}`, borderRadius: 14, padding: '8px 0', textAlign: 'center' }}>
                <div style={{ fontFamily: F, fontWeight: 600, fontSize: 15 }}>{v}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{k}</div>
              </div>
            ))}
          </div>
        </div>

        {/* walker strip */}
        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 11, padding: 12, marginBottom: 14 }}>
          <span style={{ width: 42, height: 42, borderRadius: 15, background: C.orange, display: 'grid', placeItems: 'center', color: '#fff', fontFamily: F, fontWeight: 600, fontSize: 16 }}>P</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: F, fontWeight: 600, fontSize: 14.5 }}>Priya is walking Biscuit</div>
            <div style={{ fontSize: 11.5, color: C.muted }}>Photo updates every 15 min, as you asked</div>
          </div>
          <span style={{ fontFamily: F, fontWeight: 600, fontSize: 12.5, border: `1.2px solid ${C.btnBorder}`, borderRadius: 99, padding: '8px 15px' }}>Message</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
          <Ic d={paths.swap} size={12} color={C.orange} />
          <span style={{ fontSize: 11.5, color: C.orange, fontWeight: 700 }}>Not working out? Request a change, no questions asked</span>
        </div>

        {/* timeline */}
        <div style={{ fontFamily: F, fontWeight: 600, fontSize: 15.5, marginBottom: 10 }}>Walk updates</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            ['7:02 AM', 'Picked up Biscuit, towel and poop bags packed', true],
            ['7:09 AM', 'Photo update sent · lawn zoomies in progress', true],
            ['7:15 AM', 'Water break at Tower C gate', true],
            ['7:20 AM', 'Heading back via the shaded path', false],
          ].map(([t, txt, done], i, arr) => (
            <div key={t as string} style={{ display: 'flex', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ width: 22, height: 22, borderRadius: 99, background: done ? C.green : C.card, border: `1.5px solid ${done ? C.green : C.btnBorder}`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  {done ? <Ic d={paths.check} size={11} color="#fff" sw={3} /> : <Ic d={paths.clock} size={11} color={C.muted2} />}
                </span>
                {i < arr.length - 1 && <span style={{ width: 2, flex: 1, background: C.band, minHeight: 16 }} />}
              </div>
              <div style={{ paddingBottom: 14 }}>
                <div style={{ fontSize: 10.5, color: C.muted2, fontWeight: 700 }}>{t}</div>
                <div style={{ fontSize: 13, color: C.sub }}>{txt}</div>
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
        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 11, padding: 13, marginBottom: 16 }}>
          <span style={{ width: 44, height: 44, borderRadius: 15, background: C.orange, display: 'grid', placeItems: 'center', color: '#fff', fontFamily: F, fontWeight: 600, fontSize: 16 }}>P</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: F, fontWeight: 600, fontSize: 14.5 }}>Priya S. · walking Biscuit</div>
            <div style={{ fontSize: 11.5, color: C.muted }}>Your current volunteer for this booking</div>
          </div>
          <span style={{ fontSize: 10.5, fontWeight: 800, background: C.greenPale, color: C.green, borderRadius: 99, padding: '4px 11px' }}>ACTIVE</span>
        </div>

        {/* reason */}
        <span style={label}>What is not working?</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {[['Late or missed visits', true], ['Instructions not followed', false], ['My pet seems uneasy', false], ['Something else', false]].map(([t, sel]) => (
            <span key={t as string} style={{ fontFamily: F, fontWeight: 600, fontSize: 12.5, borderRadius: 99, padding: '9px 15px', background: sel ? C.orange : C.card, color: sel ? '#fff' : C.ink, border: `1.2px solid ${sel ? C.orange : C.btnBorder}` }}>{t}</span>
          ))}
        </div>

        {/* what happens next */}
        <div style={{ ...card, padding: 14, marginBottom: 12 }}>
          <div style={{ fontFamily: F, fontWeight: 600, fontSize: 13.5, marginBottom: 10 }}>What happens next</div>
          {[
            'Your ticket reaches our team instantly',
            'The next best verified volunteer is assigned right away',
            'Your current volunteer continues until the new one arrives, so care never pauses',
          ].map((t, i) => (
            <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: i < 2 ? 9 : 0 }}>
              <span style={{ width: 20, height: 20, borderRadius: 99, background: C.peach, color: C.orangeDark, display: 'grid', placeItems: 'center', fontFamily: F, fontWeight: 600, fontSize: 11, flexShrink: 0 }}>{i + 1}</span>
              <span style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.5 }}>{t}</span>
            </div>
          ))}
        </div>

        {/* no awkwardness */}
        <div style={{ ...card, background: C.greenPale, borderColor: '#dfe4cf', padding: 13, marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ width: 34, height: 34, borderRadius: 12, background: C.green, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Ic d={paths.shield} size={16} color="#fff" />
          </span>
          <div style={{ fontSize: 11.5, color: C.green, lineHeight: 1.55 }}>
            <span style={{ fontFamily: F, fontWeight: 600 }}>Switch until it feels right.</span> Volunteers
            stay professional and will not ask why: our team has that conversation for you. Once
            you are happy, the same volunteer comes for every booking after.
          </div>
        </div>

        <div style={{ background: C.orange, color: '#fff', fontFamily: F, fontWeight: 600, fontSize: 15.5, textAlign: 'center', borderRadius: 18, padding: '15px 0', boxShadow: '0 12px 26px rgba(224,102,47,.35)' }}>
          Raise ticket and switch
        </div>
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
          <div style={{ fontFamily: F, fontWeight: 600, fontSize: 22 }}>Your community</div>
          <span style={{ fontFamily: F, fontWeight: 600, fontSize: 11.5, background: C.greenPale, color: C.green, borderRadius: 99, padding: '6px 12px' }}>Prestige High Fields</span>
        </div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Every pet in your towers, and what they are looking for.</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 14 }}>
          {pets.map((pt) => (
            <div key={pt.n} style={{ ...card, padding: 11, display: 'flex', alignItems: 'center', gap: 11 }}>
              <img src={pt.img} alt={pt.n} style={{ width: 46, height: 46, borderRadius: 16, objectFit: 'cover' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontFamily: F, fontWeight: 600, fontSize: 14 }}>{pt.n}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 800, background: C.peach, color: C.orangeDark, borderRadius: 99, padding: '2px 9px' }}>{pt.tower}</span>
                </div>
                <div style={{ fontSize: 11, color: C.muted }}>{pt.breed} &middot; {pt.need}</div>
              </div>
              <span style={{ fontFamily: F, fontWeight: 600, fontSize: 11.5, background: C.orange, color: '#fff', borderRadius: 99, padding: '8px 13px', flexShrink: 0 }}>Raise a request</span>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 10.5, color: C.muted2, textAlign: 'center', marginBottom: 14 }}>
          Requests reach our team instantly. Smart volunteer auto-assign is on the way.
        </div>

        <div style={{ fontFamily: F, fontWeight: 600, fontSize: 15.5, marginBottom: 10 }}>What neighbours say</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {[
            { n: 'Rhea M.', t: 'Tower 5', img: IMG.rhea, q: 'Donut waits at the door for his walker now. I get photos before I even think to ask.' },
            { n: 'Arjun T.', t: 'Tower 2', img: IMG.arjun, q: 'Ten days away: Chai was fed, brushed and entertained at home, and stayed calm.' },
          ].map((r) => (
            <div key={r.n} style={{ ...card, padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
                <img src={r.img} alt={r.n} style={{ width: 32, height: 32, borderRadius: 99, objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontFamily: F, fontWeight: 600, fontSize: 13 }}>{r.n}</span>
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
        <div style={{ fontFamily: F, fontWeight: 600, fontSize: 22, marginBottom: 14 }}>Your bookings</div>

        <div style={{ fontFamily: F, fontWeight: 600, fontSize: 13, color: C.muted, letterSpacing: '0.08em', marginBottom: 8 }}>UPCOMING</div>
        <div style={{ ...card, padding: 14, marginBottom: 16, borderLeft: `4px solid ${C.orange}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={IMG.biscuit} alt="" style={{ width: 40, height: 40, borderRadius: 14, objectFit: 'cover' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: F, fontWeight: 600, fontSize: 14.5 }}>1 hour walk · Biscuit</div>
              <div style={{ fontSize: 11.5, color: C.muted }}>Today 7:00 AM · Priya S. · ₹249</div>
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 800, background: C.greenPale, color: C.green, borderRadius: 99, padding: '4px 11px' }}>CONFIRMED</span>
          </div>
        </div>

        <div style={{ fontFamily: F, fontWeight: 600, fontSize: 13, color: C.muted, letterSpacing: '0.08em', marginBottom: 8 }}>EARLIER</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { t: 'Overnight boarding · Momo', d: 'Sat 30 Aug · 2 nights · Marcus R. · ₹898', ph: '6 photos', img: IMG.momo },
            { t: '1 hour walk · Biscuit', d: 'Fri 29 Aug · Priya S. · ₹249', ph: '4 photos', img: IMG.biscuit },
            { t: 'Pet sitting & feeding · Momo', d: 'Thu 28 Aug · Ananya M. · ₹129', ph: '2 photos', img: IMG.momo },
          ].map((b) => (
            <div key={b.d} style={{ ...card, padding: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src={b.img} alt="" style={{ width: 40, height: 40, borderRadius: 14, objectFit: 'cover' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: F, fontWeight: 600, fontSize: 13.5 }}>{b.t}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{b.d}</div>
                </div>
                <span style={{ fontFamily: F, fontWeight: 600, fontSize: 12, border: `1.2px solid ${C.btnBorder}`, borderRadius: 99, padding: '7px 14px' }}>Rebook</span>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 9, paddingTop: 9, borderTop: `1px solid ${C.band}`, fontSize: 11, color: C.sub, alignItems: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Ic d={paths.star} size={11} color={C.gold} fill={C.gold} /> Rated 5.0</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Ic d={paths.camera} size={11} color={C.muted2} /> {b.ph}</span>
                <span style={{ marginLeft: 'auto', color: C.green, fontWeight: 700 }}>+25 Paw Points</span>
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
