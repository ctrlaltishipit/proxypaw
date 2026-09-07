/**
 * SiteFooter, shared by every page.
 *
 * Crisp by design: one north-star line with the two CTAs, three tight link
 * columns with bold headings, one small-print bar. No social icons and no
 * email address on purpose: neither exists yet. Links to page sections work
 * from any page (App routes home first, then scrolls).
 */
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

const C = {
  ink: '#2a2118',
  orange: '#e0662f',
  cream2: '#fdf9f0',
  gold: '#f0b429',
  muted2: '#a08e73',
  darkSub: '#c9b799',
  dim: '#8b7a63',
};
const heading = "'Fredoka', system-ui, sans-serif";

export interface FooterNav {
  /** Scroll to a landing-page section (routes home first if needed). */
  toSection: (id: 'how' | 'services' | 'pricing' | 'blog') => void;
  toTour: () => void;
  toBlog: () => void;
  toAbout: () => void;
  onJoin: (source: string, intent?: 'owner' | 'walker') => void;
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
    fontSize: 13.5, color: C.muted2, cursor: 'pointer', transition: 'color .2s',
    background: 'none', border: 'none', padding: 0, textAlign: 'left', fontFamily: 'inherit',
  };
  const colTitle: CSSProperties = {
    fontFamily: heading, fontWeight: 600, fontSize: 13, letterSpacing: '0.09em',
    color: C.cream2, marginBottom: 4,
  };

  return (
    <footer style={{ background: C.ink, color: C.cream2, textTransform: 'none', position: 'relative', zIndex: 1 }}>
      <style>{`
        .ppf-link:hover { color: ${C.cream2} !important; }
        .ppf-cta:hover { transform: translateY(-2px); }
        .ppf-grid { display: grid; grid-template-columns: 1.3fr 1fr 1fr 1fr; gap: 32px; }
        .ppf-top { display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
        @media (max-width: 760px) {
          .ppf-grid { grid-template-columns: 1fr 1fr; gap: 24px; }
          .ppf-brandcol { grid-column: 1 / -1; }
          .ppf-top { flex-direction: column; align-items: stretch; }
          .ppf-ctas { flex-direction: column; }
          .ppf-ctas button { width: 100%; }
          .ppf-bottom { flex-direction: column; gap: 6px; align-items: flex-start !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(34px, 4.5vw, 52px) clamp(18px, 3vw, 28px) 0' }}>
        {/* north star + CTAs, one line */}
        <div className="ppf-top">
          <div>
            <div style={{ fontFamily: heading, fontWeight: 600, fontSize: 12, letterSpacing: '0.14em', color: C.gold, marginBottom: 8 }}>OUR NORTH STAR</div>
            <div style={{ fontFamily: heading, fontWeight: 600, fontSize: 'clamp(18px, 2.2vw, 24px)', lineHeight: 1.35, maxWidth: 560 }}>
              Every pet cared for in their own home, by a neighbour they already know.
            </div>
          </div>
          <div className="ppf-ctas" style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <button
              className="ppf-cta"
              onClick={() => nav.onJoin('footer-join')}
              style={{ border: 'none', background: C.orange, color: '#fff', fontFamily: heading, fontWeight: 600, fontSize: 14.5, padding: '13px 26px', borderRadius: 999, cursor: 'pointer', transition: '.25s', boxShadow: '0 10px 24px rgba(224,102,47,.28)' }}
            >
              Join the waitlist
            </button>
            <button
              className="ppf-cta"
              onClick={() => nav.onJoin('footer-volunteer', 'walker')}
              style={{ border: '1.5px solid rgba(253,249,240,.28)', background: 'transparent', color: C.cream2, fontFamily: heading, fontWeight: 600, fontSize: 14.5, padding: '13px 26px', borderRadius: 999, cursor: 'pointer', transition: '.25s' }}
            >
              Register as a volunteer
            </button>
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(253,249,240,.12)', margin: 'clamp(24px, 3vw, 34px) 0' }} />

        {/* compact columns */}
        <div className="ppf-grid">
          <div className="ppf-brandcol">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ width: 30, height: 30, borderRadius: 10, background: C.orange, display: 'grid', placeItems: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff"><ellipse cx="8.2" cy="7.4" rx="2.1" ry="2.9" /><ellipse cx="15.8" cy="7.4" rx="2.1" ry="2.9" /><ellipse cx="4.4" cy="12.2" rx="1.9" ry="2.5" /><ellipse cx="19.6" cy="12.2" rx="1.9" ry="2.5" /><path d="M12 11c3 0 5.6 2.4 5.9 5.3.2 2-1.3 3.7-3.3 3.7-1 0-1.8-.5-2.6-.5s-1.6.5-2.6.5c-2 0-3.5-1.7-3.3-3.7C6.4 13.4 9 11 12 11z" /></svg>
              </span>
              <span style={{ fontFamily: heading, fontWeight: 600, fontSize: 17 }}>ProxyPaw</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: C.muted2, margin: 0, maxWidth: 290 }}>
              Hyderabad, gated communities first: Gachibowli, Financial District, Kokapet, Kondapur and Nallagandla. Your community next?
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            <div style={colTitle}>EXPLORE</div>
            <button className="ppf-link" style={link} onClick={() => nav.toSection('how')}>how it works</button>
            <button className="ppf-link" style={link} onClick={() => nav.toSection('pricing')}>pricing</button>
            <button className="ppf-link" style={link} onClick={nav.toTour}>inside the app</button>
            <button className="ppf-link" style={link} onClick={nav.toBlog}>the paw journal</button>
            <button className="ppf-link" style={link} onClick={nav.toAbout}>about us</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            <div style={colTitle}>SERVICES</div>
            <button className="ppf-link" style={link} onClick={() => nav.toSection('services')}>dog walks, from ₹149</button>
            <button className="ppf-link" style={link} onClick={() => nav.toSection('services')}>cat home visits, ₹129</button>
            <button className="ppf-link" style={link} onClick={() => nav.toSection('pricing')}>boarding, from ₹449</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            <div style={colTitle}>GET INVOLVED</div>
            <button className="ppf-link" style={link} onClick={() => nav.onJoin('footer-owner')}>join as a pet parent</button>
            <button className="ppf-link" style={link} onClick={() => nav.onJoin('footer-volunteer-link', 'walker')}>register as a volunteer</button>
            <span style={{ fontSize: 12, color: C.dim, lineHeight: 1.5 }}>Volunteers keep 70% of every booking.</span>
          </div>
        </div>

        {/* small print */}
        <div className="ppf-bottom" style={{ borderTop: '1px solid rgba(253,249,240,.12)', marginTop: 'clamp(24px, 3vw, 34px)', padding: '16px 0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ fontSize: 12, color: C.dim }}>
            © 2026 ProxyPaw · made with love in gachibowli ·{' '}
            <a href="/terms" style={{ color: C.dim, textDecoration: 'underline' }}>terms</a> ·{' '}
            <a href="/privacy" style={{ color: C.dim, textDecoration: 'underline' }}>privacy</a>
          </span>
          <span style={{ fontSize: 12, color: C.dim, display: 'flex', gap: 12, alignItems: 'center' }}>
            walks · boarding · community
            {hasSession && (
              <a href="/admin" style={{ color: C.gold, textDecoration: 'none', fontWeight: 700 }}>founder dashboard</a>
            )}
          </span>
        </div>
      </div>
    </footer>
  );
}
