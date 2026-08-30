/**
 * The Paw Journal, blog index + full-article reading view.
 *
 * Articles live in data/articles.ts. Selecting a card swaps the index for the
 * article inline (no router yet), and the browser back affordance is a visible
 * "all guides" link instead.
 */
import type { CSSProperties } from 'react';
import { ArrowLeft } from 'lucide-react';
import NextStop from './NextStop';
import { ARTICLES, type Article } from '../data/articles';

const C = {
  cream: '#f6f1e7',
  ink: '#2a2118',
  orange: '#e0662f',
  orangeDark: '#c24e1d',
  card: '#fffdf8',
  cardBorder: '#eee3cf',
  muted: '#8b7a63',
  muted2: '#a08e73',
  sub: '#6f5f4b',
  cream2: '#fdf9f0',
  peach: '#f9e7da',
  bandBorder: '#e9ddc8',
  band: '#f1eadb',
  green: '#3f6c51',
};

const sora = "'Fredoka', system-ui, sans-serif";
const shell: CSSProperties = { maxWidth: 1200, margin: '0 auto' };

function PawMark({ size, radius }: { size: number; radius: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: radius, background: C.orange, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="#fff">
        <ellipse cx="8.2" cy="7.4" rx="2.1" ry="2.9" />
        <ellipse cx="15.8" cy="7.4" rx="2.1" ry="2.9" />
        <ellipse cx="4.4" cy="12.2" rx="1.9" ry="2.5" />
        <ellipse cx="19.6" cy="12.2" rx="1.9" ry="2.5" />
        <path d="M12 11c3 0 5.6 2.4 5.9 5.3.2 2-1.3 3.7-3.3 3.7-1 0-1.8-.5-2.6-.5s-1.6.5-2.6.5c-2 0-3.5-1.7-3.3-3.7C6.4 13.4 9 11 12 11z" />
      </svg>
    </span>
  );
}

interface BlogPageProps {
  onHomeClick: () => void;
  onGetStarted: () => void;
  /** Article slug from the URL; undefined renders the index. */
  slug?: string;
  onOpenArticle: (slug: string) => void;
  onBackToIndex: () => void;
  onTourClick: () => void;
}

export default function BlogPage({ onHomeClick, onGetStarted, slug, onOpenArticle, onBackToIndex, onTourClick }: BlogPageProps) {
  const current = slug ? ARTICLES.find((a) => a.slug === slug) ?? null : null;

  return (
    <div style={{ minHeight: '100vh', background: C.cream, color: C.ink, overflowX: 'clip', textTransform: 'capitalize' }}>
      <style>{`
        @keyframes pp-fadeUp { from { opacity:0; transform:translateY(18px);} to {opacity:1;transform:translateY(0);} }
        .pp-screen { animation:.5s cubic-bezier(.16,1,.3,1) both pp-fadeUp; }
        .pp-dark-btn:hover { background:${C.orange} !important; transform:translateY(-2px); }
        .pp-post:hover { transform:translateY(-4px); box-shadow:0 18px 40px rgba(74,52,24,.12); }
        .pp-post:hover .pp-read { color:${C.orange}; }
        .pp-back:hover { color:${C.orange} !important; }
        @media (prefers-reduced-motion: reduce) { .pp-screen { animation:none !important; } }
      `}</style>

      <div className="pp-screen" key={current?.slug ?? 'index'}>
        <header style={{ ...shell, padding: '22px 28px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div onClick={onHomeClick} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
            <PawMark size={38} radius={13} />
            <span style={{ fontFamily: sora, fontWeight: 600, fontSize: 21, letterSpacing: '-0.008em' }}>proxypaw</span>
          </div>
          <button
            className="pp-dark-btn"
            onClick={onGetStarted}
            style={{
              marginLeft: 'auto', border: 'none', background: C.ink, color: C.cream2,
              fontFamily: sora, fontWeight: 600, fontSize: 14.5, padding: '12px 22px',
              borderRadius: 999, cursor: 'pointer', transition: '.25s',
            }}
          >
            get started
          </button>
        </header>

        {current ? (
          <ArticleView article={current} onBack={onBackToIndex} onGetStarted={onGetStarted} />
        ) : (
          <>
            <section style={{ ...shell, padding: '30px 28px 0' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.orange, letterSpacing: '0.12em', marginBottom: 14 }}>
                THE PAW JOURNAL
              </div>
              <h1 style={{ fontFamily: sora, fontWeight: 600, fontSize: 'clamp(34px, 4.6vw, 58px)', letterSpacing: '-0.01em', lineHeight: 1.05, margin: '0 0 18px' }}>
                care guides from the pack
              </h1>
              <p style={{ fontSize: 17.5, lineHeight: 1.6, color: C.sub, maxWidth: 620, margin: '0 0 48px', fontWeight: 400, textTransform: 'none' }}>
                Short, practical reads from the proxypaw care team: grooming, feeding, safety and play, for dogs and cats alike.
              </p>
            </section>

            <section style={{ ...shell, padding: '0 28px 96px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 24 }}>
                {ARTICLES.map((a) => (
                  <article
                    key={a.slug}
                    className="pp-post"
                    onClick={() => onOpenArticle(a.slug)}
                    style={{
                      background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 28,
                      overflow: 'hidden', cursor: 'pointer', transition: '.3s',
                      display: 'flex', flexDirection: 'column',
                    }}
                  >
                    <div style={{ width: '100%', height: 200, backgroundImage: `url("${a.img}")`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
                    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ display: 'inline-flex', alignSelf: 'flex-start', background: C.peach, color: C.orangeDark, fontSize: 11.5, fontWeight: 600, padding: '5px 12px', borderRadius: 999, letterSpacing: '0.05em', marginBottom: 14 }}>
                        {a.tag}
                      </div>
                      <div style={{ fontFamily: sora, fontWeight: 600, fontSize: 19, lineHeight: 1.3, marginBottom: 10 }}>{a.title}</div>
                      <div style={{ fontSize: 14.5, color: C.muted, lineHeight: 1.55, textTransform: 'none', marginBottom: 18 }}>{a.dek}</div>
                      <div className="pp-read" style={{ marginTop: 'auto', fontSize: 13.5, color: C.muted2, transition: 'color .25s' }}>
                        {a.read} &middot; read &rarr;
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <NextStop
              label="Done reading? See the app itself"
              sub="A walk through every screen before you join"
              onClick={onTourClick}
            />
          </>
        )}


      </div>
    </div>
  );
}

function ArticleView({ article, onBack, onGetStarted }: { article: Article; onBack: () => void; onGetStarted: () => void }) {
  return (
    <article style={{ maxWidth: 760, margin: '0 auto', padding: '24px 28px 96px', textTransform: 'none' }}>
      <button
        onClick={onBack}
        className="pp-back"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7, border: 'none', background: 'transparent',
          fontFamily: sora, fontWeight: 600, fontSize: 14, color: C.muted, cursor: 'pointer',
          padding: 0, marginBottom: 30, transition: 'color .2s',
        }}
      >
        <ArrowLeft size={16} /> all guides
      </button>

      <div style={{ display: 'inline-flex', background: C.peach, color: C.orangeDark, fontSize: 12, fontWeight: 600, padding: '5px 13px', borderRadius: 999, letterSpacing: '0.05em', marginBottom: 18, textTransform: 'capitalize' }}>
        {article.tag}
      </div>
      <h1 style={{ fontFamily: sora, fontWeight: 600, fontSize: 'clamp(30px, 4vw, 46px)', letterSpacing: '-0.01em', lineHeight: 1.12, margin: '0 0 14px', textTransform: 'capitalize' }}>
        {article.title}
      </h1>
      <div style={{ fontSize: 14, color: C.muted2, marginBottom: 30 }}>
        {article.read} · the paw journal
      </div>

      <img
        src={article.img}
        alt=""
        style={{ width: '100%', height: 'min(420px, 46vw)', objectFit: 'cover', borderRadius: 24, marginBottom: 38, boxShadow: '0 20px 50px rgba(74,52,24,.14)' }}
      />

      {article.body.map((b, i) => {
        if (b.type === 'h') {
          return (
            <h2 key={i} style={{ fontFamily: sora, fontWeight: 600, fontSize: 23, letterSpacing: '-0.008em', margin: '38px 0 14px', lineHeight: 1.25 }}>
              {b.text}
            </h2>
          );
        }
        if (b.type === 'list') {
          return (
            <ul key={i} style={{ margin: '0 0 20px', paddingLeft: 24 }}>
              {b.items!.map((it, j) => (
                <li key={j} style={{ fontSize: 16.5, lineHeight: 1.7, color: C.sub, marginBottom: 9 }}>{it}</li>
              ))}
            </ul>
          );
        }
        if (b.type === 'tip') {
          return (
            <aside
              key={i}
              style={{
                background: C.card, border: `1px solid ${C.cardBorder}`, borderLeft: `4px solid ${C.orange}`,
                borderRadius: 18, padding: '20px 24px', margin: '34px 0 8px',
                fontSize: 15.5, lineHeight: 1.65, color: C.sub,
              }}
            >
              <span style={{ fontFamily: sora, fontWeight: 600, color: C.ink, display: 'block', marginBottom: 6 }}>
                🐾 On Proxypaw
              </span>
              {b.text}
            </aside>
          );
        }
        return (
          <p key={i} style={{ fontSize: 16.5, lineHeight: 1.75, color: C.sub, margin: '0 0 20px' }}>{b.text}</p>
        );
      })}

      <div style={{ marginTop: 48, paddingTop: 34, borderTop: `1px solid ${C.bandBorder}`, textAlign: 'center' }}>
        <p style={{ fontFamily: sora, fontWeight: 600, fontSize: 19, margin: '0 0 16px', color: C.ink }}>
          Ready when your pets are.
        </p>
        <button
          onClick={onGetStarted}
          style={{
            border: 'none', background: C.orange, color: '#fff', fontFamily: sora,
            fontWeight: 600, fontSize: 15.5, padding: '15px 32px', borderRadius: 999,
            cursor: 'pointer', boxShadow: '0 12px 28px rgba(224,102,47,.3)',
          }}
        >
          Join the waitlist
        </button>
      </div>
    </article>
  );
}
