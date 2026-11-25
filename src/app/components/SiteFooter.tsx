/**
 * SiteFooter, shared by every page.
 *
 * A pale sage band that rises out of the page through a soft silhouette of
 * community towers and trees, then one north-star line with one CTA, three
 * link columns and a small-print bar. It is light on purpose: green is used as
 * a tint across the site, never as a solid dark block (see DESIGN.md). No social icons and no email address on
 * purpose: neither exists yet. Links to page sections work from any page (App
 * routes home first, then scrolls).
 */
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import BrandLogo from './BrandLogo';

const C = {
  /** top of the sage band; the skyline's ground melts into it */
  sage: '#e2efdd',
  sage2: '#eaf3e6',
  ink: '#14301f',
  sub: '#3f5547',
  leaf: '#2e7d4f',
  marigoldDark: '#c24e1d',
  dim: '#5e7266',
  hair: 'rgba(20,48,31,.10)',
};
const heading = "'Plus Jakarta Sans', system-ui, sans-serif";

export interface FooterNav {
  /** Scroll to a landing-page section (routes home first if needed). */
  toSection: (id: 'how' | 'services' | 'pricing' | 'blog') => void;
  toHome: () => void;
  toTour: () => void;
  toBlog: () => void;
  toAbout: () => void;
  onJoin: (source: string, intent?: 'owner' | 'walker') => void;
}

/** Towers and trees along the top edge, in leaf tones, melting into forest. */
function Skyline() {
  // Simple, deterministic shapes; viewBox is wide and squashes gracefully.
  const towers = [
    [60, 70, 46], [120, 40, 38], [300, 58, 52], [360, 30, 34], [560, 64, 44], [620, 36, 40],
    [880, 52, 50], [940, 24, 36], [1150, 60, 46], [1210, 34, 40], [1380, 66, 42],
  ];
  const trees = [
    [20, 22], [200, 28], [250, 18], [470, 26], [520, 20], [720, 30], [780, 22], [1040, 26],
    [1090, 18], [1300, 28], [1340, 20], [1430, 24],
  ];
  return (
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true" focusable="false"
      style={{ display: 'block', width: '100%', height: 'clamp(56px, 7vw, 104px)' }}>
      {/* far towers */}
      {towers.map(([x, top, w], i) => (
        <g key={`t${i}`}>
          <rect x={x} y={top} width={w} height={120 - top} rx="3" fill="#d6e8d2" opacity=".7" />
          {Array.from({ length: Math.floor((96 - top) / 14) }).map((_, r) => (
            <rect key={r} x={x + 8} y={top + 10 + r * 14} width={w - 16} height="3" rx="1.5" fill="#f1f8ee" opacity=".9" />
          ))}
        </g>
      ))}
      {/* mid hedge */}
      <path d="M0 96 C 120 82, 220 92, 340 86 S 560 78, 700 88 S 960 80, 1080 88 S 1320 80, 1440 90 V120 H0Z" fill="#a9d3ae" opacity=".55" />
      {/* trees */}
      {trees.map(([x, r], i) => (
        <g key={`r${i}`}>
          <rect x={x - 2} y={104 - r * 0.4} width="4" height={r * 0.6} fill="#7fae8b" />
          <circle cx={x} cy={100 - r} r={r * 0.75} fill={i % 3 === 0 ? '#f0cf6a' : i % 2 ? '#9fcca6' : '#86bb92'} />
        </g>
      ))}
      {/* ground into the sage band */}
      <path d="M0 104 C 200 96, 380 108, 620 100 S 1040 96, 1240 104 S 1400 102, 1440 100 V120 H0Z" fill={C.sage} />
    </svg>
  );
}

export default function SiteFooter({ nav }: { nav: FooterNav }) {
  // Show the dashboard shortcut only in a browser that has signed in at
  // /admin before. Purely a convenience: the dashboard's data is gated
  // server-side by email regardless.
  const [hasSession, setHasSession] = useState(false);
  useEffect(() => {
    try {
      setHasSession(Object.keys(localStorage).some((k) => k.startsWith('sb-') && k.endsWith('-auth-token')));
    } catch { /* storage unavailable */ }
  }, []);

  const link: CSSProperties = {
    fontSize: 14.5, color: C.sub, cursor: 'pointer',
    background: 'none', border: 'none', padding: 0, textAlign: 'left', fontFamily: 'inherit',
  };
  const colTitle: CSSProperties = {
    fontFamily: heading, fontWeight: 700, fontSize: 12.5, letterSpacing: '0.14em',
    color: C.leaf, marginBottom: 6,
  };

  return (
    <footer className="ppf" style={{ color: C.ink, textTransform: 'none', position: 'relative', zIndex: 1, marginTop: 'clamp(8px, 2vw, 24px)' }}>
      <style>{`
        .ppf-link { transition: color .2s, transform .2s; }
        .ppf-link:hover { color: ${C.ink} !important; transform: translateX(2px); }
        .ppf button:focus-visible, .ppf a:focus-visible { outline: 2px solid ${C.leaf}; outline-offset: 3px; border-radius: 4px; }
        .ppf-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 36px; }
        .ppf-top { display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
        @media (max-width: 760px) {
          .ppf-grid { grid-template-columns: 1fr 1fr; gap: 28px 20px; }
          .ppf-brandcol { grid-column: 1 / -1; }
          .ppf-top { flex-direction: column; align-items: stretch; }
          .ppf-cta { width: 100%; }
          .ppf-bottom { flex-direction: column; gap: 8px; align-items: flex-start !important; }
        }
        @media (prefers-reduced-motion: reduce) { .ppf-link, .ppf-cta { transition: none; } }
      `}</style>

      <Skyline />

      <div style={{ background: `linear-gradient(180deg, ${C.sage} 0%, ${C.sage2} 100%)` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(22px, 3vw, 36px) clamp(18px, 3vw, 28px) 0' }}>
          {/* north star + the one CTA */}
          <div className="ppf-top">
            <div>
              <div style={{ fontFamily: heading, fontWeight: 700, fontSize: 12.5, letterSpacing: '0.14em', color: C.leaf, marginBottom: 10 }}>OUR NORTH STAR</div>
              <div style={{ fontFamily: heading, fontWeight: 700, fontSize: 'clamp(20px, 2.4vw, 28px)', lineHeight: 1.3, letterSpacing: '-0.02em', maxWidth: 600 }}>
                Every pet cared for in their own home, by a neighbour they already know.
              </div>
            </div>
            <button
              className="ppf-cta pp-glass-btn pp-glass-primary"
              onClick={() => nav.onJoin('footer-join')}
              style={{ fontSize: 15, padding: '15px 28px', flexShrink: 0 }}
            >
              Join the waitlist
            </button>
          </div>

          <div style={{ height: 1, background: C.hair, margin: 'clamp(26px, 3.4vw, 40px) 0' }} />

          <div className="ppf-grid">
            <div className="ppf-brandcol">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
                <BrandLogo tile={30} />
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: C.sub, margin: 0, maxWidth: 300 }}>
                Hyderabad, gated communities first: Gachibowli, Financial District, Kokapet, Kondapur and Nallagandla. Your community next?
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <div style={colTitle}>EXPLORE</div>
              <button className="ppf-link" style={link} onClick={() => nav.toSection('how')}>How it works</button>
              <button className="ppf-link" style={link} onClick={() => nav.toSection('pricing')}>Pricing</button>
              <button className="ppf-link" style={link} onClick={nav.toTour}>Inside the app</button>
              <button className="ppf-link" style={link} onClick={nav.toBlog}>The Paw Journal</button>
              <button className="ppf-link" style={link} onClick={nav.toAbout}>About us</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <div style={colTitle}>SERVICES</div>
              <button className="ppf-link" style={link} onClick={() => nav.toSection('services')}>Dog walks, from ₹149</button>
              <button className="ppf-link" style={link} onClick={() => nav.toSection('services')}>Cat home visits, ₹129</button>
              <button className="ppf-link" style={link} onClick={() => nav.toSection('pricing')}>Boarding, from ₹449</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <div style={colTitle}>GET INVOLVED</div>
              <button className="ppf-link" style={link} onClick={() => nav.onJoin('footer-owner')}>Join as a pet parent</button>
              <button className="ppf-link" style={link} onClick={() => nav.onJoin('footer-volunteer-link', 'walker')}>Register as a volunteer</button>
              <span style={{ fontSize: 12.5, color: C.dim, lineHeight: 1.5 }}>Volunteers keep 70% of every booking.</span>
            </div>
          </div>

          <div className="ppf-bottom" style={{ borderTop: `1px solid ${C.hair}`, marginTop: 'clamp(28px, 3.6vw, 44px)', padding: '18px 0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <span style={{ fontSize: 12.5, color: C.dim }}>© 2026 ProxyPaw · Made with love in Gachibowli</span>
            <span style={{ fontSize: 14, color: C.dim, display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
              <a className="ppf-link" href="/terms" style={{ color: C.sub, textDecoration: 'none', fontWeight: 600 }}>Terms and conditions</a>
              <a className="ppf-link" href="/privacy" style={{ color: C.sub, textDecoration: 'none', fontWeight: 600 }}>Privacy note</a>
              {hasSession && (
                <a href="/admin" style={{ color: C.marigoldDark, textDecoration: 'none', fontWeight: 700 }}>Founder dashboard</a>
              )}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
