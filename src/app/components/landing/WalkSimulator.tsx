/**
 * "Try a walk": an interactive demo of a ProxyPaw booking from start to payment.
 *
 * Dog walk: Biscuit and Priya loop the black jogging track on a real aerial
 * photograph of the garden; an hour runs in about 20 seconds, with a live GPS
 * trail, clock, distance and the updates a pet parent would get. Cat visit:
 * Momo's home visit as a checklist over a photograph of a visit. Both stages are
 * photographs, not illustrations (she asked for the real world, not a cartoon). Either ends in a "done" pop-up with the receipt (and where the money
 * goes), a demo payment, and the waitlist CTA. Sample data from the demo cast
 * (see memory: Prestige High Fields, Biscuit, Momo, Priya S., Lolio of Tower 7).
 *
 * It plays by itself, like a video: while it is on screen a cursor presses start,
 * the walk runs, a small receipt appears on the map, then the cursor switches to
 * the cat visit and plays that, and it loops. Any real tap, click or key inside
 * the demo stops the cursor and hands over the controls ("Play it for me"
 * starts it again). The self-playing run shows its receipt on the map, not as
 * the pop-up, so nothing ever jumps in front of the page on its own.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { CSSProperties } from 'react';
import { T, head, btnPrimary, btnSecondary, usePrefersReducedMotion, useOnScreen } from './ui';

type Mode = 'dog' | 'cat';
type Phase = 'idle' | 'running' | 'done' | 'paid';

const WALKS = [
  { min: 30, price: 149, label: '30 min' },
  { min: 60, price: 249, label: '1 hour' },
  { min: 90, price: 349, label: '1.5 hours' },
  { min: 120, price: 449, label: '2 hours' },
];
const CAT_VISIT = { min: 30, price: 129 };

const DOG_EVENTS = [
  { at: 0, text: 'Priya picked Biscuit up at Tower C. Harness and leash checked.' },
  { at: 0.1, text: 'Sniff stop under the gulmohar tree.' },
  { at: 0.28, text: 'Met Lolio from Tower 7. Polite sniffs, tails up.', photo: '/real/dogpark.jpg' },
  { at: 0.48, text: 'Water break at the clubhouse tap.' },
  { at: 0.66, text: 'Happy trot on the lawn loop.', photo: '/real/hero.jpg' },
  { at: 0.86, text: 'Cool-down pace on the way home.' },
  { at: 0.99, text: 'Home. Paws wiped, water bowl refilled, door locked.' },
];
const CAT_STEPS = [
  { at: 0, text: 'Priya let herself in with the code you shared.' },
  { at: 0.14, text: 'Fresh food in Momo’s bowl (½ cup, as noted).' },
  { at: 0.28, text: 'Water bowl washed and refilled.' },
  { at: 0.42, text: 'Litter box scooped.' },
  { at: 0.58, text: '15 minutes with the feather wand. Momo won.' },
  { at: 0.74, text: 'Cuddles on the rug. Purring at full volume.', photo: '/real/cat-visit.jpg' },
  { at: 0.9, text: 'Windows checked, lights off, door locked.' },
];

const DEMO_SECONDS = 20;
/**
 * The walk route, traced along the black jogging track in public/real/track-aerial.jpg
 * (1600 x 900): the near stretch left to right, up the right-hand path, across the paving
 * in front of the play area, and back along the hedge. The photograph is the generated
 * aerial (community.jpg) with its paved path repainted as charcoal asphalt with white
 * stripes. If the photograph changes, re-trace these points.
 */
const ROUTE_PTS: [number, number][] = [
  [252, 649], [259, 678], [276, 698], [300, 712], [326, 722], [351, 732], [377, 744], [401, 759], [425, 775], [451, 788], [477, 800],
  [504, 808], [532, 816], [559, 825], [587, 831], [614, 836], [643, 839], [670, 844], [697, 852], [724, 857], [752, 860], [780, 862],
  [808, 866], [836, 870], [863, 877], [892, 874], [920, 867], [948, 866], [976, 866], [1004, 867], [1032, 867], [1060, 867], [1088, 867],
  [1116, 866], [1144, 862], [1171, 859], [1199, 855], [1226, 850], [1254, 843], [1281, 836], [1309, 829], [1334, 819], [1358, 806],
  [1398, 794], [1432, 776], [1446, 748], [1432, 708], [1408, 676],
  [1395, 659], [1382, 644], [1361, 624], [1341, 602], [1324, 581], [1303, 564],
  [1272, 551], [1205, 559], [1125, 569], [1045, 574], [980, 573],
  [943, 567], [919, 578], [892, 582], [865, 587], [837, 591], [809, 595], [781, 600], [753, 604], [726, 609], [698, 613], [670, 617],
  [643, 622], [615, 626], [587, 631], [560, 634], [533, 638], [506, 642], [478, 642], [449, 640], [423, 630], [397, 623], [368, 620],
  [340, 622], [313, 628], [287, 637], [266, 643],
];
/** A smooth closed curve through the traced points (Catmull-Rom to cubic Bezier). */
const TRAIL = (() => {
  const P = ROUTE_PTS, n = P.length;
  let d = `M${P[0][0]} ${P[0][1]}`;
  for (let i = 0; i < n; i++) {
    const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return `${d}Z`;
})();

function fmtClock(min: number) {
  const total = 7 * 60 + Math.floor(min);
  const h = Math.floor(total / 60), m = total % 60;
  return `${h > 12 ? h - 12 : h}:${String(m).padStart(2, '0')} am`;
}
const inr = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: n % 1 ? 2 : 0 })}`;

/** The dog walk: a real aerial photograph of the garden, with the live GPS route drawn along the jogging track. */
function RouteMap({ progress, laps, running }: { progress: number; laps: number; running: boolean }) {
  const pathRef = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(1);
  useEffect(() => { if (pathRef.current) setLen(pathRef.current.getTotalLength()); }, []);
  const lapP = (progress * laps) % 1 || (progress >= 1 ? 1 : 0);
  const pt = pathRef.current ? pathRef.current.getPointAtLength(len * lapP) : { x: ROUTE_PTS[0][0], y: ROUTE_PTS[0][1] };
  const ahead = pathRef.current ? pathRef.current.getPointAtLength(Math.min(len, len * lapP + 16)) : { x: ROUTE_PTS[1][0], y: ROUTE_PTS[1][1] };
  const angle = Math.atan2(ahead.y - pt.y, ahead.x - pt.x);
  const walker = { x: pt.x - Math.cos(angle) * 46, y: pt.y - Math.sin(angle) * 46 };
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" role="img"
      aria-label="Aerial photograph of the community garden at sunrise, with the walk route drawn along the black jogging track"
      style={{ width: '100%', height: '100%', display: 'block', background: '#5d7a45' }}>
      <image href="/real/track-aerial.jpg" width="1600" height="900" preserveAspectRatio="xMidYMid slice" />
      <path ref={pathRef} d={TRAIL} fill="none" stroke="none" />
      {/* GPS trail for this lap */}
      <path d={TRAIL} fill="none" stroke="#ffffff" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={len} strokeDashoffset={len * (1 - lapP)} opacity={progress > 0 ? 0.6 : 0} />
      <path d={TRAIL} fill="none" stroke={T.marigold} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={len} strokeDashoffset={len * (1 - lapP)} opacity={progress > 0 ? 0.96 : 0} />
      {/* Start pin */}
      <g transform={`translate(${ROUTE_PTS[0][0]} ${ROUTE_PTS[0][1]})`}>
        <circle r="21" fill="#ffffff" stroke={T.leaf} strokeWidth="7" />
      </g>
      {/* Walker and dog */}
      <g transform={`translate(${walker.x} ${walker.y})`}>
        <circle r="19" fill={T.leaf} stroke="#ffffff" strokeWidth="6" />
      </g>
      <g transform={`translate(${pt.x} ${pt.y})`}>
        {running && <circle r="52" fill={T.marigold} opacity=".22" className="pp-pulse" />}
        <circle r="31" fill={T.marigold} stroke="#ffffff" strokeWidth="7" />
        <g fill="#ffffff" transform="translate(-12 -12)">
          <ellipse cx="8.2" cy="7.4" rx="2.1" ry="2.9" /><ellipse cx="15.8" cy="7.4" rx="2.1" ry="2.9" />
          <ellipse cx="4.6" cy="12" rx="1.9" ry="2.5" /><ellipse cx="19.4" cy="12" rx="1.9" ry="2.5" />
          <path d="M12 11.5c-2.9 0-5.6 2.6-5.6 5.2 0 1.8 1.4 2.9 3 2.9 1 0 1.7-.4 2.6-.4s1.6.4 2.6.4c1.6 0 3-1.1 3-2.9 0-2.6-2.7-5.2-5.6-5.2z" />
        </g>
      </g>
    </svg>
  );
}

const CAT_CHECKS = [
  { at: 0.14, t: 'Fresh food' }, { at: 0.28, t: 'Water' }, { at: 0.42, t: 'Litter' },
  { at: 0.58, t: 'Play' }, { at: 0.74, t: 'Cuddles' }, { at: 0.9, t: 'Locked up' },
];

/** The cat visit: a photograph of a home visit, with the checklist ticking off as the visit runs. */
function CatRoom({ progress }: { progress: number }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#6d6a5e' }}>
      <img className="pp-kenburns" src="/real/cat-visit.jpg" alt="A neighbour sitting on the floor of a flat, stroking a fluffy grey cat during a home visit"
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '58% 38%', display: 'block' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(20,48,31,.5), rgba(20,48,31,.12) 44%, rgba(20,48,31,0) 60%)' }} />
      <ul style={{ position: 'absolute', left: 14, top: 18, margin: 0, padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, auto))', gap: 6 }}>
        {CAT_CHECKS.map((it) => {
          const done = progress >= it.at;
          return (
            <li key={it.t} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, minWidth: 124, padding: '7px 11px', borderRadius: 12,
              fontFamily: head, fontWeight: 700, fontSize: 13, color: done ? T.ink : 'rgba(255,255,255,.94)',
              background: done ? 'rgba(255,255,255,.93)' : 'rgba(255,255,255,.16)', border: '1px solid rgba(255,255,255,.5)',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', transition: 'background .5s ease, color .5s ease',
            }}>
              <span>{it.t}</span>
              <span style={{ fontSize: 11, color: done ? T.leaf : 'rgba(255,255,255,.72)' }}>{done ? 'Done' : 'To do'}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function WalkSimulator({ onJoin }: { onJoin: (source: string, intent?: 'owner' | 'walker') => void }) {
  const [mode, setMode] = useState<Mode>('dog');
  const [walkIdx, setWalkIdx] = useState(1);
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [pay, setPay] = useState<'upi' | 'card' | null>(null);
  const reduced = usePrefersReducedMotion();
  const raf = useRef(0);
  const t0 = useRef(0);
  // Self-playing mode: a cursor runs the demo until the visitor touches it.
  const [auto, setAuto] = useState(true);
  const [inline, setInline] = useState(false); // this run was started by the cursor, so its receipt stays on the map
  const [cur, setCur] = useState({ x: 0, y: 0, on: false, press: false, rip: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const startBtn = useRef<HTMLButtonElement>(null);
  const dogTab = useRef<HTMLButtonElement>(null);
  const catTab = useRef<HTMLButtonElement>(null);
  const onScreen = useOnScreen(stageRef, 0.5);
  const playing = auto && !reduced;

  const plan = mode === 'dog' ? WALKS[walkIdx] : CAT_VISIT;
  const minutes = plan.min;
  const laps = mode === 'dog' ? Math.max(1, Math.round(minutes / 30)) : 1;
  const events = mode === 'dog' ? DOG_EVENTS : CAT_STEPS;
  const shown = phase === 'idle' ? [] : events.filter((e) => progress >= e.at);
  const neighbour = +(plan.price * 0.7).toFixed(2);
  const platform = +(plan.price - neighbour).toFixed(2);
  const km = (minutes / 60) * 3.2 * Math.min(1, progress);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const reset = (m: Mode = mode) => {
    cancelAnimationFrame(raf.current);
    setMode(m); setPhase('idle'); setProgress(0); setPay(null); setInline(false);
  };

  const start = (byCursor = false) => {
    cancelAnimationFrame(raf.current);
    setInline(byCursor);
    setPay(null); setPhase('running'); setProgress(0);
    const total = (reduced ? 4 : DEMO_SECONDS) * 1000;
    t0.current = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0.current) / total);
      setProgress(p);
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else setPhase('done');
    };
    raf.current = requestAnimationFrame(tick);
  };
  const skip = () => { cancelAnimationFrame(raf.current); setProgress(1); setPhase('done'); };

  // The director reads the latest state through this ref, so one long-running loop never goes stale.
  const live = useRef({ phase, mode, onScreen, start, reset });
  live.current = { phase, mode, onScreen, start, reset };

  useEffect(() => {
    if (!playing) { setCur((c) => ({ ...c, on: false })); return; }
    let dead = false;
    const timers: number[] = [];
    const sleep = (ms: number) => new Promise<void>((res) => { timers.push(window.setTimeout(res, ms)); });
    const until = async (fn: () => boolean) => { while (!dead && !fn()) await sleep(140); };
    /** Glide to a control, press it, and report whether we are still running. */
    const press = async (el: HTMLElement | null) => {
      const root = rootRef.current;
      if (!el || !root) return !dead;
      const a = el.getBoundingClientRect(), r = root.getBoundingClientRect();
      setCur((c) => ({ ...c, on: true, x: a.left - r.left + a.width * 0.5, y: a.top - r.top + a.height * 0.56 }));
      await sleep(850);
      if (dead) return false;
      setCur((c) => ({ ...c, press: true, rip: c.rip + 1 }));
      await sleep(240);
      setCur((c) => ({ ...c, press: false }));
      await sleep(110);
      return !dead;
    };
    const runOne = async (m: Mode, tab: HTMLButtonElement | null) => {
      await until(() => live.current.onScreen);
      if (live.current.mode !== m || live.current.phase !== 'idle') {
        if (!(await press(tab))) return false;
        live.current.reset(m);
        await sleep(650);
      }
      if (!(await press(startBtn.current))) return false;
      live.current.start(true);
      await until(() => live.current.phase === 'done');
      await sleep(5600); // time to read the receipt
      return !dead;
    };
    (async () => {
      await sleep(1100);
      while (!dead) {
        if (!(await runOne('dog', dogTab.current))) break;
        if (!(await runOne('cat', catTab.current))) break;
      }
    })();
    return () => { dead = true; timers.forEach((t) => window.clearTimeout(t)); };
  }, [playing]);

  /** A real tap, click or key inside the demo hands the controls to the visitor. */
  const takeOver = (e: { target: EventTarget | null }) => {
    if (!auto || (e.target as Element | null)?.closest?.('[data-auto-ctl]')) return;
    setAuto(false);
  };

  const share = useMemo(() => 'https://wa.me/?text=' + encodeURIComponent(
    'Found this for our community: ProxyPaw, verified neighbours for dog walks, cat visits and boarding. Join the waitlist so they open here: https://www.proxypaw.com',
  ), []);

  const tab = (active: boolean): CSSProperties => ({
    border: 'none', cursor: 'pointer', fontFamily: head, fontWeight: 700, fontSize: 15,
    padding: '11px 18px', borderRadius: 999, minHeight: 44,
    background: active ? T.leafGlass2 : 'transparent', boxShadow: active ? `inset 0 0 0 1px ${T.leafLine}` : 'none', color: active ? T.ink : T.sub,
  });

  return (
    <div ref={rootRef} onPointerDownCapture={takeOver} onKeyDownCapture={takeOver}
      style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1fr)', gap: 'clamp(16px, 2vw, 24px)' }} className="pp-split">
      <style>{`
        .ws-cur { position: absolute; width: 0; height: 0; z-index: 6; pointer-events: none; transition: left .8s cubic-bezier(.45,0,.2,1), top .8s cubic-bezier(.45,0,.2,1), opacity .35s ease; }
        .ws-rip { position: absolute; left: 0; top: 0; width: 46px; height: 46px; border-radius: 50%; background: ${T.marigold}; animation: ws-rip .6s ease-out forwards; }
        @keyframes ws-rip { from { transform: translate(-50%,-50%) scale(.25); opacity: .55; } to { transform: translate(-50%,-50%) scale(2.3); opacity: 0; } }
        .ws-receipt { animation: ws-rise .55s cubic-bezier(.34,1.56,.64,1) both; }
        @keyframes ws-rise { from { opacity: 0; transform: translateY(14px) scale(.95); } to { opacity: 1; transform: none; } }
        .ws-auto { font-size: 13px !important; padding: 7px 14px !important; min-height: 36px !important; }
        @media (prefers-reduced-motion: reduce) { .ws-cur, .ws-receipt { transition: none; animation: none; } }
      `}</style>
      {/* The cursor that plays the demo */}
      <div className="ws-cur" aria-hidden="true" style={{ left: cur.x, top: cur.y, opacity: cur.on && playing ? 1 : 0 }}>
        {cur.rip > 0 && <span key={cur.rip} className="ws-rip" />}
        <svg width="26" height="30" viewBox="0 0 26 30" style={{ position: 'absolute', left: -3, top: -2, transform: `scale(${cur.press ? 0.86 : 1})`, transformOrigin: '3px 2px', transition: 'transform .14s ease', filter: 'drop-shadow(0 3px 5px rgba(20,48,31,.35))' }}>
          <path d="M3 2v22l6-5.4 4.2 9 4-1.9-4.2-8.9 8-.7z" fill="#14301f" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      </div>
      {/* Stage */}
      <div ref={stageRef} style={{ position: 'relative', display: 'flex', flexDirection: 'column', borderRadius: 28, overflow: 'hidden', background: T.surface, border: `1px solid ${T.line}`, boxShadow: '0 30px 70px rgba(28,60,40,.14)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: `1px solid ${T.line}`, flexWrap: 'wrap' }}>
          <div role="tablist" aria-label="Choose a service" style={{ display: 'inline-flex', background: T.leafPale, borderRadius: 999, padding: 4 }}>
            <button ref={dogTab} role="tab" aria-selected={mode === 'dog'} className="pp-tab" style={tab(mode === 'dog')} onClick={() => reset('dog')}>Dog walk</button>
            <button ref={catTab} role="tab" aria-selected={mode === 'cat'} className="pp-tab" style={tab(mode === 'cat')} onClick={() => reset('cat')}>Cat visit</button>
          </div>
          {!reduced && (
            <button data-auto-ctl className="pp-glass-btn ws-auto" onClick={() => { if (auto) setAuto(false); else { reset('dog'); setAuto(true); } }}>
              {auto ? 'Pause' : 'Play it for me'}
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.muted, fontWeight: 600 }}>
            <span className={phase === 'running' ? 'pp-pulse' : undefined} style={{ width: 8, height: 8, borderRadius: '50%', background: phase === 'running' ? T.leafBright : T.line2 }} />
            {phase === 'running' ? 'Live' : phase === 'idle' ? (playing ? 'Playing by itself' : 'Ready') : 'Finished'} · Prestige High Fields · demo
          </div>
        </div>
        <div style={{ aspectRatio: '16 / 9', position: 'relative', flex: '1 1 auto', minHeight: 0 }}>
          {mode === 'dog'
            ? <RouteMap progress={progress} laps={laps} running={phase === 'running'} />
            : <CatRoom progress={phase === 'idle' ? -1 : progress} />}
          {/* HUD */}
          <div className="pp-hud" style={{ position: 'absolute', left: 14, bottom: 14, right: 14, display: 'flex', gap: 8, flexWrap: 'wrap', pointerEvents: 'none' }}>
            {[
              { k: 'Clock', v: fmtClock(minutes * progress) },
              { k: mode === 'dog' ? 'Walked' : 'Visit', v: mode === 'dog' ? `${km.toFixed(1)} km` : `${Math.round(minutes * progress)} of ${minutes} min` },
              { k: 'Updates', v: `${shown.length}` },
            ].map((h) => (
              <div key={h.k} style={{ background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(8px)', borderRadius: 14, padding: '8px 12px', boxShadow: '0 8px 20px rgba(28,60,40,.12)' }}>
                <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase' }}>{h.k}</div>
                <div style={{ fontFamily: head, fontWeight: 800, fontSize: 16, color: T.ink, fontVariantNumeric: 'tabular-nums' }}>{h.v}</div>
              </div>
            ))}
          </div>
          {/* Receipt on the map, for runs the cursor started */}
          {inline && phase === 'done' && (
            <div className="ws-receipt" style={{ position: 'absolute', right: 12, top: 16, width: 'min(290px, 74%)', background: 'rgba(255,255,255,.94)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,.95)', borderRadius: 18, padding: '12px 14px', boxShadow: '0 18px 40px rgba(20,48,31,.2)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: T.marigoldDark }}>{fmtClock(minutes)} · {mode === 'dog' ? 'Walk complete' : 'Visit complete'}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontFamily: head, fontWeight: 800, fontSize: 15.5, color: T.ink, margin: '6px 0 4px' }}>
                <span>{mode === 'dog' ? `${WALKS[walkIdx].label} dog walk` : 'Cat home visit'}</span><span>{inr(plan.price)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12.5, color: T.sub }}><span>To Priya, your neighbour (70%)</span><span>{inr(neighbour)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12.5, color: T.muted }}><span>To ProxyPaw</span><span>{inr(platform)}</span></div>
              <div style={{ display: 'flex', height: 6, borderRadius: 99, overflow: 'hidden', marginTop: 8 }}>
                <div style={{ width: '70%', background: T.leafBright }} /><div style={{ width: '30%', background: T.marigold }} />
              </div>
            </div>
          )}
          {/* Progress bar */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 4, background: 'rgba(255,255,255,.6)' }}>
            <div style={{ width: `${progress * 100}%`, height: '100%', background: T.marigold, transition: 'width .1s linear' }} />
          </div>
        </div>
      </div>

      {/* Controls + live feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
        <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 24, padding: 20 }}>
          {mode === 'dog' ? (
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.muted, marginBottom: 10 }}>How long should Biscuit walk?</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {WALKS.map((w, i) => (
                  <button key={w.min} onClick={() => { setWalkIdx(i); reset('dog'); }} aria-pressed={walkIdx === i} className="pp-tab"
                    style={{ border: `1.5px solid ${walkIdx === i ? T.leaf : T.line}`, background: walkIdx === i ? T.leafPale : T.surface, borderRadius: 14, padding: '10px 4px', cursor: 'pointer', minHeight: 56 }}>
                    <div style={{ fontFamily: head, fontWeight: 800, fontSize: 14, color: T.ink }}>{w.label}</div>
                    <div style={{ fontSize: 12.5, color: T.muted, fontWeight: 600 }}>₹{w.price}</div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 14.5, color: T.sub, lineHeight: 1.55 }}>
              <strong style={{ color: T.ink }}>Momo’s 30-minute home visit, ₹129.</strong> Food, water, litter, play and a cuddle, with photos.
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            {phase === 'running' ? (
              <button className="pp-glass-btn" style={{ ...btnSecondary, flex: 1, justifyContent: 'center' }} onClick={skip}>Skip to the end</button>
            ) : (
              <button ref={startBtn} className="pp-glass-btn pp-glass-primary" style={{ ...btnPrimary, flex: 1, justifyContent: 'center' }} onClick={() => start()}>
                {mode === 'dog' ? `Start Biscuit’s ${WALKS[walkIdx].label} walk` : 'Start Momo’s visit'}
              </button>
            )}
          </div>
          <div style={{ fontSize: 12, color: T.muted2, marginTop: 10 }}>
            {mode === 'dog' ? `${minutes} minutes plays in about ${DEMO_SECONDS} seconds.` : `The visit plays in about ${DEMO_SECONDS} seconds.`} Sample pets and people.
          </div>
        </div>

        <div aria-live="polite" style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 24, padding: 18, flex: 1, minHeight: 220, overflow: 'hidden' }}>
          <div style={{ fontFamily: head, fontWeight: 800, fontSize: 15, marginBottom: 12, color: T.ink }}>Updates on your phone</div>
          {shown.length === 0 && <div style={{ fontSize: 14, color: T.muted, lineHeight: 1.6 }}>{playing ? 'It starts by itself.' : 'Press start.'} Every update Priya sends lands here, the way it would in the app.</div>}
          <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column-reverse', gap: 10 }}>
            {shown.map((e) => (
              <li key={e.text} className="pp-fade-in" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 12, fontWeight: 700, color: T.leaf, minWidth: 58, paddingTop: 2 }}>{fmtClock(minutes * e.at)}</span>
                <div style={{ fontSize: 14, color: T.sub, lineHeight: 1.45 }}>
                  {e.text}
                  {'photo' in e && e.photo && (
                    <img src={e.photo} alt="" loading="lazy" style={{ display: 'block', marginTop: 8, width: 120, height: 76, objectFit: 'cover', borderRadius: 10 }} />
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Done pop-up */}
      {(phase === 'done' || phase === 'paid') && !inline && createPortal(
        <div role="dialog" aria-modal="true" aria-labelledby="ws-done" className="pp-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) reset(); }}
          style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(20,48,31,.5)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', padding: 16 }}>
          <div className="pp-modal-in" style={{ width: 'min(460px, 100%)', maxHeight: '92vh', overflowY: 'auto', background: T.surface, borderRadius: 28, boxShadow: '0 40px 90px rgba(20,48,31,.35)' }}>
            <div style={{ position: 'relative', height: 150 }}>
              <img src={mode === 'dog' ? '/real/hero.jpg' : '/real/cat-visit.jpg'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '28px 28px 0 0' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(20,48,31,0) 40%, rgba(20,48,31,.7))', borderRadius: '28px 28px 0 0' }} />
              <div style={{ position: 'absolute', left: 20, bottom: 14, color: '#fff', fontFamily: head, fontWeight: 800, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase' }}>
                {fmtClock(minutes)} · {mode === 'dog' ? 'Walk complete' : 'Visit complete'}
              </div>
            </div>
            <div style={{ padding: 22 }}>
              <h3 id="ws-done" style={{ fontFamily: head, fontWeight: 800, fontSize: 24, letterSpacing: '-.02em', margin: '0 0 6px', color: T.ink }}>
                {mode === 'dog' ? 'The walk is over. Biscuit is home and happy.' : 'Visit done. Momo is fed and purring.'}
              </h3>
              <p style={{ margin: '0 0 16px', color: T.sub, fontSize: 14.5, lineHeight: 1.55 }}>
                {mode === 'dog'
                  ? `${minutes} minutes, ${((minutes / 60) * 3.2).toFixed(1)} km on the community loop, ${shown.length} updates and 2 photos. Here’s your payment.`
                  : `Food, water, litter, play and cuddles, ${shown.length} updates and a photo. Here’s your payment.`}
              </p>
              <div style={{ border: `1px solid ${T.line}`, borderRadius: 18, padding: 14, marginBottom: 14 }}>
                {[
                  { k: mode === 'dog' ? `${WALKS[walkIdx].label} dog walk` : '30 min cat home visit', v: inr(plan.price), strong: true },
                  { k: 'To Priya, your neighbour (70%)', v: inr(neighbour) },
                  { k: 'To ProxyPaw: checks, insurance, GPS, support', v: inr(platform) },
                ].map((r) => (
                  <div key={r.k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0', fontSize: r.strong ? 15 : 13.5, fontWeight: r.strong ? 700 : 500, color: r.strong ? T.ink : T.muted }}>
                    <span>{r.k}</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{r.v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', height: 8, borderRadius: 99, overflow: 'hidden', marginTop: 8 }}>
                  <div style={{ width: '70%', background: T.leafBright }} /><div style={{ width: '30%', background: T.marigold }} />
                </div>
              </div>
              {phase === 'done' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button className="pp-glass-btn pp-glass-primary" style={{ ...btnPrimary, justifyContent: 'center', fontSize: 15 }} onClick={() => { setPay('upi'); setPhase('paid'); }}>Pay {inr(plan.price)} by UPI</button>
                  <button className="pp-glass-btn" style={{ ...btnSecondary, justifyContent: 'center', fontSize: 15 }} onClick={() => { setPay('card'); setPhase('paid'); }}>Pay by card</button>
                </div>
              ) : (
                <div className="pp-fade-in">
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: T.leafPale, borderRadius: 16, padding: '12px 14px', marginBottom: 12 }}>
                    <span style={{ width: 28, height: 28, borderRadius: '50%', background: T.leaf, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
                    </span>
                    <div style={{ fontSize: 14, color: T.ink, lineHeight: 1.4 }}>
                      <strong>Paid by {pay === 'upi' ? 'UPI' : 'card'}.</strong> This was a demo, so nothing was charged. +25 paw points.
                    </div>
                  </div>
                  <button className="pp-glass-btn pp-glass-primary" style={{ ...btnPrimary, width: '100%', justifyContent: 'center' }} onClick={() => { reset(); onJoin(`walk-demo-${mode}`); }}>
                    Join the waitlist for the real thing
                  </button>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <a className="pp-glass-btn" href={share} target="_blank" rel="noreferrer" style={{ ...btnSecondary, flex: 1, justifyContent: 'center', fontSize: 14, textDecoration: 'none' }}>Share with your tower</a>
                    <button className="pp-glass-btn" style={{ ...btnSecondary, flex: 1, justifyContent: 'center', fontSize: 14 }} onClick={() => reset()}>Run it again</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
