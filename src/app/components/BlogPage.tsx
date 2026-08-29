/**
 * The Paw Journal — full blog index, second screen of the Claude Design artifact.
 * Shares the landing page's palette and type scale.
 *
 * Card photos in the artifact were browser blob: URLs and could not be
 * recovered; POSTS[].img points at stand-ins. Swap for the real assets.
 */

import type { CSSProperties } from 'react';

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
  cream2: '#fdf9f0',
  peach: '#f9e7da',
  bandBorder: '#e9ddc8',
};

const sora = "'Sora', system-ui, sans-serif";
const shell: CSSProperties = { maxWidth: 1200, margin: '0 auto' };

const POSTS = [
  {
    tag: 'grooming',
    title: 'the apartment grooming guide for dogs & cats',
    body: 'Brushing beats bathing, monsoon coat care, and the nail-click rule every flat-dweller should know.',
    read: '5 min read',
    img: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=900&q=80&auto=format&fit=crop',
  },
  {
    tag: 'safety',
    title: 'how every proxypaw booking stays safe',
    body: 'Verification, live GPS, incident coverage and the one thing owners forget to share.',
    read: '4 min read',
    img: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=900&q=80&auto=format&fit=crop',
  },
  {
    tag: 'walking',
    title: 'walking do’s and don’ts in a gated community',
    body: 'Short leads in lobbies, the 7-second pavement test, and why sniffing beats marching.',
    read: '6 min read',
    img: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=900&q=80&auto=format&fit=crop',
  },
  {
    tag: 'play',
    title: 'play that keeps tails wagging (and whiskers happy)',
    body: 'Consent checks for dogs, hunt-catch-eat for cats, and the toy rules that prevent vet visits.',
    read: '5 min read',
    img: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=900&q=80&auto=format&fit=crop',
  },
  {
    tag: 'feeding',
    title: 'feeding right: portions, treats and the no-no list',
    body: 'The 10% treat rule, body-condition portions, and foods that should never leave your plate.',
    read: '6 min read',
    img: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=900&q=80&auto=format&fit=crop',
  },
  {
    tag: 'cats',
    title: 'the indoor cat’s guide to a bigger life',
    body: 'Vertical territory, window theatre and scent games that turn a flat into a kingdom.',
    read: '5 min read',
    img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=900&q=80&auto=format&fit=crop',
  },
  {
    tag: 'cats',
    title: 'litter box science: count, placement and cleaning',
    body: 'The n+1 rule, why the box hates the washing machine, and what changing habits really mean.',
    read: '4 min read',
    img: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=900&q=80&auto=format&fit=crop',
  },
];

function PawMark({ size, radius }: { size: number; radius: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: radius, background: C.orange, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
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

interface BlogPageProps {
  onHomeClick: () => void;
  onGetStarted: () => void;
  isLoggedIn: boolean;
}

export default function BlogPage({ onHomeClick, onGetStarted, isLoggedIn }: BlogPageProps) {
  return (
    <div style={{ minHeight: '100vh', background: C.cream, color: C.ink, overflowX: 'clip', textTransform: 'capitalize' }}>
      <style>{`
        @keyframes pp-fadeUp { from { opacity:0; transform:translateY(18px);} to {opacity:1;transform:translateY(0);} }
        .pp-screen { animation:.5s cubic-bezier(.16,1,.3,1) both pp-fadeUp; }
        .pp-dark-btn:hover { background:${C.orange} !important; transform:translateY(-2px); }
        .pp-post:hover { transform:translateY(-4px); box-shadow:0 18px 40px rgba(74,52,24,.12); }
        .pp-post:hover .pp-read { color:${C.orange}; }
        @media (prefers-reduced-motion: reduce) { .pp-screen { animation:none !important; } }
      `}</style>

      <div className="pp-screen">
        <header style={{ ...shell, padding: '22px 28px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div onClick={onHomeClick} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
            <PawMark size={38} radius={13} />
            <span style={{ fontFamily: sora, fontWeight: 800, fontSize: 21, letterSpacing: '-0.02em' }}>proxypaw</span>
          </div>
          <button
            className="pp-dark-btn"
            onClick={onGetStarted}
            style={{
              marginLeft: 'auto', border: 'none', background: C.ink, color: C.cream2,
              fontFamily: sora, fontWeight: 600, fontSize: 14.5, padding: '12px 22px',
              borderRadius: 999, cursor: 'pointer', transition: '.25s',
            }}
          >
            {isLoggedIn ? 'dashboard' : 'get started'}
          </button>
        </header>

        <section style={{ ...shell, padding: '30px 28px 0' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.orange, letterSpacing: '0.12em', marginBottom: 14 }}>
            THE PAW JOURNAL
          </div>
          <h1 style={{ fontFamily: sora, fontWeight: 800, fontSize: 'clamp(34px, 4.6vw, 58px)', letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 18px' }}>
            care guides from the pack
          </h1>
          <p style={{ fontSize: 17.5, lineHeight: 1.6, color: C.sub, maxWidth: 620, margin: '0 0 48px', fontWeight: 300, textTransform: 'none' }}>
            Short, practical reads from the proxypaw care team: grooming, feeding, safety and play, for dogs and cats alike.
          </p>
        </section>

        <section style={{ ...shell, padding: '0 28px 96px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 24 }}>
            {POSTS.map((p) => (
              <article
                key={p.title}
                className="pp-post"
                style={{
                  background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 28,
                  overflow: 'hidden', cursor: 'pointer', transition: '.3s',
                  display: 'flex', flexDirection: 'column',
                }}
              >
                <div style={{ width: '100%', height: 250, backgroundImage: `url("${p.img}")`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'inline-flex', alignSelf: 'flex-start', background: C.peach, color: C.orangeDark, fontSize: 11.5, fontWeight: 700, padding: '5px 12px', borderRadius: 999, letterSpacing: '0.05em', marginBottom: 14 }}>
                    {p.tag}
                  </div>
                  <div style={{ fontFamily: sora, fontWeight: 700, fontSize: 19, lineHeight: 1.3, marginBottom: 10 }}>{p.title}</div>
                  <div style={{ fontSize: 14.5, color: C.muted, lineHeight: 1.55, textTransform: 'none', marginBottom: 18 }}>{p.body}</div>
                  <div className="pp-read" style={{ marginTop: 'auto', fontSize: 13.5, color: C.muted2, transition: 'color .25s' }}>
                    {p.read} &middot; read &rarr;
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer style={{ borderTop: `1px solid ${C.bandBorder}` }}>
          <div style={{ ...shell, padding: '34px 28px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div onClick={onHomeClick} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
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
