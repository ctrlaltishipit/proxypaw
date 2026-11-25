/**
 * The walk: the landing page as a small game (see DESIGN.md, "The walk").
 *
 * A glass bar pinned to the bottom of the page carries a charcoal jogging track
 * with white stripes, the same track that runs through the 3D community. As the
 * visitor scrolls, Biscuit (the dog) and Lily (the cat) walk to the right along
 * it, chasing a marigold ProxyPaw ball, from one stop to the next (one stop per
 * chapter of the page). The stop number follows them both ways: walking back from
 * stop 4 shows stop 3 again, walking on shows stop 5. There are no pop-up cards
 * along the way (she found them unnecessary: the stops explain themselves); only
 * the last stop shows one card, with a close button. The bar tucks itself away
 * whenever it would cover something that has its own controls at the bottom
 * (anything marked data-trail-avoid, such as the 3D community).
 *
 * Positions are written straight to the DOM from one rAF-throttled scroll
 * handler, so scrolling never re-renders React. Only "which stop" is state.
 */
import { useEffect, useRef, useState } from 'react';
import { T, head, body } from './ui';

export interface TrailStop {
  /** id of the section that starts this stop */
  id: string;
  /** short label under the track */
  label: string;
  /** chapter name used in cards and kickers */
  name: string;
  /** the one thing this chapter teaches */
  line: string;
}

export const STOPS: TrailStop[] = [
  { id: 'why', label: 'Why', name: 'Why ProxyPaw exists', line: 'It began with a pet parent who could not leave her two cats with a stranger.' },
  { id: 'community', label: 'Community', name: 'Life in your community', line: 'Care comes from verified neighbours who live inside your own gated community.' },
  { id: 'how', label: 'How', name: 'How it works', line: 'Meet at your door, book in 30 seconds, then watch it live.' },
  { id: 'world', label: '3D visit', name: 'Step inside', line: 'Watch a dog walk and a cat visit in a ten-tower community, then take the leash.' },
  { id: 'walk', label: 'The app', name: 'The parent’s side', line: 'Live GPS, photo updates and a receipt, for every walk and visit.' },
  { id: 'services', label: 'Prices', name: 'Services and prices', line: 'Walks from ₹149, cat visits from ₹129, and 70% goes to your neighbour.' },
  { id: 'perks', label: 'Perks', name: 'Join early', line: 'The first 1,000 pet parents get a free onboarding session and ₹100 off.' },
  { id: 'close', label: 'Home', name: 'Home', line: 'That is ProxyPaw: neighbours you know, caring for the pets you love.' },
];

/** "Stop 3 of 8", used by section kickers so the page and the bar speak the same language. */
export const stopLabel = (id: string) => {
  const i = STOPS.findIndex((s) => s.id === id);
  return i < 0 ? '' : `Stop ${i + 1} of ${STOPS.length}`;
};

const PAD_L = 74; // room for the pack to stand at the start line
const PAD_R = 40; // room for the ball past the last stop

/* ------------------------------- avatars ------------------------------- */

function Dog() {
  return (
    <svg viewBox="0 0 75 60" width="50" height="40" aria-hidden="true" focusable="false">
      <path className="tl" d="M15 30 Q5 24 8 12" stroke="#d9a05b" strokeWidth="5.5" strokeLinecap="round" fill="none" />
      <g className="lg lg-b"><rect x="22" y="36" width="7" height="21" rx="3.5" fill="#bd8442" /></g>
      <g className="lg lg-a"><rect x="46" y="36" width="7" height="21" rx="3.5" fill="#bd8442" /></g>
      <g className="bd">
        <rect x="11" y="22" width="45" height="22" rx="11" fill="#d9a05b" />
        <ellipse cx="50" cy="37" rx="7" ry="6" fill="#f1d6a6" />
        <rect x="39" y="21.5" width="5.5" height="23" rx="2.7" fill="#e0662f" />
        <rect x="29" y="21" width="13" height="3.6" rx="1.8" fill="#e0662f" />
        <path d="M49 28 L55 12 L65 27Z" fill="#d9a05b" />
        <circle cx="59" cy="17" r="10.5" fill="#d9a05b" />
        <rect x="61" y="16" width="13" height="10" rx="5" fill="#f1d6a6" />
        <circle cx="72.5" cy="18.6" r="2.3" fill="#2a1a10" />
        <circle cx="62" cy="14" r="1.7" fill="#2a1a10" /><circle cx="62.6" cy="13.4" r=".55" fill="#fff" />
        <path d="M54 8 Q46 10 48 24 Q55 24 56.5 13Z" fill="#b97c3d" />
        <path className="tg" d="M65 25.5h4.4v4a2.2 2.2 0 0 1-4.4 0z" fill="#f2777a" />
      </g>
      <g className="lg lg-a"><rect x="16" y="36" width="7.5" height="21.5" rx="3.7" fill="#d9a05b" /><rect x="16" y="52" width="7.5" height="5.5" rx="2.7" fill="#f1d6a6" /></g>
      <g className="lg lg-b"><rect x="41" y="36" width="7.5" height="21.5" rx="3.7" fill="#d9a05b" /><rect x="41" y="52" width="7.5" height="5.5" rx="2.7" fill="#f1d6a6" /></g>
    </svg>
  );
}

function Cat() {
  return (
    <svg viewBox="0 0 66 50" width="40" height="30" aria-hidden="true" focusable="false">
      <path className="tl" d="M11 26 Q2 20 6 8 Q8 3 12 6" stroke="#e8954a" strokeWidth="4.6" strokeLinecap="round" fill="none" />
      <g className="lg lg-b"><rect x="17" y="31" width="5" height="16" rx="2.5" fill="#cf7f38" /></g>
      <g className="lg lg-a"><rect x="38" y="31" width="5" height="16" rx="2.5" fill="#cf7f38" /></g>
      <g className="bd">
        <rect x="8" y="19" width="38" height="17" rx="8.5" fill="#e8954a" />
        <path d="M18 19.6v5.4M24.5 19.2v6M31 19.6v5.4" stroke="#cf7f38" strokeWidth="2.2" strokeLinecap="round" />
        <ellipse cx="40" cy="31" rx="6" ry="4.6" fill="#f8e2c8" />
        <path d="M42 13 L43.5 3 L50 9Z" fill="#e8954a" /><path d="M50 9 L56.5 3 L57.5 13Z" fill="#e8954a" />
        <path d="M44 11 L44.6 6 L48 9.4Z" fill="#f7b7a3" /><path d="M52 9.4 L55.4 6 L56 11Z" fill="#f7b7a3" />
        <circle cx="50" cy="17" r="9.5" fill="#e8954a" />
        <ellipse cx="54" cy="20.5" rx="5" ry="3.8" fill="#f8e2c8" />
        <path d="M57.2 18.6h2.6l-1.3 1.7z" fill="#e86f7a" />
        <ellipse cx="51.5" cy="15.2" rx="1.5" ry="2.1" fill="#2a1a10" /><circle cx="52" cy="14.5" r=".5" fill="#fff" />
        <path d="M56 21.5l8-1.5M56 23l8 1" stroke="#b9692a" strokeWidth=".9" strokeLinecap="round" />
      </g>
      <g className="lg lg-a"><rect x="12.5" y="31" width="5.4" height="16.5" rx="2.7" fill="#e8954a" /><rect x="12.5" y="43.5" width="5.4" height="4" rx="2" fill="#f8e2c8" /></g>
      <g className="lg lg-b"><rect x="34" y="31" width="5.4" height="16.5" rx="2.7" fill="#e8954a" /><rect x="34" y="43.5" width="5.4" height="4" rx="2" fill="#f8e2c8" /></g>
    </svg>
  );
}

/** The ProxyPaw paw, as a ball the dog chases. */
function Ball() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <defs><linearGradient id="trb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f59a5c" /><stop offset="1" stopColor="#dc5f29" /></linearGradient></defs>
      <circle cx="12" cy="12" r="11" fill="url(#trb)" />
      <g fill="#fff">
        <ellipse cx="7.2" cy="10.4" rx="1.7" ry="2.2" transform="rotate(-20 7.2 10.4)" />
        <ellipse cx="10.4" cy="7.6" rx="1.8" ry="2.3" />
        <ellipse cx="13.9" cy="7.6" rx="1.8" ry="2.3" />
        <ellipse cx="17" cy="10.4" rx="1.7" ry="2.2" transform="rotate(20 17 10.4)" />
        <path d="M12 11.4c3 0 5.2 1.9 5.2 4.2 0 2-1.5 2.8-3.1 2.5-.8-.1-1.4-.4-2.1-.4s-1.3.3-2.1.4c-1.6.3-3.1-.5-3.1-2.5 0-2.3 2.2-4.2 5.2-4.2z" />
      </g>
    </svg>
  );
}

/* --------------------------------- styles --------------------------------- */

const GLASS = 'linear-gradient(180deg, rgba(255,255,255,.86), rgba(255,255,255,.66))';
const CSS = `
.tr { position: fixed; left: 0; right: 0; bottom: 0; z-index: 55; pointer-events: none; font-family: ${body}; }
.tr-in { position: relative; width: min(1100px, calc(100vw - 24px)); margin: 0 auto; padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px)); }
.tr-bar { pointer-events: auto; display: flex; align-items: stretch; gap: 14px; height: 76px; padding: 0 12px 0 20px; border-radius: 26px;
  background: ${GLASS}; border: 1px solid rgba(255,255,255,.9);
  box-shadow: inset 0 1px 0 #fff, 0 1px 0 rgba(46,125,79,.14), 0 18px 44px rgba(20,48,31,.16);
  -webkit-backdrop-filter: blur(18px) saturate(1.6); backdrop-filter: blur(18px) saturate(1.6);
  transform: translateY(0); opacity: 1; transition: transform .6s cubic-bezier(.2,.8,.2,1), opacity .4s ease; }
.tr[data-hide="1"] .tr-bar, .tr[data-ready="0"] .tr-bar { transform: translateY(calc(100% + 40px)); opacity: 0; pointer-events: none; }
.tr-meta { display: flex; flex-direction: column; justify-content: center; min-width: 96px; }
.tr-eyebrow { font-size: 10.5px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: ${T.leaf}; }
.tr-count { font-family: ${head}; font-weight: 800; font-size: 16px; letter-spacing: -.02em; color: ${T.ink}; white-space: nowrap; margin-top: 2px; }
.tr-count b { color: ${T.marigoldDark}; font-weight: 800; display: inline-block; }
.tr-count b.pop { animation: tr-pop .6s cubic-bezier(.34,1.56,.64,1); }
.tr-track { position: relative; flex: 1; min-width: 0; }
.tr-road { position: absolute; left: 0; right: 0; bottom: 24px; height: 16px; border-radius: 8px; overflow: hidden;
  background:
    linear-gradient(rgba(255,255,255,.92), rgba(255,255,255,.92)) 0 2px / 100% 1.5px no-repeat,
    linear-gradient(rgba(255,255,255,.92), rgba(255,255,255,.92)) 0 calc(100% - 2px) / 100% 1.5px no-repeat,
    repeating-linear-gradient(90deg, rgba(255,255,255,.85) 0 9px, transparent 9px 20px) 0 50% / 100% 1.5px no-repeat,
    #30353a;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,.25), 0 2px 5px rgba(20,48,31,.18); }
.tr-fill { position: absolute; left: 0; top: 50%; height: 3px; margin-top: -1.5px; width: 0; border-radius: 2px; background: linear-gradient(90deg, ${T.sun}, ${T.marigold}); transition: width .2s linear; }
.tr-start { position: absolute; left: ${PAD_L - 40}px; bottom: 24px; width: 5px; height: 16px;
  background: repeating-linear-gradient(0deg, #fff 0 4px, #30353a 4px 8px); opacity: .9; }
.tr-stop { position: absolute; bottom: 0; width: 44px; height: 54px; margin-left: -22px; padding: 0; border: none; background: none; cursor: pointer; font-family: inherit; }
.tr-dot { position: absolute; left: 50%; bottom: 26px; width: 12px; height: 12px; margin-left: -6px; border-radius: 50%; box-sizing: border-box;
  background: #30353a; border: 2px solid rgba(255,255,255,.95); transition: background .3s, transform .45s cubic-bezier(.34,1.56,.64,1), box-shadow .3s; }
.tr-stop[data-state="in"] .tr-dot { background: ${T.sun}; }
.tr-stop[data-state="now"] .tr-dot { background: ${T.marigold}; transform: scale(1.35); box-shadow: 0 0 0 5px rgba(224,102,47,.2); }
.tr-stop:hover .tr-dot { transform: scale(1.4); }
.tr-label { position: absolute; left: 50%; bottom: 5px; transform: translateX(-50%); font-size: 11px; font-weight: 600; color: ${T.muted2}; white-space: nowrap; transition: color .3s; }
.tr-stop[data-state="in"] .tr-label { color: ${T.sub}; }
.tr-stop[data-state="now"] .tr-label { color: ${T.marigoldDark}; font-weight: 700; }
.tr-stop:focus-visible { outline: 2px solid ${T.leaf}; outline-offset: -4px; border-radius: 12px; }
.tr-pack { position: absolute; left: 0; bottom: 0; width: 0; height: 100%; transition: transform .2s linear; will-change: transform; pointer-events: none; }
.tr-dog, .tr-cat, .tr-ballw { position: absolute; line-height: 0; }
.tr-dog { left: -26px; bottom: 29px; }
.tr-cat { left: -66px; bottom: 29px; }
.tr-ballw { left: 30px; bottom: 29px; filter: drop-shadow(0 2px 2px rgba(20,48,31,.3)); }
.tr-ballw { transition: left .45s cubic-bezier(.34,1.56,.64,1); }
.tr[data-dir="l"] .tr-ballw { left: -94px; }
.tr-ball { display: block; line-height: 0; transition: transform .2s linear; }
.tr-dog svg, .tr-cat svg { transition: transform .25s ease; filter: drop-shadow(0 2px 2px rgba(20,48,31,.22)); overflow: visible; }
.tr[data-dir="l"] .tr-dog svg, .tr[data-dir="l"] .tr-cat svg { transform: scaleX(-1); }
.tr .lg { transform-box: fill-box; transform-origin: 50% 8%; }
.tr .tl { transform-box: fill-box; transform-origin: 95% 95%; animation: tr-wag .9s ease-in-out infinite alternate; }
.tr .tg { opacity: 0; transition: opacity .2s; }
.tr[data-moving="1"] .lg-a { animation: tr-step .4s ease-in-out infinite alternate; }
.tr[data-moving="1"] .lg-b { animation: tr-step .4s ease-in-out infinite alternate-reverse; }
.tr[data-moving="1"] .bd { animation: tr-bob .2s ease-in-out infinite alternate; }
.tr[data-moving="1"] .tl { animation-duration: .28s; }
.tr[data-moving="1"] .tg { opacity: 1; }
.tr[data-moving="1"] .tr-cat .lg-a, .tr[data-moving="1"] .tr-cat .lg-b { animation-duration: .32s; }
@keyframes tr-step { from { transform: rotate(26deg); } to { transform: rotate(-26deg); } }
@keyframes tr-bob { to { transform: translateY(-1.6px); } }
@keyframes tr-wag { from { transform: rotate(-9deg); } to { transform: rotate(12deg); } }
@keyframes tr-pop { 0% { transform: scale(1); } 40% { transform: scale(1.5); } 100% { transform: scale(1); } }
.tr-actions { display: flex; align-items: center; gap: 4px; }
.tr-next { font-size: 13.5px !important; padding: 9px 16px !important; min-height: 40px !important; }
.tr-hide { border: none; background: none; cursor: pointer; font-family: ${head}; font-weight: 600; font-size: 12.5px; color: ${T.muted}; padding: 10px 8px; border-radius: 10px; min-height: 40px; }
.tr-hide:hover { color: ${T.ink}; }
.tr-x { display: none; font-weight: 500; }
.tr-x::before { content: '\\00d7'; }
.tr-card { pointer-events: none; position: absolute; left: 50%; bottom: calc(100% + 2px); width: min(440px, calc(100vw - 28px)); box-sizing: border-box; padding: 16px 18px; border-radius: 22px;
  background: linear-gradient(180deg, rgba(255,255,255,.94), rgba(255,255,255,.82)); border: 1px solid rgba(255,255,255,.95);
  box-shadow: inset 0 1px 0 #fff, 0 22px 50px rgba(20,48,31,.2);
  -webkit-backdrop-filter: blur(18px) saturate(1.5); backdrop-filter: blur(18px) saturate(1.5);
  opacity: 0; transform: translate(-50%, 18px) scale(.94); transition: opacity .4s ease, transform .55s cubic-bezier(.34,1.56,.64,1); }
.tr-card[data-on="1"] { opacity: 1; transform: translate(-50%, 0) scale(1); pointer-events: auto; }
.tr[data-hide="1"] .tr-card { bottom: calc(14px + env(safe-area-inset-bottom, 0px)); }
.tr-close { position: absolute; top: 10px; right: 10px; border: none; background: rgba(46,125,79,.1); color: ${T.sub}; font-family: ${head}; font-weight: 700; font-size: 12.5px; padding: 7px 12px; border-radius: 999px; cursor: pointer; min-height: 32px; }
.tr-close:hover { background: rgba(46,125,79,.18); color: ${T.ink}; }
.tr-card-k { padding-right: 78px; font-size: 11px; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; color: ${T.marigoldDark}; }
.tr-card-t { font-family: ${head}; font-weight: 800; font-size: 17px; letter-spacing: -.02em; color: ${T.ink}; margin: 5px 0 4px; }
.tr-card-d { font-size: 14.5px; line-height: 1.5; color: ${T.sub}; margin: 0; }
.tr-pips { display: flex; gap: 5px; margin-top: 12px; }
.tr-pips i { flex: 1; height: 5px; border-radius: 3px; background: rgba(46,125,79,.14); transition: background .4s; }
.tr-pips i[data-on="1"] { background: ${T.marigold}; }
.tr-card-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
.tr-card-row .pp-glass-btn { font-size: 14px; padding: 10px 18px; min-height: 42px; }
.tr-tab { pointer-events: auto; position: absolute; right: 0; bottom: calc(12px + env(safe-area-inset-bottom, 0px)); border: 1px solid rgba(255,255,255,.9); background: ${GLASS}; cursor: pointer;
  font-family: ${head}; font-weight: 700; font-size: 13px; color: ${T.ink}; padding: 10px 16px; border-radius: 999px; min-height: 40px;
  box-shadow: 0 10px 26px rgba(20,48,31,.16); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px);
  opacity: 0; transform: translateY(20px); transition: opacity .3s, transform .45s cubic-bezier(.34,1.56,.64,1); visibility: hidden; }
.tr[data-min="1"] .tr-tab { opacity: 1; transform: none; visibility: visible; }
.tr button:focus-visible { outline: 2px solid ${T.leaf}; outline-offset: 2px; }
@media (min-width: 981px) {
  .tr-card { left: auto; right: 0; width: 380px; transform: translate(0, 18px) scale(.94); transform-origin: 100% 100%; }
  .tr-card[data-on="1"] { transform: none; }
}
@media (max-width: 980px) { .tr-next { display: none !important; } }
@media (max-width: 760px) {
  .tr-in { width: calc(100vw - 16px); padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px)); }
  .tr-bar { height: 58px; gap: 8px; padding: 0 6px 0 10px; border-radius: 22px; }
  .tr-meta { min-width: 0; order: 3; align-items: flex-end; padding-right: 2px; }
  .tr-eyebrow, .tr-label, .tr-hide span { display: none; }
  .tr-count { font-size: 13.5px; margin: 0; }
  .tr-count .tr-word { display: none; }
  .tr-road { bottom: 12px; height: 14px; }
  .tr-start { bottom: 12px; height: 14px; left: ${PAD_L - 44}px; }
  .tr-stop { width: 22px; margin-left: -11px; height: 44px; }
  .tr-dot { bottom: 14px; width: 10px; height: 10px; margin-left: -5px; }
  .tr-dog, .tr-cat, .tr-ballw { bottom: 16px; }
  .tr-dog svg { width: 44px; height: 35px; } .tr-cat svg { width: 35px; height: 26px; }
  .tr-dog { left: -23px; } .tr-cat { left: -58px; } .tr-ballw { left: 24px; }
  .tr[data-dir="l"] .tr-ballw { left: -80px; }
  .tr-ball svg { width: 17px; height: 17px; }
  .tr-actions { order: 4; }
  .tr-hide { padding: 8px 8px; font-size: 20px; line-height: 1; min-width: 34px; }
  .tr-x { display: inline; }
  .tr-card { padding: 14px 16px; }
  .tr-card-t { font-size: 16px; } .tr-card-d { font-size: 14px; }
}
@media (prefers-reduced-motion: reduce) {
  .tr *, .tr-bar, .tr-card { animation: none !important; transition: none !important; }
}
`;

/* -------------------------------- component -------------------------------- */

export default function Trail({ onJoin }: { onJoin: (source: string) => void }) {
  const n = STOPS.length;
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const packRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const [reached, setReached] = useState(0);   // the stop the walkers are at right now; it follows them both ways
  const prevReached = useRef(0);
  const rewarded = useRef(false);
  const [avoid, setAvoid] = useState(false);   // tucked away because it would cover a demo's own controls
  const [reward, setReward] = useState(false);
  const [quiet, setQuiet] = useState(false);   // tucked away while the visitor plays in the 3D world
  const [min, setMin] = useState(false);       // tucked away by the visitor
  const [atEnd, setAtEnd] = useState(false);
  const [ready, setReady] = useState(false);
  const quietAt = useRef<number | null>(null);

  // One scroll handler moves the walkers; React only hears about whole stops.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let raf = 0, idle = 0, lastP = -1;
    const measure = () => {
      raf = 0;
      const track = trackRef.current, pack = packRef.current;
      if (!track || !pack) return;
      const y = window.scrollY, vh = window.innerHeight;
      const line = vh * 0.62;
      // p runs from 0 (top of the page) to n: it is i + 1 when stop i's section crosses the line.
      const pts = [line, ...STOPS.map((s) => { const el = document.getElementById(s.id); return el ? el.getBoundingClientRect().top + y : Number.POSITIVE_INFINITY; })];
      const probe = y + line;
      let p = 0;
      for (let i = 0; i < n; i++) {
        const a = pts[i], b = pts[i + 1];
        if (probe >= b) { p = i + 1; continue; }
        p = i + Math.min(1, Math.max(0, (probe - a) / Math.max(1, b - a)));
        break;
      }
      const W = track.clientWidth;
      const x = PAD_L + (W - PAD_L - PAD_R) * (p / n);
      pack.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
      if (ballRef.current) ballRef.current.style.transform = `rotate(${(x * 5.7).toFixed(0)}deg)`;
      if (fillRef.current) fillRef.current.style.width = `${x.toFixed(0)}px`;
      if (lastP >= 0 && Math.abs(p - lastP) > 0.0004) {
        root.dataset.dir = p < lastP ? 'l' : 'r';
        root.dataset.moving = '1';
        window.clearTimeout(idle);
        idle = window.setTimeout(() => { root.dataset.moving = '0'; }, 170);
      }
      lastP = p;
      setReached(Math.floor(p + 0.0001));
      setAtEnd(y + vh > document.documentElement.scrollHeight - 110);
      // Anything marked data-trail-avoid that reaches into the strip where the bar sits gets the strip to itself.
      let cover = false;
      document.querySelectorAll('[data-trail-avoid]').forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < vh - 170 && r.bottom > vh - 108) cover = true; });
      setAvoid(cover);
      if (quietAt.current !== null && Math.abs(y - quietAt.current) > 160) { quietAt.current = null; setQuiet(false); }
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(measure); };
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest?.('[data-trail-quiet]')) { quietAt.current = window.scrollY; setQuiet(true); }
    };
    measure();
    const t = window.setTimeout(() => { setReady(true); kick(); }, 500);
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);
    document.addEventListener('pointerdown', onDown, { passive: true });
    // Sections load in late (images, the 3D world), so re-measure while the page settles.
    const settle = window.setInterval(kick, 1200);
    return () => {
      cancelAnimationFrame(raf); window.clearTimeout(idle); window.clearTimeout(t); window.clearInterval(settle);
      window.removeEventListener('scroll', kick); window.removeEventListener('resize', kick);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [n]);

  // The last stop shows the one card there is, once.
  useEffect(() => {
    if (reached === prevReached.current) return;
    prevReached.current = reached;
    if (reached === n && !rewarded.current) { rewarded.current = true; setReward(true); }
  }, [reached, n]);

  // The reward steps aside on its own, and never sits on top of the footer.
  useEffect(() => {
    if (!reward) return;
    if (atEnd) { setReward(false); return; }
    const t = window.setTimeout(() => setReward(false), 14000);
    return () => window.clearTimeout(t);
  }, [reward, atEnd]);

  // Let the page react too: sections the walkers have reached get data-stop="in" (the kicker pill lights up),
  // and go back to "ahead" when the walkers turn round and leave them.
  useEffect(() => {
    STOPS.forEach((s, i) => { const el = document.getElementById(s.id); if (el) el.dataset.stop = i < reached ? 'in' : 'ahead'; });
  }, [reached]);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const next = reached < n ? STOPS[reached] : null;
  const hidden = quiet || min || atEnd || avoid;

  return (
    <div ref={rootRef} className="tr" data-moving="0" data-dir="r" data-ready={ready ? '1' : '0'} data-hide={hidden ? '1' : '0'} data-min={min && !atEnd ? '1' : '0'}>
      <style>{CSS}</style>
      <div className="tr-in">
        <div className="tr-card" data-on={reward ? '1' : '0'} role="status" aria-live="polite">
          {reward && (
            <>
              <button className="tr-close" onClick={() => setReward(false)} aria-label="Close">Close</button>
              <div className="tr-card-k">Walk complete · {n} of {n} stops</div>
              <div className="tr-card-t">You walked all of ProxyPaw.</div>
              <p className="tr-card-d">Verified neighbours inside your own community, live updates on every walk and visit, and 70% of every booking to the person who cares for your pet.</p>
              <div className="tr-pips" aria-hidden="true">{STOPS.map((s) => <i key={s.id} data-on="1" />)}</div>
              <div className="tr-card-row">
                <button className="pp-glass-btn pp-glass-primary" onClick={() => { setReward(false); onJoin('walk-complete'); }}>Claim my founding spot</button>
                <button className="pp-glass-btn" onClick={() => setReward(false)}>Keep looking</button>
              </div>
            </>
          )}
        </div>

        <nav className="tr-bar" aria-label="The walk: your place on this page" aria-hidden={hidden}>
          <div className="tr-meta">
            <div className="tr-eyebrow">The walk</div>
            <div className="tr-count"><span className="tr-word">Stop </span><b key={reached} className={reached ? 'pop' : undefined}>{reached}</b> of {n}</div>
          </div>
          <div className="tr-track" ref={trackRef}>
            <div className="tr-road"><div className="tr-fill" ref={fillRef} /></div>
            <i className="tr-start" aria-hidden="true" />
            {STOPS.map((s, i) => (
              <button
                key={s.id}
                className="tr-stop"
                data-state={i === reached - 1 ? 'now' : i < reached ? 'in' : 'ahead'}
                style={{ left: `calc(${PAD_L}px + (100% - ${PAD_L + PAD_R}px) * ${(i + 1) / n})` }}
                onClick={() => go(s.id)}
                tabIndex={hidden ? -1 : 0}
                aria-label={`Stop ${i + 1} of ${n}: ${s.name}`}
                aria-current={i === reached - 1 ? 'step' : undefined}
              >
                <span className="tr-dot" /><span className="tr-label">{s.label}</span>
              </button>
            ))}
            <div className="tr-pack" ref={packRef} aria-hidden="true">
              <span className="tr-cat"><Cat /></span>
              <span className="tr-dog"><Dog /></span>
              <span className="tr-ballw"><span className="tr-ball" ref={ballRef}><Ball /></span></span>
            </div>
          </div>
          <div className="tr-actions">
            <button className="pp-glass-btn tr-next" tabIndex={hidden ? -1 : 0} onClick={() => (next ? go(next.id) : onJoin('walk-bar'))}>
              {next ? (reached === 0 ? 'Start the walk' : 'Next stop') : 'Join the waitlist'}
            </button>
            <button className="tr-hide" tabIndex={hidden ? -1 : 0} onClick={() => setMin(true)} aria-label="Hide the walk bar"><span>Hide</span><b aria-hidden="true" className="tr-x" /></button>
          </div>
        </nav>

        <button className="tr-tab" tabIndex={min && !atEnd ? 0 : -1} onClick={() => setMin(false)} aria-label="Show the walk bar">The walk · stop {reached} of {n}</button>
      </div>
    </div>
  );
}
