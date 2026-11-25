/**
 * "Try a walk": an interactive demo of a ProxyPaw booking from start to payment.
 *
 * Dog walk: Biscuit and Priya loop the community path on a top-down map; an hour
 * runs in about 20 seconds, with a live trail, clock, distance and the updates a
 * pet parent would get. Cat visit: Momo's home visit as a checklist with a little
 * room scene. Either ends in a "done" pop-up with the receipt (and where the money
 * goes), a demo payment, and the waitlist CTA. Sample data from the demo cast
 * (see memory: Prestige High Fields, Biscuit, Momo, Priya S., Lolio of Tower 7).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { CSSProperties } from 'react';
import { T, head, btnPrimary, btnSecondary, usePrefersReducedMotion } from './ui';

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
const TRAIL = 'M110 300 C 60 300 50 230 70 190 C 90 140 70 90 130 70 C 200 48 270 80 330 64 C 410 44 520 60 530 130 C 540 190 500 220 520 270 C 540 320 470 340 400 330 C 330 320 290 300 230 318 C 180 332 150 300 110 300 Z';

function fmtClock(min: number) {
  const total = 7 * 60 + Math.floor(min);
  const h = Math.floor(total / 60), m = total % 60;
  return `${h > 12 ? h - 12 : h}:${String(m).padStart(2, '0')} am`;
}
const inr = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: n % 1 ? 2 : 0 })}`;

function RouteMap({ progress, laps, running }: { progress: number; laps: number; running: boolean }) {
  const pathRef = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(1);
  useEffect(() => { if (pathRef.current) setLen(pathRef.current.getTotalLength()); }, []);
  const lapP = (progress * laps) % 1 || (progress >= 1 ? 1 : 0);
  const pt = pathRef.current ? pathRef.current.getPointAtLength(len * lapP) : { x: 110, y: 300 };
  const ahead = pathRef.current ? pathRef.current.getPointAtLength(Math.min(len, len * lapP + 6)) : { x: 111, y: 300 };
  const angle = Math.atan2(ahead.y - pt.y, ahead.x - pt.x);
  const walker = { x: pt.x - Math.cos(angle) * 16, y: pt.y - Math.sin(angle) * 16 };
  return (
    <svg viewBox="0 0 600 380" role="img" aria-label="Map of the community with the walk route" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="600" height="380" rx="22" fill="#9fd67f" />
      <rect x="0" y="0" width="600" height="380" rx="22" fill="url(#ws-grain)" opacity=".25" />
      <defs>
        <pattern id="ws-grain" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="4" r="1.2" fill="#5fae4a" /><circle cx="11" cy="12" r="1" fill="#5fae4a" />
        </pattern>
      </defs>
      {/* Towers */}
      {[
        { x: 22, y: 20, w: 74, h: 56, n: 'T1' }, { x: 180, y: 6, w: 80, h: 44, n: 'T2' }, { x: 300, y: 6, w: 80, h: 42, n: 'T3' },
        { x: 444, y: 4, w: 80, h: 44, n: 'T5' }, { x: 548, y: 120, w: 46, h: 96, n: 'T6' }, { x: 548, y: 250, w: 46, h: 100, n: 'T7' },
        { x: 6, y: 206, w: 58, h: 86, n: 'C' },
      ].map((t) => (
        <g key={t.n}>
          <rect x={t.x + 3} y={t.y + 4} width={t.w} height={t.h} rx="8" fill="#2e7d4f" opacity=".25" />
          <rect x={t.x} y={t.y} width={t.w} height={t.h} rx="8" fill="#f6f2ea" stroke="#e2dccf" />
          <text x={t.x + t.w / 2} y={t.y + t.h / 2 + 4} textAnchor="middle" fontSize={t.w < 60 ? 10 : 12} fontWeight="700" fill="#3f5547" fontFamily="Inter, sans-serif">
            {t.n === 'C' ? 'Tower C' : t.n.replace('T', 'Tower ')}
          </text>
        </g>
      ))}
      {/* Pool, clubhouse, play area */}
      <rect x="250" y="150" width="110" height="60" rx="14" fill="#9ed6ea" stroke="#ffffff" strokeWidth="4" />
      <rect x="380" y="150" width="70" height="50" rx="8" fill="#f3efe6" stroke="#e2dccf" />
      <text x="415" y="179" textAnchor="middle" fontSize="10" fontWeight="700" fill="#3f5547" fontFamily="Inter, sans-serif">Club</text>
      <circle cx="170" cy="190" r="26" fill="#f0b429" opacity=".35" />
      <text x="170" y="194" textAnchor="middle" fontSize="10" fontWeight="700" fill="#3f5547" fontFamily="Inter, sans-serif">Play</text>
      {/* Trees */}
      {[[90, 120], [150, 250], [240, 110], [470, 110], [470, 250], [330, 250], [210, 360], [400, 370], [60, 350], [500, 345]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x + 2} cy={y + 3} r="15" fill="#1f6b3a" opacity=".25" />
          <circle cx={x} cy={y} r="15" fill={i % 3 === 0 ? '#f29bb8' : '#3f9b4f'} />
          <circle cx={x - 4} cy={y - 4} r="5" fill="#ffffff" opacity=".2" />
        </g>
      ))}
      {/* Path */}
      <path d={TRAIL} fill="none" stroke="#efe3c6" strokeWidth="16" strokeLinecap="round" />
      <path ref={pathRef} d={TRAIL} fill="none" stroke="#e1d0a8" strokeWidth="2" strokeDasharray="3 9" />
      {/* GPS trail for this lap */}
      <path d={TRAIL} fill="none" stroke={T.marigold} strokeWidth="5" strokeLinecap="round"
        strokeDasharray={len} strokeDashoffset={len * (1 - lapP)} opacity={progress > 0 ? 0.9 : 0} />
      {/* Start pin */}
      <g transform="translate(110 300)">
        <circle r="9" fill="#ffffff" stroke={T.leaf} strokeWidth="3" />
      </g>
      {/* Walker and dog */}
      <g transform={`translate(${walker.x} ${walker.y})`}>
        <circle r="8" fill={T.leaf} stroke="#ffffff" strokeWidth="2.5" />
      </g>
      <g transform={`translate(${pt.x} ${pt.y})`}>
        {running && <circle r="20" fill={T.marigold} opacity=".18" className="pp-pulse" />}
        <circle r="13" fill={T.marigold} stroke="#ffffff" strokeWidth="3" />
        <g fill="#ffffff" transform="scale(.42) translate(-12 -12)">
          <ellipse cx="8.2" cy="7.4" rx="2.1" ry="2.9" /><ellipse cx="15.8" cy="7.4" rx="2.1" ry="2.9" />
          <ellipse cx="4.6" cy="12" rx="1.9" ry="2.5" /><ellipse cx="19.4" cy="12" rx="1.9" ry="2.5" />
          <path d="M12 11.5c-2.9 0-5.6 2.6-5.6 5.2 0 1.8 1.4 2.9 3 2.9 1 0 1.7-.4 2.6-.4s1.6.4 2.6.4c1.6 0 3-1.1 3-2.9 0-2.6-2.7-5.2-5.6-5.2z" />
        </g>
      </g>
    </svg>
  );
}

function CatRoom({ progress }: { progress: number }) {
  const stage = CAT_STEPS.filter((s) => progress >= s.at).length - 1;
  const catX = stage >= 1 && stage < 3 ? 120 : stage >= 4 && stage < 5 ? 330 : stage >= 5 ? 250 : 420;
  const food = stage >= 1 ? 1 : 0;
  return (
    <svg viewBox="0 0 600 380" role="img" aria-label="Illustration of Momo's home visit" style={{ width: '100%', height: '100%', display: 'block' }}>
      <style>{`
        .cr-cat { transition: transform 1.4s cubic-bezier(.4,.1,.2,1); }
        .cr-heart { animation: cr-heart 2.2s ease-out infinite; }
        @keyframes cr-heart { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-50px); opacity: 0; } }
        .cr-wand { transform-origin: 0 0; animation: cr-wand 1s ease-in-out infinite alternate; }
        @keyframes cr-wand { from { transform: rotate(-18deg); } to { transform: rotate(22deg); } }
        .cr-pet { animation: cr-pet 1.4s ease-in-out infinite alternate; }
        @keyframes cr-pet { from { transform: translateX(-10px); } to { transform: translateX(14px); } }
      `}</style>
      <rect width="600" height="380" rx="22" fill="#f6f1e6" />
      <rect y="270" width="600" height="110" fill="#e9dcc4" />
      <rect y="270" width="600" height="6" fill="#d9c7a6" />
      {/* Window with towers outside */}
      <rect x="360" y="40" width="200" height="150" rx="10" fill="#cdeaf5" stroke="#ffffff" strokeWidth="8" />
      <rect x="380" y="90" width="34" height="100" fill="#f6f2ea" /><rect x="424" y="70" width="40" height="120" fill="#ece6da" /><rect x="476" y="100" width="30" height="90" fill="#f6f2ea" />
      <circle cx="530" cy="70" r="14" fill="#ffe08a" />
      <rect x="456" y="40" width="8" height="150" fill="#ffffff" />
      {/* Plant + sofa */}
      <rect x="40" y="200" width="200" height="74" rx="18" fill="#9cc5a1" />
      <rect x="30" y="230" width="220" height="46" rx="16" fill="#86b48c" />
      <rect x="280" y="226" width="30" height="46" rx="6" fill="#c98b45" />
      <path d="M295 226 C 270 190 285 160 296 150 C 300 175 320 190 295 226Z" fill="#3f9b4f" />
      <path d="M295 226 C 320 196 330 176 318 160 C 306 182 292 196 295 226Z" fill="#2e7d4f" />
      {/* Bowls */}
      <g transform="translate(110 318)">
        <ellipse cx="0" cy="0" rx="26" ry="9" fill="#c7ced2" />
        <ellipse cx="0" cy="-3" rx="22" ry="6" fill={food ? '#a0612f' : '#e3e7e9'} />
        <ellipse cx="62" cy="0" rx="22" ry="8" fill="#c7ced2" />
        <ellipse cx="62" cy="-3" rx="18" ry="5" fill={stage >= 2 ? '#9ed6ea' : '#e3e7e9'} />
      </g>
      {/* Litter box */}
      <g transform="translate(480 300)">
        <rect x="-44" y="-12" width="88" height="30" rx="8" fill="#7cc35a" />
        <rect x="-38" y="-14" width="76" height="8" rx="4" fill={stage >= 3 ? '#f3ead8' : '#d8c8a8'} />
      </g>
      {/* Cat */}
      <g className="cr-cat" style={{ transform: `translate(${catX}px, 292px)` }}>
        <path d="M30 -6 Q50 -20 44 -40" stroke="#9aa3ab" strokeWidth="8" strokeLinecap="round" fill="none" />
        <ellipse cx="0" cy="-10" rx="34" ry="20" fill="#b8c0c7" />
        <ellipse cx="-4" cy="-4" rx="20" ry="12" fill="#eef1f3" />
        <circle cx="-30" cy="-30" r="17" fill="#b8c0c7" />
        <path d="M-44 -40 L-42 -58 L-32 -44Z M-26 -44 L-16 -58 L-16 -40Z" fill="#b8c0c7" />
        <ellipse cx="-30" cy="-24" rx="9" ry="6" fill="#eef1f3" />
        {stage >= 5
          ? <path d="M-38 -33 q3 -3 6 0 M-28 -33 q3 -3 6 0" stroke="#2a1a10" strokeWidth="2" fill="none" />
          : <><circle cx="-35" cy="-33" r="2.4" fill="#2a1a10" /><circle cx="-25" cy="-33" r="2.4" fill="#2a1a10" /></>}
        <path d="M-32 -27 h4 l-2 2.5Z" fill="#e86f7a" />
      </g>
      {/* Wand play */}
      {stage === 4 && (
        <g transform="translate(400 150)">
          <g className="cr-wand"><line x1="0" y1="0" x2="-70" y2="90" stroke="#7a5230" strokeWidth="4" /><path d="M-70 90 q-10 14 -2 26 q8 -12 2 -26" fill={T.marigold} /></g>
        </g>
      )}
      {/* Petting hand and hearts */}
      {stage >= 5 && (
        <g>
          <g transform="translate(206 238)"><g className="cr-pet">
            <path d="M-6 0 q20 -14 46 -6 q8 4 2 10 q-24 6 -44 4Z" fill="#8d5a3b" />
            <rect x="34" y="-8" width="90" height="16" rx="8" fill="#8fbf8f" />
          </g></g>
          {[0, 0.7, 1.4].map((d, i) => (
            <g key={i} transform={`translate(${196 + i * 26} 214)`}><path className="cr-heart" style={{ animationDelay: `${d}s` }}
              d="M0 4 C -6 -4 -14 2 0 12 C 14 2 6 -4 0 4Z" fill={T.marigold} /></g>
          ))}
        </g>
      )}
    </svg>
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
    setMode(m); setPhase('idle'); setProgress(0); setPay(null);
  };

  const start = () => {
    cancelAnimationFrame(raf.current);
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

  const share = useMemo(() => 'https://wa.me/?text=' + encodeURIComponent(
    'Found this for our community: ProxyPaw, verified neighbours for dog walks, cat visits and boarding. Join the waitlist so they open here: https://www.proxypaw.com',
  ), []);

  const tab = (active: boolean): CSSProperties => ({
    border: 'none', cursor: 'pointer', fontFamily: head, fontWeight: 700, fontSize: 15,
    padding: '11px 18px', borderRadius: 999, minHeight: 44,
    background: active ? T.ink : 'transparent', color: active ? '#fff' : T.sub,
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1fr)', gap: 'clamp(16px, 2vw, 24px)' }} className="pp-split">
      {/* Stage */}
      <div style={{ position: 'relative', borderRadius: 28, overflow: 'hidden', background: T.surface, border: `1px solid ${T.line}`, boxShadow: '0 30px 70px rgba(28,60,40,.14)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: `1px solid ${T.line}`, flexWrap: 'wrap' }}>
          <div role="tablist" aria-label="Choose a service" style={{ display: 'inline-flex', background: T.leafPale, borderRadius: 999, padding: 4 }}>
            <button role="tab" aria-selected={mode === 'dog'} className="pp-tab" style={tab(mode === 'dog')} onClick={() => reset('dog')}>Dog walk</button>
            <button role="tab" aria-selected={mode === 'cat'} className="pp-tab" style={tab(mode === 'cat')} onClick={() => reset('cat')}>Cat visit</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.muted, fontWeight: 600 }}>
            <span className={phase === 'running' ? 'pp-pulse' : undefined} style={{ width: 8, height: 8, borderRadius: '50%', background: phase === 'running' ? T.leafBright : T.line2 }} />
            {phase === 'running' ? 'Live' : phase === 'idle' ? 'Ready' : 'Finished'} · Prestige High Fields · demo
          </div>
        </div>
        <div style={{ aspectRatio: '600 / 380', position: 'relative' }}>
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
              <button className="pp-glass-btn pp-glass-primary" style={{ ...btnPrimary, flex: 1, justifyContent: 'center' }} onClick={start}>
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
          {shown.length === 0 && <div style={{ fontSize: 14, color: T.muted, lineHeight: 1.6 }}>Press start. Every update Priya sends lands here, the way it would in the app.</div>}
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
      {(phase === 'done' || phase === 'paid') && createPortal(
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
