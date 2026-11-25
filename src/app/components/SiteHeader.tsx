/**
 * SiteHeader, shared by every page (rendered once in App.tsx).
 *
 * Logo left, nav centre, marigold waitlist pill right. Sticky and translucent
 * over the garden canvas. The nav is a glass capsule; the current page gets a leaf-green pill. Below 940px
 * the nav folds into a menu button (aria-expanded) that opens a sheet under
 * the bar, so nothing squeezes or overflows at phone width.
 */
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { FooterNav } from './SiteFooter';
import BrandLogo from './BrandLogo';

const C = {
  ink: '#14301f', sub: '#3f5547', muted: '#5e7266', leaf: '#2e7d4f', leafPale: '#e7f4e4',
  marigold: '#e0662f', marigoldDark: '#c24e1d', line: '#e1ecdc',
};
const heading = "'Plus Jakarta Sans', system-ui, sans-serif";

type Key = 'about' | 'how' | 'services' | 'pricing' | 'tour' | 'blog';

export default function SiteHeader({ nav }: { nav: FooterNav }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const items: Array<{ key: Key; label: string; go: () => void }> = [
    { key: 'about', label: 'About', go: nav.toAbout },
    { key: 'how', label: 'How it works', go: () => nav.toSection('how') },
    { key: 'services', label: 'Services', go: () => nav.toSection('services') },
    { key: 'pricing', label: 'Pricing', go: () => nav.toSection('pricing') },
    { key: 'tour', label: 'Inside the app', go: nav.toTour },
    { key: 'blog', label: 'Blogs', go: nav.toBlog },
  ];

  const active: Key | null =
    pathname.startsWith('/about') ? 'about'
      : pathname.startsWith('/tour') ? 'tour'
        : pathname.startsWith('/blog') ? 'blog'
          : null;

  // Close the sheet on navigation and on Escape.
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (fn: () => void) => () => { setOpen(false); fn(); };

  return (
    <header
      className="pph"
      style={{
        position: 'sticky', top: 0, zIndex: 60, textTransform: 'none',
        background: scrolled || open ? 'rgba(255,255,255,.82)' : 'rgba(244,248,239,.72)',
        backdropFilter: 'saturate(1.4) blur(14px)', WebkitBackdropFilter: 'saturate(1.4) blur(14px)',
        borderBottom: `1px solid ${scrolled || open ? C.line : 'transparent'}`,
        boxShadow: scrolled ? '0 6px 24px rgba(28,60,40,.06)' : 'none',
        transition: 'background .3s, border-color .3s, box-shadow .3s',
      }}
    >
      <style>{`
        .pph-bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; max-width: 1200px; margin: 0 auto; padding: 12px clamp(16px, 3vw, 28px); }
        .pph-home { display: flex; align-items: center; background: none; border: none; padding: 0; cursor: pointer; border-radius: 10px; }
        .pph-nav { display: flex; align-items: center; gap: 2px; padding: 4px; border-radius: 999px; background: linear-gradient(180deg, rgba(255,255,255,.7), rgba(255,255,255,.42)); border: 1px solid rgba(255,255,255,.85); box-shadow: inset 0 1px 0 rgba(255,255,255,.9), 0 1px 0 rgba(46,125,79,.14), 0 8px 22px rgba(20,48,31,.07); -webkit-backdrop-filter: blur(14px) saturate(1.6); backdrop-filter: blur(14px) saturate(1.6); }
        .pph-link { position: relative; background: none; border: none; cursor: pointer; padding: 8px 14px; border-radius: 999px; font-family: ${heading}; font-weight: 600; font-size: 14.5px; color: ${C.sub}; white-space: nowrap; transition: color .2s, background .25s, box-shadow .25s, transform .35s cubic-bezier(.34,1.56,.64,1); }
        .pph-link:hover { color: ${C.ink}; background: rgba(255,255,255,.9); box-shadow: 0 4px 12px rgba(20,48,31,.08); transform: translateY(-1px); }
        .pph-link:active { transform: scale(.96); }
        .pph-link[aria-current="page"] { color: #fff; background: ${C.leaf}; box-shadow: inset 0 1px 0 rgba(255,255,255,.3), 0 6px 14px rgba(46,125,79,.28); }
        .pph-cta { font-size: 14.5px !important; padding: 11px 20px !important; min-height: 44px !important; }
        .pph-right { display: flex; align-items: center; gap: 8px; }
        .pph-toggle { display: none; width: 42px; height: 42px; border-radius: 999px; border: 1.5px solid #c9dcc4; background: #fff; cursor: pointer; flex-direction: column; align-items: center; justify-content: center; padding: 0; color: ${C.ink}; }
        .pph-toggle span { display: block; width: 16px; height: 2px; border-radius: 2px; background: currentColor; transition: transform .25s, opacity .2s; }
        .pph-toggle span + span { margin-top: 4px; }
        .pph-toggle[aria-expanded="true"] span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
        .pph-toggle[aria-expanded="true"] span:nth-child(2) { opacity: 0; }
        .pph-toggle[aria-expanded="true"] span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }
        .pph-sheet { display: none; }
        .pph-icon { display: none; }
        .pph-cta-short { display: none; }
        .pph button:focus-visible { outline: 2px solid ${C.leaf}; outline-offset: 2px; }
        @media (max-width: 940px) {
          .pph-nav { display: none; }
          .pph-toggle { display: flex; }
          .pph-sheet { display: block; overflow: hidden; max-height: 0; transition: max-height .35s cubic-bezier(.16,1,.3,1); }
          .pph-sheet[data-open="true"] { max-height: 460px; }
          .pph-sheet-inner { padding: 6px 16px 18px; display: grid; gap: 2px; }
          .pph-sheet-link { display: flex; align-items: center; justify-content: space-between; width: 100%; text-align: left; background: none; border: none; border-radius: 14px; padding: 13px 14px; font-family: ${heading}; font-weight: 600; font-size: 16px; color: ${C.ink}; cursor: pointer; }
          .pph-sheet-link:hover, .pph-sheet-link[aria-current="page"] { background: ${C.leafPale}; }
          .pph-sheet-link[aria-current="page"] { color: ${C.leaf}; }
        }
        @media (max-width: 520px) {
          .pph-name { display: none; }
          .pph-icon { display: block; }
          .pph-cta { padding: 10px 16px !important; font-size: 14px !important; }
          .pph-cta-full { display: none; }
          .pph-cta-short { display: inline; }
        }
        @media (prefers-reduced-motion: reduce) { .pph *, .pph { transition: none !important; } }
      `}</style>

      <div className="pph-bar">
        <button className="pph-home" onClick={go(nav.toHome)} aria-label="ProxyPaw home">
          <BrandLogo tile={32} />
        </button>

        <nav className="pph-nav" aria-label="Main">
          {items.map((it) => (
            <button key={it.key} className="pph-link" onClick={it.go} aria-current={active === it.key ? 'page' : undefined}>
              {it.label}
            </button>
          ))}
        </nav>

        <div className="pph-right">
          <button className="pph-cta pp-glass-btn pp-glass-primary" onClick={() => { setOpen(false); nav.onJoin('header-join'); }}>
            <span className="pph-cta-full">Join the waitlist</span>
            <span className="pph-cta-short">Join waitlist</span>
          </button>
          <button
            className="pph-toggle"
            aria-expanded={open}
            aria-controls="pph-sheet"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
          </button>
        </div>
      </div>

      <div id="pph-sheet" className="pph-sheet" data-open={open} aria-hidden={!open}>
        <nav className="pph-sheet-inner" aria-label="Main (mobile)">
          {items.map((it) => (
            <button
              key={it.key}
              className="pph-sheet-link"
              onClick={go(it.go)}
              tabIndex={open ? 0 : -1}
              aria-current={active === it.key ? 'page' : undefined}
            >
              {it.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
