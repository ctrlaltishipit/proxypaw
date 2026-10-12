/**
 * SiteHeader, shared by every page (rendered once in App.tsx).
 *
 * Logo left, nav centre-aligned, waitlist CTA right. Sticky, so the header
 * stays alive on every page including Inside the app. On mobile the middle
 * nav collapses to icons with tiny labels and the logo to its tile.
 */
import type { FooterNav } from './SiteFooter';
import BrandLogo, { BrandIcon } from './BrandLogo';

const C = {
  cream: '#f6f1e7', ink: '#2a2118', orange: '#e0662f', cream2: '#fdf9f0',
  border: '#eee3cf', muted: '#8b7a63',
};
const sora = "'Fredoka', system-ui, sans-serif";

const ICONS: Record<string, string> = {
  about: 'M12 21C7 16.5 3.5 13.2 3.5 9.6 3.5 7 5.6 5 8.1 5c1.5 0 3 .7 3.9 2 .9-1.3 2.4-2 3.9-2 2.5 0 4.6 2 4.6 4.6 0 3.6-3.5 6.9-8.5 11.4z',
  how: 'M4 17h9a4 4 0 0 0 0-8H8a4 4 0 0 1 0-8h8M4 17l3-3M4 17l3 3',
  services: 'M4 12h16M6 12a6 6 0 0 0 12 0M9 12V8m6 4V9',
  pricing: 'M20.6 13.4 12 22 2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8zM7 7h.01',
  tour: 'M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM10.5 18.5h3',
  blogs: 'M4 19.5V5a2 2 0 0 1 2-2h14v15H6.5A2.5 2.5 0 0 0 4 20.5V19.5zM6.5 18H20v3',
};

function NavIcon({ d, active = false }: { d: string; active?: boolean }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={active ? C.orange : C.muted} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export default function SiteHeader({ nav }: { nav: FooterNav }) {
  const items: Array<{ label: string; icon: string; go: () => void }> = [
    { label: 'About', icon: ICONS.about, go: nav.toAbout },
    { label: 'How it works', icon: ICONS.how, go: () => nav.toSection('how') },
    { label: 'Services', icon: ICONS.services, go: () => nav.toSection('services') },
    { label: 'Pricing', icon: ICONS.pricing, go: () => nav.toSection('pricing') },
    { label: 'Inside the app', icon: ICONS.tour, go: nav.toTour },
    { label: 'Blogs', icon: ICONS.blogs, go: nav.toBlog },
  ];

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 60, background: 'rgba(246,241,231,.93)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderBottom: `1px solid ${C.border}`, textTransform: 'none' }}>
      <style>{`
        .pph-grid { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 10px; max-width: 1200px; margin: 0 auto; padding: 10px clamp(14px, 3vw, 28px); }
        .pph-item { display: inline-flex; flex-direction: row; align-items: center; gap: 7px; background: none; border: none; cursor: pointer; padding: 8px 10px; border-radius: 12px; font-family: inherit; transition: background .2s; }
        .pph-item:hover { background: rgba(224,102,47,.08); }
        .pph-item:hover span { color: ${C.orange}; }
        .pph-item svg { flex-shrink: 0; }
        .pph-cta:hover { transform: translateY(-1px); }
        .pph-cta-short { display: none; }
        .pph-brandicon { display: none; }
        @media (max-width: 900px) {
          .pph-item { flex-direction: column; gap: 2px; padding: 5px 4px; }
          .pph-item svg { width: 16px; height: 16px; }
          .pph-item span { font-size: 8.5px !important; }
          .pph-brandname { display: none; }
          .pph-brandicon { display: block; }
          .pph-cta { font-size: 12.5px !important; padding: 9px 13px !important; }
          .pph-cta-full { display: none; }
          .pph-cta-short { display: inline; }
          .pph-grid { grid-template-columns: auto 1fr auto; padding: 8px 8px; gap: 4px; }
          nav[aria-label="Main"] { gap: 0 !important; }
        }
      `}</style>
      <div className="pph-grid">
        <div onClick={nav.toHome} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', justifySelf: 'start' }} role="link" aria-label="ProxyPaw home">
          <BrandLogo tile={36} className="pph-brandname" />
          <BrandIcon size={36} className="pph-brandicon" />
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }} aria-label="Main">
          {items.map((it) => (
            <button key={it.label} className="pph-item" onClick={it.go} aria-label={it.label}>
              <NavIcon d={it.icon} />
              <span style={{ fontFamily: sora, fontWeight: 500, fontSize: 14, color: C.ink, whiteSpace: 'nowrap' }}>{it.label}</span>
            </button>
          ))}
        </nav>

        <button
          className="pph-cta"
          onClick={() => nav.onJoin('header-join')}
          style={{ justifySelf: 'end', border: 'none', background: C.ink, color: C.cream2, fontFamily: sora, fontWeight: 600, fontSize: 14, padding: '11px 20px', borderRadius: 999, cursor: 'pointer', transition: '.25s', whiteSpace: 'nowrap' }}
        >
          <span className="pph-cta-full">Join the waitlist</span><span className="pph-cta-short">Join</span>
        </button>
      </div>
    </div>
  );
}
