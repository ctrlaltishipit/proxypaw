/**
 * The real app screens, operated by a cursor.
 *
 * Both play by themselves, like a video, and both can be taken over:
 *   AppWalkthrough  loops on the landing page (Pause, or pick a step).
 *   AppScrollTour   is "Inside the app": the phone stays put, the text cards
 *                   scroll past, and each new card makes the cursor click the
 *                   button that leads to the next screen. Left alone, the page
 *                   moves itself from card to card; scrolling, touching or a
 *                   key press hands control to the visitor, and Play resumes.
 *
 * Screens are the live components from src/mobile, not screenshots. Tap points
 * are in the screens' own 390 x 844 space. Reduced motion skips the cursor and
 * simply swaps screens.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { MOBILE_SCREENS } from '../../../mobile/screens';
import { T, head, body, usePrefersReducedMotion, useInView, useOnScreen } from './ui';

export interface DemoStep {
  screen: string;
  kicker?: string;
  title: string;
  text: string;
  points?: string[];
  /** The button the cursor clicks to reach the next step. */
  tap: { x: number; y: number; label: string };
  /** Where "back" lives on this screen: the header arrow or the Home tab. */
  back?: 'arrow' | 'nav';
}

const BACK = { arrow: { x: 39, y: 41 }, nav: { x: 55, y: 790 } };

/* ------------------------------ step runner ------------------------------ */

function useStepRunner(steps: DemoStep[], target: number, enabled: boolean) {
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(target);
  const [prev, setPrev] = useState<number | null>(null);
  const [dir, setDir] = useState<1 | -1 | 0>(1);
  const [cur, setCur] = useState({ x: steps[target].tap.x, y: steps[target].tap.y });
  const [pressed, setPressed] = useState(false);
  const [ripple, setRipple] = useState(0);
  const r = useRef({ target, shown: target, busy: false, movedAt: 0, timers: [] as number[], alive: true });
  r.current.target = target;

  const wait = (ms: number) => new Promise<void>((res) => { r.current.timers.push(window.setTimeout(res, ms)); });
  const moveTo = (p: { x: number; y: number }) => { setCur({ x: p.x, y: p.y }); r.current.movedAt = performance.now(); };
  const show = (n: number, d: 1 | -1 | 0) => { setPrev(r.current.shown); setDir(d); setShown(n); r.current.shown = n; };

  const pump = useCallback(async () => {
    const s = r.current;
    if (s.busy || !s.alive) return;
    if (s.target === s.shown) return;
    s.busy = true;
    const from = s.shown, to = s.target;
    if (reduced) { show(to, 0); }
    else if (to === from + 1 || to === from - 1) {
      const fwd = to > from;
      const point = fwd ? steps[from].tap : BACK[steps[from].back ?? 'arrow'];
      const settled = fwd && performance.now() - s.movedAt > 750;
      if (!settled) { moveTo(point); await wait(680); }
      setPressed(true); setRipple((n) => n + 1);
      await wait(240);
      setPressed(false);
      await wait(90);
      show(to, fwd ? 1 : -1);
      await wait(380);
      moveTo(steps[to].tap);
      await wait(260);
    } else {
      show(to, 0); moveTo(steps[to].tap); await wait(420);
    }
    s.busy = false;
    if (s.alive) pump();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, steps]);

  useEffect(() => { if (enabled) pump(); }, [target, enabled, pump]);
  useEffect(() => {
    const s = r.current; s.alive = true;
    return () => { s.alive = false; s.timers.forEach((t) => window.clearTimeout(t)); };
  }, []);

  return { shown, prev, dir, cur, pressed, ripple, clearPrev: () => setPrev(null), reduced };
}

/* --------------------------------- phone --------------------------------- */

const STAGE_CSS = `
.pp-ph-in-1 { animation: pp-ph-in-r .5s cubic-bezier(.2,.7,.2,1) both; }
.pp-ph-out-1 { animation: pp-ph-out-l .5s cubic-bezier(.2,.7,.2,1) both; }
.pp-ph-in--1 { animation: pp-ph-in-l .5s cubic-bezier(.2,.7,.2,1) both; }
.pp-ph-out--1 { animation: pp-ph-out-r .5s cubic-bezier(.2,.7,.2,1) both; }
.pp-ph-in-0 { animation: pp-ph-fade .4s ease both; }
.pp-ph-out-0 { animation: pp-ph-fade .4s ease reverse both; }
@keyframes pp-ph-in-r { from { transform: translateX(46%); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes pp-ph-out-l { from { transform: none; opacity: 1; } to { transform: translateX(-28%); opacity: 0; } }
@keyframes pp-ph-in-l { from { transform: translateX(-46%); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes pp-ph-out-r { from { transform: none; opacity: 1; } to { transform: translateX(28%); opacity: 0; } }
@keyframes pp-ph-fade { from { opacity: 0; } to { opacity: 1; } }
.pp-ph-ripple { animation: pp-ph-rip .6s ease-out forwards; }
@keyframes pp-ph-rip { from { transform: translate(-50%,-50%) scale(.25); opacity: .6; } to { transform: translate(-50%,-50%) scale(2.4); opacity: 0; } }
.pp-ph-hot { animation: pp-ph-hot 1.8s ease-in-out infinite; }
@keyframes pp-ph-hot { 0%,100% { box-shadow: 0 0 0 0 rgba(224,102,47,.45); } 60% { box-shadow: 0 0 0 14px rgba(224,102,47,0); } }
@media (prefers-reduced-motion: reduce) { .pp-ph-hot, [class^="pp-ph-in"], [class^="pp-ph-out"] { animation: none !important; } }
`;

function PhoneStage({ steps, run, width, onHotspot }: {
  steps: DemoStep[]; run: ReturnType<typeof useStepRunner>; width: number; onHotspot?: () => void;
}) {
  const k = width / 390;
  const Screen = MOBILE_SCREENS[steps[run.shown].screen];
  const Prev = run.prev !== null ? MOBILE_SCREENS[steps[run.prev].screen] : null;
  const tap = steps[run.shown].tap;
  const frame: CSSProperties = { width: 390, height: 844, transform: `scale(${k})`, transformOrigin: '0 0', pointerEvents: 'none' };
  return (
    <div style={{ width: width + 18, borderRadius: 44 * Math.max(0.7, k * 1.25), padding: 9, background: 'linear-gradient(160deg, #23412f, #0f2418)', boxShadow: '0 34px 70px rgba(20,48,31,.26), inset 0 1px 0 rgba(255,255,255,.18)' }}>
      <style>{STAGE_CSS}</style>
      <div style={{ position: 'relative', width, height: 844 * k, borderRadius: 34 * Math.max(0.7, k * 1.25), overflow: 'hidden', background: T.canvas }}>
        {Prev && (
          <div key={`p${run.prev}-${run.shown}`} className={`pp-ph-out-${run.dir}`} onAnimationEnd={run.clearPrev} style={{ position: 'absolute', inset: 0 }}>
            <div style={frame}><Prev /></div>
          </div>
        )}
        <div key={`s${run.shown}`} className={run.prev !== null ? `pp-ph-in-${run.dir}` : undefined} style={{ position: 'absolute', inset: 0 }}>
          <div style={frame} aria-hidden="true"><Screen /></div>
        </div>

        {onHotspot && run.prev === null && (
          <button
            className="pp-ph-hot"
            onClick={onHotspot}
            aria-label={`${tap.label}: go to the next screen`}
            style={{ position: 'absolute', left: tap.x * k, top: tap.y * k, width: 44, height: 44, transform: 'translate(-50%,-50%)', borderRadius: '50%', border: 'none', background: 'rgba(224,102,47,.001)', cursor: 'pointer', zIndex: 2 }}
          />
        )}

        {!run.reduced && (
          <div style={{ position: 'absolute', left: run.cur.x * k, top: run.cur.y * k, width: 0, height: 0, transition: 'left .65s cubic-bezier(.45,0,.2,1), top .65s cubic-bezier(.45,0,.2,1)', zIndex: 3, pointerEvents: 'none' }}>
            {run.ripple > 0 && <span key={run.ripple} className="pp-ph-ripple" style={{ position: 'absolute', left: 0, top: 0, width: 44, height: 44, borderRadius: '50%', background: T.marigold }} />}
            <svg width="26" height="30" viewBox="0 0 26 30" aria-hidden="true" style={{ position: 'absolute', left: -3, top: -2, transform: `scale(${pressed(run) ? 0.86 : 1})`, transformOrigin: '3px 2px', transition: 'transform .14s ease', filter: 'drop-shadow(0 3px 5px rgba(20,48,31,.35))' }}>
              <path d="M3 2v22l6-5.4 4.2 9 4-1.9-4.2-8.9 8-.7z" fill="#14301f" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
const pressed = (run: ReturnType<typeof useStepRunner>) => run.pressed;

/* ---------------------------- landing: auto-play ---------------------------- */

const LANDING_STEPS: DemoStep[] = [
  { screen: 'home', title: 'Open ProxyPaw', text: 'Your pets, the next booking and the latest photos are on one screen. Pick a service to start.', tap: { x: 78, y: 545, label: 'Dog walking' }, back: 'nav' },
  { screen: 'services', title: 'Choose what your pet needs', text: 'Walks, home boarding or a cat visit, each with its price up front.', tap: { x: 200, y: 140, label: 'Dog walking and cleaning' } },
  { screen: 'walkers', title: 'Pick a neighbour you can see', text: 'Everyone listed lives in your community and is Aadhaar-verified. See their tower, rating and how far away they are.', tap: { x: 322, y: 180, label: 'Book Priya' } },
  { screen: 'booking', title: 'Set the time', text: 'Length, day and time. Add a note like "bring poop bags" and the price updates as you go.', tap: { x: 297, y: 718, label: 'Confirm' } },
  { screen: 'payment', title: 'Pay your way', text: 'UPI or card now, or pay after the walk. Your first booking starts with a free meet-and-greet.', tap: { x: 195, y: 792, label: 'Confirm booking' } },
  { screen: 'track', title: 'Watch the walk live', text: 'GPS route, minutes and distance, and a photo every 15 minutes. You can message the walker any time.', tap: { x: 307, y: 302, label: 'Biscuit, live' } },
];
const DWELL = 3600;

export default function AppWalkthrough() {
  const steps = LANDING_STEPS;
  const [ref, seen] = useInView<HTMLDivElement>(0.25);
  const phoneRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(phoneRef, 0.35);
  const [target, setTarget] = useState(0);
  const [paused, setPaused] = useState(false);
  const run = useStepRunner(steps, target, seen);
  const [w, setW] = useState(300);
  const playing = seen && onScreen && !paused && !run.reduced;

  useEffect(() => {
    const fit = () => setW(Math.round(Math.min(300, Math.max(220, window.innerWidth - 90))));
    fit(); window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => setTarget((n) => (n + 1) % steps.length), DWELL);
    return () => window.clearTimeout(t);
  }, [playing, target, steps.length]);

  return (
    <div ref={ref} className="pp-split"
      style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 'clamp(28px, 5vw, 72px)', alignItems: 'center' }}>
      <style>{`
        .pp-aw-step { transition: background .35s ease, box-shadow .35s ease, transform .35s cubic-bezier(.34,1.56,.64,1); }
        .pp-aw-step:hover { transform: translateX(4px); }
        .pp-aw-bar { animation: pp-aw-fill ${DWELL}ms linear forwards; }
        @keyframes pp-aw-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @media (max-width: 860px) { .pp-aw-phone { order: -1; justify-self: center; } }
      `}</style>
      <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
        {steps.map((st, i) => {
          const on = i === target;
          return (
            <li key={st.screen}>
              <button className="pp-aw-step" onClick={() => setTarget(i)} aria-current={on ? 'step' : undefined}
                style={{
                  display: 'grid', gridTemplateColumns: '38px 1fr', gap: 12, width: '100%', textAlign: 'left', cursor: 'pointer',
                  border: `1px solid ${on ? 'rgba(255,255,255,.9)' : 'transparent'}`, borderRadius: 20, padding: '14px 16px',
                  background: on ? 'rgba(255,255,255,.75)' : 'transparent', boxShadow: on ? '0 14px 34px rgba(20,48,31,.10), inset 0 1px 0 #fff' : 'none',
                  backdropFilter: on ? 'blur(12px)' : undefined, position: 'relative', overflow: 'hidden', fontFamily: body,
                }}>
                <span style={{ fontFamily: head, fontWeight: 800, fontSize: 15, color: on ? T.marigold : T.muted2, paddingTop: 1 }}>{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <span style={{ display: 'block', fontFamily: head, fontWeight: 800, fontSize: 17, letterSpacing: '-0.015em', color: on ? T.ink : T.sub }}>{st.title}</span>
                  <span style={{ display: 'grid', gridTemplateRows: on ? '1fr' : '0fr', transition: 'grid-template-rows .4s ease' }}>
                    <span style={{ overflow: 'hidden', fontSize: 14.5, lineHeight: 1.6, color: T.sub }}><span style={{ display: 'block', paddingTop: 6 }}>{st.text}</span></span>
                  </span>
                </span>
                {on && playing && <span key={target} className="pp-aw-bar" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, background: T.leafBright, transformOrigin: 'left' }} />}
              </button>
            </li>
          );
        })}
      </ol>
      <div className="pp-aw-phone" ref={phoneRef}>
        <PhoneStage steps={steps} run={run} width={w} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap', fontFamily: body, fontSize: 12.5, color: T.muted, marginTop: 14 }}>
          {!run.reduced && (
            <button className="pp-glass-btn" onClick={() => setPaused((v) => !v)} style={{ fontSize: 13, padding: '7px 14px', minHeight: 36 }}>{paused ? 'Play' : 'Pause'}</button>
          )}
          <span>{paused ? 'Paused. Pick any step.' : 'Real app screens, clicked through for you.'}</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- tour page: scroll-driven ------------------------- */

/** How long each screen is held before the tour moves itself on. */
const TOUR_DWELL = 5200;

export function AppScrollTour({ steps }: { steps: DemoStep[] }) {
  const [active, setActive] = useState(0);
  const run = useStepRunner(steps, active, true);
  const [dim, setDim] = useState({ w: 300, narrow: false, top: 96 });
  const refs = useRef<(HTMLElement | null)[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(wrapRef, 0);
  // Plays by itself until the visitor scrolls, touches or presses a key.
  const [auto, setAuto] = useState(true);
  const [beat, setBeat] = useState(0); // counts moves the tour has made on its own; 0 means it has not started
  const playing = auto && onScreen && !run.reduced;

  useEffect(() => {
    const fit = () => {
      const narrow = window.innerWidth <= 860, vh = window.innerHeight;
      const budget = narrow ? vh * 0.5 - 30 : vh - 190;
      const w = Math.round(Math.min(narrow ? 250 : 330, Math.max(170, budget * (390 / 844))));
      const h = 844 * (w / 390) + 18;
      setDim({ w, narrow, top: narrow ? 66 : Math.max(86, (vh - h) / 2 + 26) });
    };
    fit(); window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const probe = window.innerHeight * (dim.narrow ? 0.78 : 0.5);
      let best = 0, bestD = Infinity;
      refs.current.forEach((el, i) => {
        if (!el) return;
        const b = el.getBoundingClientRect();
        const d = probe < b.top ? b.top - probe : probe > b.bottom ? probe - b.bottom : 0;
        if (d < bestD) { bestD = d; best = i; }
      });
      setActive(best);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); if (raf) cancelAnimationFrame(raf); };
  }, [dim.narrow]);

  const goTo = (i: number) => {
    const el = refs.current[Math.max(0, Math.min(steps.length - 1, i))];
    if (!el) return;
    const b = el.getBoundingClientRect();
    const probe = window.innerHeight * (dim.narrow ? 0.78 : 0.5);
    const anchor = dim.narrow ? b.top + 40 : b.top + b.height / 2;
    window.scrollBy({ top: anchor - probe, behavior: 'smooth' });
  };
  const goRef = useRef(goTo);
  goRef.current = goTo;

  // The video: hold each screen, then move the page to the next card. The cursor does the rest.
  useEffect(() => {
    if (!playing) return;
    const first = beat === 0;
    const last = active === steps.length - 1;
    const t = window.setTimeout(() => {
      goRef.current(first ? 0 : last ? 0 : active + 1);
      setBeat((n) => n + 1); // re-arms the timer even when the step did not change
    }, first ? 1600 : last ? TOUR_DWELL + 1800 : TOUR_DWELL);
    return () => window.clearTimeout(t);
  }, [playing, active, beat, steps.length]);

  // Real scrolling, touching or scroll keys hand control to the visitor. Our own smooth scroll fires none of these.
  useEffect(() => {
    if (!auto) return;
    const stop = () => setAuto(false);
    const key = (e: KeyboardEvent) => { if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(e.key)) stop(); };
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchmove', stop, { passive: true });
    window.addEventListener('keydown', key);
    return () => { window.removeEventListener('wheel', stop); window.removeEventListener('touchmove', stop); window.removeEventListener('keydown', key); };
  }, [auto]);

  return (
    <div ref={wrapRef} className="pp-tour" style={{ position: 'relative', display: 'grid', gridTemplateColumns: dim.narrow ? '1fr' : 'minmax(0, 1fr) auto', gap: dim.narrow ? 0 : 'clamp(32px, 6vw, 96px)', alignItems: 'start' }}>
      <style>{`
        .pp-tour-card { transition: opacity .5s ease, transform .6s cubic-bezier(.2,.7,.2,1), box-shadow .5s ease, background .5s ease; }
        .pp-tour-card[data-on="false"] { opacity: .28; transform: translateY(10px) scale(.985); }
        .pp-tour-dot { transition: width .35s ease, background .35s ease; }
        .pp-tour-bar { animation: pp-tour-fill ${TOUR_DWELL}ms linear forwards; transform-origin: left; }
        @keyframes pp-tour-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .pp-tour-ctl { font-size: 13px !important; padding: 7px 14px !important; min-height: 36px !important; }
        @media (prefers-reduced-motion: reduce) { .pp-tour-card { transition: none; transform: none !important; } }
      `}</style>

      {/* The phone stays put */}
      <div style={{
        position: 'sticky', top: dim.top, zIndex: 3, order: dim.narrow ? 0 : 2, justifySelf: 'center',
        ...(dim.narrow ? { width: '100%', display: 'grid', justifyItems: 'center', padding: '10px 0 12px', background: T.canvas, boxShadow: `0 16px 18px -8px ${T.canvas}` } : {}),
      }}>
        <PhoneStage steps={steps} run={run} width={dim.w} onHotspot={active < steps.length - 1 ? () => goTo(active + 1) : undefined} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: dim.narrow ? 8 : 16 }} aria-hidden="true">
          {steps.map((s, i) => <span key={s.screen} className="pp-tour-dot" style={{ height: 5, borderRadius: 5, width: i === active ? 22 : 5, background: i === active ? T.marigold : i < active ? T.leafBright : T.line2 }} />)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap', fontFamily: body, fontSize: 12.5, color: T.muted, marginTop: dim.narrow ? 6 : 10 }}>
          {!run.reduced && (
            <button className="pp-glass-btn pp-tour-ctl" onClick={() => setAuto((v) => !v)}>{auto ? 'Pause' : 'Play'}</button>
          )}
          {!dim.narrow && <span>{auto && !run.reduced ? 'Playing by itself. Scroll to take over.' : 'Scroll, or click the glowing button on the phone.'}</span>}
        </div>
      </div>

      {/* The cards scroll */}
      <div style={{ order: 1, paddingBottom: dim.narrow ? '30vh' : '18vh' }}>
        {steps.map((st, i) => (
          <section
            key={st.screen}
            id={st.screen}
            ref={(el) => { refs.current[i] = el; }}
            style={{ minHeight: dim.narrow ? '58vh' : '82vh', display: 'flex', alignItems: dim.narrow ? 'flex-start' : 'center', padding: dim.narrow ? '14px 0' : '0', scrollMarginTop: 90 }}
          >
            <div className="pp-tour-card" data-on={i === active}
              style={{
                width: '100%', maxWidth: 560, borderRadius: 26, padding: 'clamp(20px, 2.6vw, 34px)', fontFamily: body,
                background: i === active ? 'rgba(255,255,255,.82)' : 'rgba(255,255,255,.4)', border: '1px solid rgba(255,255,255,.9)',
                boxShadow: i === active ? '0 24px 56px rgba(20,48,31,.10), inset 0 1px 0 #fff' : 'none', backdropFilter: 'blur(12px)',
                position: 'relative', overflow: 'hidden',
              }}>
              {i === active && playing && beat > 0 && <span key={`bar${active}-${beat}`} className="pp-tour-bar" aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, background: T.leafBright }} />}
              <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', marginBottom: 12 }}>
                <span style={{ fontFamily: head, fontWeight: 800, fontSize: 14, color: T.marigold }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontWeight: 700, fontSize: 12, letterSpacing: '0.13em', textTransform: 'uppercase', color: T.leaf }}>{st.kicker}</span>
              </div>
              <h2 style={{ fontFamily: head, fontWeight: 800, fontSize: 'clamp(22px, 2.6vw, 34px)', letterSpacing: '-0.025em', lineHeight: 1.12, margin: '0 0 12px', color: T.ink }}>{st.title}</h2>
              <p style={{ fontSize: 'clamp(14.5px, 1.2vw, 16px)', lineHeight: 1.65, color: T.sub, margin: 0 }}>{st.text}</p>
              {st.points && (
                <ul style={{ margin: '16px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 8, borderTop: `1px solid ${T.line}`, paddingTop: 14 }}>
                  {st.points.map((p) => <li key={p} style={{ fontSize: 14, lineHeight: 1.5, color: T.sub }}>{p}</li>)}
                </ul>
              )}
              {i < steps.length - 1 && (
                <button onClick={() => goTo(i + 1)} className="pp-glass-btn" style={{ marginTop: 18, fontSize: 14, padding: '10px 18px', minHeight: 42 }}>
                  Next: {st.tap.label}
                </button>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
