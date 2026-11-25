/**
 * Hero illustration: a Hyderabad gated community coming to life.
 * Towers rise from the ground one by one, the last one is still being built
 * (the crane keeps working), trees sway, a neighbour walks a golden retriever
 * along the lawn path and a cat flicks its tail on a balcony.
 * Pure SVG + CSS; everything rests under prefers-reduced-motion.
 */
const TOWERS = [
  { x: 40, w: 74, h: 250, d: 0 },
  { x: 128, w: 86, h: 318, d: 0.15 },
  { x: 232, w: 70, h: 214, d: 0.3 },
  { x: 318, w: 92, h: 346, d: 0.45 },
  { x: 428, w: 76, h: 268, d: 0.6 },
];
const GROUND = 392;

function Tower({ x, w, h, d, i }: { x: number; w: number; h: number; d: number; i: number }) {
  const floors = Math.floor((h - 18) / 16);
  const cols = Math.max(3, Math.floor(w / 18));
  const shade = Math.round(w * 0.26);
  return (
    <g className="pp-rise" style={{ animationDelay: `${0.25 + d}s` }}>
      <rect x={x} y={GROUND - h} width={w} height={h} rx="3" fill="#f6f2ea" />
      <rect x={x + w - shade} y={GROUND - h} width={shade} height={h} fill="#e2dccf" />
      <rect x={x - 3} y={GROUND - h - 8} width={w + 6} height="10" rx="2" fill="#e9e3d6" />
      {Array.from({ length: floors }).map((_, f) => (
        <g key={f}>
          <rect x={x + 4} y={GROUND - h + 16 + f * 16 + 9} width={w - 8} height="2" fill="#d6dfd3" opacity=".9" />
          {Array.from({ length: cols }).map((__, c) => {
            const lit = (f * 7 + c * 3 + i * 5) % 11 === 0;
                        return (
              <g key={c}>
                <rect
                  x={x + 6 + c * ((w - 12) / cols)} y={GROUND - h + 16 + f * 16}
                  width={(w - 12) / cols - 4} height="8" rx="1.5"
                  fill={lit ? '#ffd978' : '#bfe0ec'} opacity={lit ? 1 : 0.85}
                  className={lit ? 'pp-twinkle' : undefined}
                  style={lit ? { animationDelay: `${(f + c) % 5}s` } : undefined}
                />
                
              </g>
            );
          })}
        </g>
      ))}
    </g>
  );
}

function Tree({ x, s = 1, d = 0, tone = 0 }: { x: number; s?: number; d?: number; tone?: number }) {
  const greens = [['#6db27a', '#4f9566'], ['#8cc788', '#6db27a'], ['#5aa377', '#417f5a']][tone];
  return (
    <g transform={`translate(${x} ${GROUND + 34}) scale(${s})`}>
      <g className="pp-sway" style={{ animationDelay: `${d}s` }}>
        <rect x="-4" y="-46" width="8" height="48" rx="3" fill="#7a5230" />
        <circle cx="0" cy="-62" r="30" fill={greens[1]} />
        <circle cx="-17" cy="-52" r="20" fill={greens[0]} />
        <circle cx="16" cy="-56" r="22" fill={greens[0]} />
        <circle cx="4" cy="-78" r="18" fill={greens[0]} />
        <circle cx="-8" cy="-70" r="6" fill="#ffffff" opacity=".18" />
      </g>
    </g>
  );
}

function FlowerTree({ x, d = 0 }: { x: number; d?: number }) {
  return (
    <g transform={`translate(${x} ${GROUND + 30})`}>
      <g className="pp-sway" style={{ animationDelay: `${d}s` }}>
        <rect x="-3" y="-40" width="6" height="42" rx="3" fill="#7a5230" />
        <circle cx="0" cy="-54" r="24" fill="#f29bb8" />
        <circle cx="-14" cy="-46" r="15" fill="#f6b3c8" />
        <circle cx="14" cy="-48" r="16" fill="#ec86a8" />
      </g>
    </g>
  );
}

export default function CommunityScene() {
  return (
    <svg className="pp-scene" viewBox="0 0 560 500" role="img" aria-label="Illustration of a gated community: towers rising, trees, and a neighbour walking a dog on the lawn" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="cs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bfe3f2" />
          <stop offset=".75" stopColor="#e6f4f2" />
          <stop offset="1" stopColor="#f4f8ef" />
        </linearGradient>
        <linearGradient id="cs-lawn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b4dc9c" />
          <stop offset="1" stopColor="#8cc67a" />
        </linearGradient>
        <radialGradient id="cs-sun" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fff2b8" />
          <stop offset=".45" stopColor="#ffd978" stopOpacity=".9" />
          <stop offset="1" stopColor="#ffd978" stopOpacity="0" />
        </radialGradient>
        <clipPath id="cs-clip"><rect width="560" height="500" rx="28" /></clipPath>
      </defs>
      <style>{`
        .pp-scene .pp-rise { transform-box: fill-box; transform-origin: 50% 100%; transform: scaleY(0); animation: cs-rise 1.4s cubic-bezier(.2,.8,.2,1) forwards; }
        @keyframes cs-rise { to { transform: scaleY(1); } }
        .pp-scene .pp-build { transform-box: fill-box; transform-origin: 50% 100%; animation: cs-build 9s steps(6) 2s infinite; }
        @keyframes cs-build { 0% { transform: scaleY(.35); } 85% { transform: scaleY(1); } 100% { transform: scaleY(1); } }
        .pp-scene .pp-sway { transform-origin: 0 0; animation: cs-sway 5.5s ease-in-out infinite alternate; }
        @keyframes cs-sway { from { transform: rotate(-1.6deg); } to { transform: rotate(1.8deg); } }
        .pp-scene .pp-crane { transform-box: fill-box; transform-origin: 0% 50%; animation: cs-crane 7s ease-in-out infinite alternate; }
        @keyframes cs-crane { from { transform: rotate(-4deg); } to { transform: rotate(5deg); } }
        .pp-scene .pp-hook { animation: cs-hook 3.5s ease-in-out infinite alternate; }
        @keyframes cs-hook { from { transform: translateY(0); } to { transform: translateY(26px); } }
        .pp-scene .pp-walk { animation: cs-walk 22s linear infinite; }
        @keyframes cs-walk { from { transform: translateX(-90px); } to { transform: translateX(640px); } }
        .pp-scene .pp-bob { animation: cs-bob .5s ease-in-out infinite alternate; }
        @keyframes cs-bob { from { transform: translateY(0); } to { transform: translateY(-2px); } }
        .pp-scene .pp-leg-a { transform-box: fill-box; transform-origin: 50% 0; animation: cs-leg .5s ease-in-out infinite alternate; }
        .pp-scene .pp-leg-b { transform-box: fill-box; transform-origin: 50% 0; animation: cs-leg .5s ease-in-out infinite alternate-reverse; }
        @keyframes cs-leg { from { transform: rotate(-22deg); } to { transform: rotate(22deg); } }
        .pp-scene .pp-tail { transform-box: fill-box; transform-origin: 0% 100%; animation: cs-tail .6s ease-in-out infinite alternate; }
        @keyframes cs-tail { from { transform: rotate(-12deg); } to { transform: rotate(18deg); } }
        .pp-scene .pp-cattail { transform-box: fill-box; transform-origin: 50% 0%; animation: cs-cattail 2.4s ease-in-out infinite alternate; }
        @keyframes cs-cattail { from { transform: rotate(-14deg); } to { transform: rotate(14deg); } }
        .pp-scene .pp-cloud { animation: cs-cloud 60s linear infinite; }
        @keyframes cs-cloud { from { transform: translateX(-160px); } to { transform: translateX(620px); } }
        .pp-scene .pp-bird { animation: cs-bird 16s linear infinite; }
        @keyframes cs-bird { from { transform: translate(-40px, 0); } to { transform: translate(600px, -40px); } }
        .pp-scene .pp-twinkle { animation: cs-twinkle 4s ease-in-out infinite; }
        @keyframes cs-twinkle { 0%,100% { opacity: 1; } 50% { opacity: .55; } }
        .pp-scene .pp-spray { animation: cs-spray 1.6s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 100%; }
        @keyframes cs-spray { 0%,100% { opacity: .25; transform: scale(.8); } 50% { opacity: .75; transform: scale(1.05); } }
      `}</style>
      <g clipPath="url(#cs-clip)">
        <rect width="560" height="500" fill="url(#cs-sky)" />
        <circle cx="468" cy="92" r="70" fill="url(#cs-sun)" />
        <circle cx="468" cy="92" r="24" fill="#ffe08a" />
        <g className="pp-cloud" opacity=".9">
          <ellipse cx="80" cy="70" rx="40" ry="12" fill="#ffffff" />
          <ellipse cx="104" cy="62" rx="24" ry="12" fill="#ffffff" />
        </g>
        <g className="pp-cloud" style={{ animationDelay: '-30s' }} opacity=".75">
          <ellipse cx="60" cy="130" rx="34" ry="9" fill="#ffffff" />
        </g>
        <g className="pp-bird" fill="none" stroke="#3f5547" strokeWidth="1.6" strokeLinecap="round">
          <path d="M20 150q5-5 10 0q5-5 10 0" />
          <path d="M44 140q4-4 8 0q4-4 8 0" />
        </g>
        {/* Deccan rocks on the horizon */}
        <path d="M0 340 Q40 300 80 318 Q120 290 170 312 Q230 286 290 316 Q350 292 410 314 Q470 296 520 318 L560 312 L560 400 L0 400Z" fill="#cfe2c4" />
        <ellipse cx="200" cy="318" rx="22" ry="12" fill="#bcd3b0" />
        <ellipse cx="420" cy="312" rx="18" ry="10" fill="#bcd3b0" />

        {TOWERS.map((t, i) => <Tower key={i} {...t} i={i} />)}

        {/* The tower still being built, with its crane */}
        <g>
          <g className="pp-build">
            <rect x="490" y={GROUND - 230} width="58" height="230" fill="#d9d4c8" />
            {Array.from({ length: 13 }).map((_, f) => (
              <rect key={f} x="490" y={GROUND - 230 + f * 17} width="58" height="3" fill="#bdb6a6" />
            ))}
            <rect x="490" y={GROUND - 230} width="58" height="64" fill="#49a85a" opacity=".55" />
          </g>
          <rect x="534" y="70" width="6" height={GROUND - 70} fill="#f0b429" />
          <g className="pp-crane">
            <path d="M537 72 L420 72 L420 78 L537 78Z" fill="#f0b429" />
            <path d="M537 72 L560 72 L560 80 L537 80Z" fill="#c98f12" />
            <g className="pp-hook">
              <line x1="452" y1="78" x2="452" y2="140" stroke="#3f5547" strokeWidth="1.4" />
              <rect x="444" y="140" width="16" height="10" rx="2" fill="#7a5230" />
            </g>
          </g>
        </g>

        {/* Lawn */}
        <rect x="0" y={GROUND} width="560" height={500 - GROUND} fill="url(#cs-lawn)" />
        <path d={`M0 ${GROUND + 8} Q140 ${GROUND - 2} 280 ${GROUND + 6} T560 ${GROUND + 4} L560 ${GROUND + 14} L0 ${GROUND + 16}Z`} fill="#2e8b57" opacity=".2" />
        {/* Hedge along the podium */}
        <rect x="0" y={GROUND - 6} width="560" height="12" rx="6" fill="#5c9f72" />

        {/* Sprinkler */}
        <g transform="translate(470 470)">
          <path className="pp-spray" d="M0 0 Q-16 -26 -30 -10 M0 0 Q0 -30 0 -34 M0 0 Q16 -26 30 -10" stroke="#9ed6ea" strokeWidth="2" fill="none" strokeLinecap="round" />
          <rect x="-2" y="-2" width="4" height="6" fill="#3f5547" />
        </g>

        <Tree x={28} s={1.05} d={0} />
        <FlowerTree x={120} d={0.8} />
        <Tree x={214} s={0.9} d={1.4} tone={1} />
        <Tree x={392} s={1.1} d={0.4} tone={2} />
        <FlowerTree x={520} d={1.1} />

        {/* Path (pavers) */}
        <path d="M-10 452 Q140 432 280 446 T570 440 L570 470 Q420 462 280 474 T-10 482Z" fill="#e7d6b4" />
        <path d="M-10 452 Q140 432 280 446 T570 440" fill="none" stroke="#d2bd92" strokeWidth="2" strokeDasharray="2 10" />

        {/* Bench with two neighbours chatting */}
        <g transform="translate(300 420)">
          <rect x="-26" y="0" width="52" height="5" rx="2" fill="#7a5230" />
          <rect x="-22" y="5" width="3" height="10" fill="#5b3a22" /><rect x="19" y="5" width="3" height="10" fill="#5b3a22" />
          <circle cx="-12" cy="-18" r="6" fill="#8d5a3b" /><rect x="-18" y="-12" width="12" height="13" rx="4" fill="#4b8bbf" />
          <circle cx="10" cy="-18" r="6" fill="#6b4630" /><rect x="4" y="-12" width="12" height="13" rx="4" fill="#e0662f" />
          <path d="M-10 -28 q-4 -4 -2 -8" stroke="#ffffff" strokeWidth="1.2" fill="none" opacity=".8" />
        </g>

        {/* Neighbour walking a golden retriever, looping along the path */}
        <g className="pp-walk">
          <g transform="translate(0 404)">
            <g className="pp-bob">
              {/* walker */}
              <g transform="translate(18 0)">
                <rect className="pp-leg-a" x="-5" y="34" width="5" height="22" rx="2.5" fill="#2f4a6b" />
                <rect className="pp-leg-b" x="1" y="34" width="5" height="22" rx="2.5" fill="#2f4a6b" />
                <path d="M-10 6 Q0 0 10 6 L12 38 L-12 38Z" fill="#8fbf8f" />
                <circle cx="0" cy="-6" r="9" fill="#8d5a3b" />
                <path d="M-9 -9 Q0 -20 9 -9 Q9 -13 4 -15 Q-2 -17 -9 -9Z" fill="#1d1712" />
                <circle cx="-7" cy="-12" r="4" fill="#1d1712" />
                <rect x="8" y="12" width="4" height="18" rx="2" fill="#8d5a3b" transform="rotate(-30 10 12)" />
              </g>
              {/* leash */}
              <path d="M36 28 Q50 34 60 36" stroke="#e0662f" strokeWidth="1.8" fill="none" />
              {/* dog */}
              <g transform="translate(60 28)">
                <rect className="pp-leg-a" x="4" y="14" width="5" height="14" rx="2.5" fill="#d9a35b" />
                <rect className="pp-leg-b" x="10" y="14" width="5" height="14" rx="2.5" fill="#c9914a" />
                <rect className="pp-leg-b" x="26" y="14" width="5" height="14" rx="2.5" fill="#d9a35b" />
                <rect className="pp-leg-a" x="32" y="14" width="5" height="14" rx="2.5" fill="#c9914a" />
                <path className="pp-tail" d="M2 6 Q-8 0 -12 -8" stroke="#d9a35b" strokeWidth="5" strokeLinecap="round" fill="none" />
                <ellipse cx="20" cy="10" rx="20" ry="9" fill="#e3b46a" />
                <circle cx="42" cy="2" r="9" fill="#e3b46a" />
                <ellipse cx="50" cy="5" rx="6" ry="4.5" fill="#edc88a" />
                <circle cx="55" cy="4" r="2" fill="#2a1a10" />
                <path d="M37 -2 Q34 6 38 12" fill="#c9914a" />
                <circle cx="44" cy="-1" r="1.6" fill="#2a1a10" />
                <rect x="36" y="7" width="8" height="2.4" rx="1.2" fill="#e0662f" />
              </g>
            </g>
          </g>
        </g>

        {/* Cat on a balcony, tail flicking */}
        <g transform="translate(340 172)">
          <rect x="-6" y="18" width="40" height="3" fill="#ffffff" opacity=".9" />
          <path className="pp-cattail" d="M22 16 Q30 26 26 36" stroke="#f29b4b" strokeWidth="3.4" strokeLinecap="round" fill="none" />
          <ellipse cx="14" cy="12" rx="10" ry="7" fill="#f4a55a" />
          <circle cx="6" cy="4" r="6" fill="#f4a55a" />
          <path d="M1 1 L2 -6 L6 -1Z M7 -1 L10 -6 L11 1Z" fill="#f4a55a" />
          <circle cx="4" cy="4" r=".9" fill="#2a1a10" /><circle cx="8" cy="4" r=".9" fill="#2a1a10" />
        </g>
      </g>
    </svg>
  );
}
