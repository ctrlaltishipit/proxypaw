/**
 * NextStop — a small, playful "keep going" card at the end of each page,
 * just above the main footer. One per page, pointing to the next stop on
 * the reading journey: home -> tour -> about -> blog.
 */
import { BrandIcon } from './BrandLogo';

const C = {
  card: '#fffdf8', border: '#eee3cf', ink: '#2a2118',
  orange: '#e0662f', muted: '#8b7a63', muted2: '#a08e73',
};
const heading = "'Fredoka', system-ui, sans-serif";

export default function NextStop({ eyebrow = 'NEXT STOP', label, sub, onClick }: {
  eyebrow?: string;
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '0 18px clamp(40px, 5vw, 64px)', textTransform: 'none', position: 'relative', zIndex: 1 }}>
      <style>{`
        .pp-nextstop { transition: transform .25s, box-shadow .25s; }
        .pp-nextstop:hover { transform: translateY(-3px); box-shadow: 0 14px 32px rgba(74,52,24,.12); }
        .pp-nextstop:hover .pp-nextstop-paw { transform: rotate(12deg) scale(1.1); }
        .pp-nextstop:hover .pp-nextstop-arrow { transform: translateX(4px); }
        .pp-nextstop-paw, .pp-nextstop-arrow { transition: transform .25s; }
      `}</style>
      <button
        className="pp-nextstop"
        onClick={onClick}
        style={{
          display: 'flex', alignItems: 'center', gap: 14, background: C.card,
          border: `1px solid ${C.border}`, borderRadius: 18, padding: '14px 22px',
          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', maxWidth: 420,
        }}
      >
        <BrandIcon size={36} alt="" className="pp-nextstop-paw" />
        <span>
          <span style={{ display: 'block', fontFamily: heading, fontWeight: 600, fontSize: 10.5, letterSpacing: '0.12em', color: C.muted2, marginBottom: 2 }}>{eyebrow}</span>
          <span style={{ display: 'block', fontFamily: heading, fontWeight: 600, fontSize: 15.5, color: C.ink }}>{label}</span>
          <span style={{ display: 'block', fontSize: 12.5, color: C.muted, marginTop: 1 }}>{sub}</span>
        </span>
        <span className="pp-nextstop-arrow" style={{ marginLeft: 6, color: C.orange, fontFamily: heading, fontWeight: 600, fontSize: 18 }}>&rarr;</span>
      </button>
    </div>
  );
}
