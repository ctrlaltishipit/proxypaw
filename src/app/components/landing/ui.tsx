/**
 * Shared tokens and motion helpers for the landing page ("Garden Community", see DESIGN.md).
 */
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

export const T = {
  canvas: '#f4f8ef',
  canvas2: '#fbfdf8',
  surface: '#ffffff',
  ink: '#14301f',
  sub: '#3f5547',
  muted: '#5e7266',
  muted2: '#7c8f83',
  line: '#e1ecdc',
  line2: '#c9dcc4',
  leaf: '#2e7d4f',
  leafDeep: '#1f6b3a',
  leafBright: '#49a85a',
  grass: '#7cc35a',
  leafPale: '#e7f4e4',
  band: '#eaf3e4',
  sky: '#dcEff6',
  marigold: '#e0662f',
  marigoldDark: '#c24e1d',
  marigoldPale: '#fdebdd',
  sun: '#f0b429',
  sunPale: '#fff4d6',
  soil: '#7a5230',
};

export const head = "'Plus Jakarta Sans', system-ui, sans-serif";
export const body = "'Inter', system-ui, sans-serif";

export const shell: CSSProperties = { maxWidth: 1200, margin: '0 auto', padding: '0 clamp(18px, 3vw, 28px)' };
export const SECTION = 'clamp(72px, 9vw, 120px)';
export const GAP = 'clamp(14px, 1.8vw, 20px)';

export const eyebrow: CSSProperties = {
  fontFamily: body, fontSize: 12.5, fontWeight: 700, letterSpacing: '0.14em',
  textTransform: 'uppercase', color: T.leaf, marginBottom: 14,
};
export const h2: CSSProperties = {
  fontFamily: head, fontWeight: 800, fontSize: 'clamp(30px, 3.8vw, 50px)', lineHeight: 1.06,
  letterSpacing: '-0.03em', color: T.ink, margin: 0,
};
export const lead: CSSProperties = {
  fontFamily: body, fontSize: 'clamp(16px, 1.4vw, 18px)', lineHeight: 1.65, color: T.sub, margin: 0,
};

export const btnPrimary: CSSProperties = {
  border: 'none', background: T.marigold, color: '#fff', fontFamily: head, fontWeight: 700,
  fontSize: 16, padding: '15px 26px', borderRadius: 999, cursor: 'pointer',
  boxShadow: '0 12px 28px rgba(224,102,47,.28)', display: 'inline-flex', alignItems: 'center', gap: 10,
  minHeight: 48,
};
export const btnSecondary: CSSProperties = {
  border: `1.5px solid ${T.line2}`, background: T.surface, color: T.ink, fontFamily: head, fontWeight: 700,
  fontSize: 16, padding: '14px 24px', borderRadius: 999, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 10, minHeight: 48,
};
export const card: CSSProperties = {
  background: T.surface, border: `1px solid ${T.line}`, borderRadius: 24,
};

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return reduced;
}

/** True once the element has scrolled into view (stays true). */
export function useInView<E extends Element>(threshold = 0.18) {
  const ref = useRef<E>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (!('IntersectionObserver' in window)) { setSeen(true); return; }
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { setSeen(true); io.disconnect(); }
    }, { threshold, rootMargin: '0px 0px -40px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [seen, threshold]);
  return [ref, seen] as const;
}

/** Fades and rises its children into place once, when scrolled into view. */
export function Reveal({ children, delay = 0, style, as = 'div', className }: {
  children: ReactNode; delay?: number; style?: CSSProperties; as?: 'div' | 'section' | 'article' | 'li'; className?: string;
}) {
  const [ref, seen] = useInView<HTMLDivElement>();
  const Tag = as as 'div';
  return (
    <Tag
      ref={ref}
      className={`pp-reveal${seen ? ' is-in' : ''}${className ? ` ${className}` : ''}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </Tag>
  );
}

/** Google-style word swap: one word in a sentence changes in place. */
export function RotatingWords({ words, interval = 2400, color }: { words: string[]; interval?: number; color: string }) {
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState(-1);
  const reduced = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (reduced || paused) return;
    const t = window.setInterval(() => setI((n) => { setPrev(n); return (n + 1) % words.length; }), interval);
    return () => window.clearInterval(t);
  }, [reduced, paused, interval, words.length]);
  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), '');
  return (
    <span
      className="pp-rot"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ position: 'relative', display: 'inline-block', verticalAlign: 'bottom', color }}
    >
      {/* Invisible sizer keeps the line from jumping as words change. */}
      <span style={{ visibility: 'hidden', whiteSpace: 'nowrap' }} aria-hidden="true">{longest}</span>
      {words.map((w, n) => (
        <span
          key={w}
          aria-hidden={n !== i}
          className={`pp-rot-word${n === i ? ' is-on' : n === prev ? ' is-out' : ''}`}
          style={{ position: 'absolute', left: 0, top: 0, whiteSpace: 'nowrap' }}
        >
          {w}
        </span>
      ))}
    </span>
  );
}

/** Animates a number up from 0 once visible. */
export function CountUp({ to, prefix = '', suffix = '', duration = 1200 }: { to: number; prefix?: string; suffix?: string; duration?: number }) {
  const [ref, seen] = useInView<HTMLSpanElement>(0.4);
  const [v, setV] = useState(0);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (!seen) return;
    if (reduced) { setV(to); return; }
    let raf = 0; const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, to, duration, reduced]);
  return <span ref={ref}>{prefix}{v.toLocaleString('en-IN')}{suffix}</span>;
}

export const GLOBAL_CSS = `
.pp-land { font-family: ${body}; color: ${T.ink}; background: ${T.canvas}; overflow-x: clip; }
.pp-land h1, .pp-land h2, .pp-land h3 { font-family: ${head}; }
.pp-reveal { opacity: 0; transform: translateY(22px); transition: opacity .8s cubic-bezier(.2,.7,.2,1), transform .8s cubic-bezier(.2,.7,.2,1); }
.pp-reveal.is-in { opacity: 1; transform: none; }
.pp-enter { opacity: 0; transform: translateY(16px); animation: pp-enter .9s cubic-bezier(.2,.7,.2,1) forwards; }
@keyframes pp-enter { to { opacity: 1; transform: none; } }
.pp-rot-word { opacity: 0; transform: translateY(60%); filter: blur(4px); transition: opacity .5s ease, transform .5s cubic-bezier(.2,.7,.2,1), filter .5s ease; }
.pp-rot-word.is-on { opacity: 1; transform: none; filter: none; }
.pp-rot-word.is-out { opacity: 0; transform: translateY(-60%); transition-duration: .35s; }
.pp-btn { transition: transform .2s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease; }
.pp-btn:hover { transform: translateY(-2px); }
.pp-btn:active { transform: translateY(0) scale(.98); }
.pp-btn-primary:hover { background: ${T.marigoldDark}; box-shadow: 0 16px 34px rgba(224,102,47,.34); }
.pp-btn-secondary:hover { border-color: ${T.leaf}; }
.pp-lift { transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease; }
.pp-lift:hover { transform: translateY(-3px); box-shadow: 0 22px 48px rgba(28,60,40,.12); border-color: ${T.line2}; }
.pp-zoom { overflow: hidden; }
.pp-zoom img { transition: transform 1.2s cubic-bezier(.2,.7,.2,1); }
.pp-zoom:hover img { transform: scale(1.04); }
.pp-marquee { display: flex; gap: 14px; width: max-content; animation: pp-marquee 48s linear infinite; }
.pp-marquee-wrap:hover .pp-marquee { animation-play-state: paused; }
@keyframes pp-marquee { to { transform: translateX(-50%); } }
.pp-pulse { animation: pp-pulse 1.8s ease-in-out infinite; }
@keyframes pp-pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .45; transform: scale(.82); } }
.pp-float { animation: pp-float 6s ease-in-out infinite; }
@keyframes pp-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
.pp-focus:focus-visible, .pp-land button:focus-visible, .pp-land a:focus-visible { outline: 3px solid ${T.leafBright}; outline-offset: 3px; }
.pp-tab { transition: background .25s ease, color .25s ease, box-shadow .25s ease; }
.pp-faq summary { list-style: none; cursor: pointer; }
.pp-faq summary::-webkit-details-marker { display: none; }
.pp-faq[open] .pp-faq-plus { transform: rotate(45deg); }
.pp-faq-plus { transition: transform .3s ease; }
.pp-modal-in { animation: pp-modal .45s cubic-bezier(.2,.7,.2,1); }
@keyframes pp-modal { from { opacity: 0; transform: translateY(18px) scale(.97); } to { opacity: 1; transform: none; } }
.pp-fade-in { animation: pp-fade .4s ease; }
@keyframes pp-fade { from { opacity: 0; } to { opacity: 1; } }
@media (max-width: 560px) { .pp-hud { left: 8px !important; bottom: 8px !important; gap: 5px !important; transform: scale(.78); transform-origin: 0 100%; } }
@media (max-width: 860px) {
  .pp-hero-grid, .pp-split { grid-template-columns: 1fr !important; }
  .pp-hide-sm { display: none !important; }
  .pp-hero-ctas > * { flex: 1 1 100%; justify-content: center; }
}
@media (prefers-reduced-motion: reduce) {
  .pp-reveal, .pp-enter { opacity: 1 !important; transform: none !important; animation: none !important; transition: none !important; }
  .pp-marquee, .pp-pulse, .pp-float, .pp-scene * { animation: none !important; }
  .pp-rot-word { transition: none; }
}
`;
