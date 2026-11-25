/**
 * Shared tokens and motion helpers for the landing page ("Garden Community", see DESIGN.md).
 */
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode, RefObject } from 'react';

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
  leafBright: '#6bb47c',
  grass: '#a3d491',
  leafPale: '#edf6ea',
  band: '#eff5eb',
  /** Greens as tints: use these for fills so green reads as light through glass, never as a solid block. */
  leafGlass: 'rgba(46,125,79,.10)',
  leafGlass2: 'rgba(46,125,79,.18)',
  leafLine: 'rgba(46,125,79,.32)',
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

/** Layout only: the look comes from the global .pp-glass-btn classes (fonts.css). */
export const btnPrimary: CSSProperties = { fontSize: 16, padding: '15px 28px', minHeight: 50 };
export const btnSecondary: CSSProperties = { fontSize: 16, padding: '15px 26px', minHeight: 50 };
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

/**
 * True while the element is on screen and the tab is visible; false again when it
 * leaves. The self-playing demos use it so they only run while someone can see them.
 */
export function useOnScreen<E extends Element>(ref: RefObject<E | null>, threshold = 0.4) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setOn(true); return; }
    let inView = false;
    const sync = () => setOn(inView && document.visibilityState !== 'hidden');
    const io = new IntersectionObserver((es) => { inView = es[es.length - 1].isIntersecting; sync(); }, { threshold });
    io.observe(el);
    document.addEventListener('visibilitychange', sync);
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', sync); };
  }, [ref, threshold]);
  return on;
}

/** Fades and rises its children into place once, when scrolled into view. */
export function Reveal({ children, delay = 0, style, as = 'div', className, from }: {
  children: ReactNode; delay?: number; style?: CSSProperties; as?: 'div' | 'section' | 'article' | 'li'; className?: string;
  /** Where it arrives from. Default rises from below. */
  from?: 'left' | 'right' | 'zoom';
}) {
  const [ref, seen] = useInView<HTMLDivElement>();
  const Tag = as as 'div';
  return (
    <Tag
      ref={ref}
      className={`pp-reveal${from ? ` pp-reveal--${from}` : ''}${seen ? ' is-in' : ''}${className ? ` ${className}` : ''}`}
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
.pp-land { font-family: ${body}; color: ${T.ink}; background: ${T.canvas}; overflow-x: clip; --pp-r: clamp(26px, 4vw, 48px); }
.pp-land h1, .pp-land h2, .pp-land h3 { font-family: ${head}; }
.pp-reveal { opacity: 0; transform: translateY(26px); filter: blur(6px); transition: opacity .8s cubic-bezier(.2,.7,.2,1), transform .9s cubic-bezier(.2,.7,.2,1), filter .8s ease; }
.pp-reveal--left { transform: translateX(-44px); }
.pp-reveal--right { transform: translateX(44px); }
.pp-reveal--zoom { transform: scale(.93); }
.pp-reveal.is-in { opacity: 1; transform: none; filter: none; }
/* Chapters arrive as sheets that slide over the one before. */
.pp-sheet { position: relative; border-radius: var(--pp-r) var(--pp-r) 0 0; margin-top: calc(-1 * var(--pp-r)); box-shadow: 0 -24px 60px rgba(20,48,31,.07), inset 0 1px 0 rgba(255,255,255,.95); }
/* What you have finished reading fades away under the header (where the browser supports scroll timelines). */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .pp-reveal.is-in { animation: pp-leave linear both; animation-timeline: view(); animation-range: exit calc(100% - 240px) exit 100%; }
  }
}
@keyframes pp-leave { to { opacity: .1; transform: translateY(-16px) scale(.985); } }
.pp-stop { display: inline-block; margin-right: 10px; padding: 4px 10px; border-radius: 999px; letter-spacing: .1em; background: ${T.leafGlass}; color: ${T.leaf}; transition: background .5s ease, color .5s ease, transform .6s cubic-bezier(.34,1.56,.64,1); }
[data-stop="in"] .pp-stop { background: ${T.marigoldPale}; color: ${T.marigoldDark}; animation: pp-stamp .7s cubic-bezier(.34,1.56,.64,1); }
@keyframes pp-stamp { 0% { transform: scale(.7) rotate(-6deg); } 60% { transform: scale(1.12) rotate(2deg); } 100% { transform: none; } }
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
/* Photographs breathe: a very slow push-in, so a still reads as a living scene. */
.pp-kenburns { animation: pp-kenburns 22s ease-in-out infinite alternate; transform-origin: 62% 62%; will-change: transform; }
@keyframes pp-kenburns { from { transform: scale(1); } to { transform: scale(1.09); } }
@keyframes pp-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
.pp-focus:focus-visible, .pp-land button:focus-visible, .pp-land a:focus-visible { outline: 3px solid ${T.leaf}; outline-offset: 3px; }
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
  .pp-reveal { filter: none; }
  .pp-reveal--left, .pp-reveal--right { transform: translateY(26px); }
  .pp-hero-grid, .pp-split { grid-template-columns: 1fr !important; }
  .pp-hide-sm { display: none !important; }
  .pp-hero-ctas > * { flex: 1 1 100%; justify-content: center; }
}
@media (prefers-reduced-motion: reduce) {
  .pp-reveal, .pp-enter { opacity: 1 !important; transform: none !important; filter: none !important; animation: none !important; transition: none !important; }
  .pp-stop { animation: none !important; }
  .pp-marquee, .pp-pulse, .pp-float, .pp-kenburns { animation: none !important; }
  .pp-rot-word { transition: none; }
}
`;
