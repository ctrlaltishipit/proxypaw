/**
 * The Paw Journal, blog index + full-article reading view.
 *
 * Articles live in data/articles.ts. Selecting a card swaps the index for the
 * article inline (no router yet), and the browser back affordance is a visible
 * "all guides" link instead.
 *
 * The index is sorted newest first on each article's `date`, so the journal
 * reads as one release a month. Articles that carry `sources` list them at the
 * end of the reading view.
 */
import { useState } from 'react';
import type { CSSProperties } from 'react';
import NextStop from './NextStop';
import { ARTICLES, type Article } from '../data/articles';

const C = {
  cream: '#f4f8ef',
  ink: '#14301f',
  orange: '#e0662f',
  orangeDark: '#c24e1d',
  card: '#ffffff',
  cardBorder: '#e1ecdc',
  muted: '#5e7266',
  muted2: '#7c8f83',
  sub: '#3f5547',
  cream2: '#fbfdf8',
  peach: '#f9e7da',
  bandBorder: '#d8e8d2',
  band: '#eaf3e4',
  green: '#2e7d4f',
};

const sora = "'Plus Jakarta Sans', system-ui, sans-serif";
const shell: CSSProperties = { maxWidth: 1200, margin: '0 auto' };

/**
 * '2026-11-12' becomes '12 November 2026'. Parsed and printed in UTC so the
 * day never slips with the reader's time zone.
 */
function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
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
  const [cat, setCat] = useState('all');
  const CAT_SLUGS: Record<string, string[]> = {
    kittens: ['kitten-grooming-hygiene-guide', 'kitten-vet-checklist', 'kitten-care-first-year', 'litter-box-science', 'play-tails-wagging', 'how-bookings-stay-safe'],
    'adult cats': ['adult-cat-vet-checklist', 'adult-cat-grooming-hygiene-guide', 'adult-cat-care-guide', 'indoor-cats-bigger-life', 'litter-box-science', 'apartment-grooming-guide', 'away-for-a-month-pet-care-plan'],
    puppies: ['puppy-vet-checklist', 'puppy-grooming-hygiene-guide', 'puppy-care-first-year', 'feeding-right-portions-treats', 'play-tails-wagging', 'walking-gated-community'],
    'adult dogs': ['adult-dog-vet-checklist', 'adult-dog-grooming-routine', 'adult-dog-care-guide', 'walking-gated-community', 'apartment-grooming-guide', 'feeding-right-portions-treats', 'away-for-a-month-pet-care-plan'],
  };
  const inCategory = cat === 'all' ? ARTICLES : CAT_SLUGS[cat].map((sl) => ARTICLES.find((a) => a.slug === sl)).filter((a): a is Article => Boolean(a));
  // Newest first. ISO dates sort correctly as plain strings.
  const shown = [...inCategory].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div style={{ minHeight: '100vh', background: C.cream, color: C.ink, overflowX: 'clip' }}>
      <style>{`
        @keyframes pp-fadeUp { from { opacity:0; transform:translateY(18px);} to {opacity:1;transform:translateY(0);} }
        .pp-screen { animation:.5s cubic-bezier(.16,1,.3,1) both pp-fadeUp; }
        .pp-dark-btn:hover { background:${C.orange} !important; transform:translateY(-2px); }
        .pp-post:hover { transform:translateY(-4px); box-shadow:0 18px 40px rgba(28,60,40,.12); }
        .pp-post:hover .pp-read { color:${C.orange}; }
        .pp-back:hover { color:${C.orange} !important; }
        @media (prefers-reduced-motion: reduce) { .pp-screen { animation:none !important; } }
      `}</style>

      <div className="pp-screen" key={current?.slug ?? 'index'}>

        {current ? (
          <ArticleView article={current} onBack={onBackToIndex} onGetStarted={onGetStarted} />
        ) : (
          <>
            <section style={{ ...shell, padding: '8px 28px 0' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.orange, letterSpacing: '0.12em', marginBottom: 14 }}>
                THE PAW JOURNAL
              </div>
              <h1 style={{ fontFamily: sora, fontWeight: 600, fontSize: 'clamp(30px, 4vw, 46px)', letterSpacing: '-0.01em', lineHeight: 1.05, margin: '0 0 12px' }}>
                Care guides from the pack
              </h1>
              <p style={{ fontSize: 17.5, lineHeight: 1.6, color: C.sub, maxWidth: 620, margin: '0 0 20px', fontWeight: 400, textTransform: 'none' }}>
                Short, practical reads from the ProxyPaw care team: grooming, feeding, safety and play, for dogs and cats alike.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', margin: '0 0 26px' }}>
                {['all', 'kittens', 'adult cats', 'puppies', 'adult dogs'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setCat(c)}
                    style={{
                      border: `1.5px solid ${cat === c ? C.orange : C.cardBorder}`,
                      background: cat === c ? C.orange : C.card,
                      color: cat === c ? '#fff' : C.ink,
                      fontFamily: sora, fontWeight: 600, fontSize: 13.5,
                      padding: '9px 18px', borderRadius: 999, cursor: 'pointer',
                      transition: '.2s', textTransform: 'none',
                    }}
                  >
                    {c === 'all' ? 'All guides' : c.charAt(0).toUpperCase() + c.slice(1)}
                  </button>
                ))}
              </div>
            </section>

            <section style={{ ...shell, padding: '0 28px 40px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 24 }}>
                {shown.map((a) => (
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
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px 12px', marginBottom: 14 }}>
                        <div style={{ display: 'inline-flex', background: C.peach, color: C.orangeDark, fontSize: 11.5, fontWeight: 600, padding: '5px 12px', borderRadius: 999, letterSpacing: '0.05em' }}>
                          {a.tag.replace(/-/g, ' ')}
                        </div>
                        <time dateTime={a.date} style={{ fontSize: 12.5, color: C.muted2, textTransform: 'none', whiteSpace: 'nowrap' }}>
                          {formatDate(a.date)}
                        </time>
                      </div>
                      <div style={{ fontFamily: sora, fontWeight: 600, fontSize: 19, lineHeight: 1.3, marginBottom: 10 }}>{a.title}</div>
                      <div style={{ fontSize: 14.5, color: C.muted, lineHeight: 1.55, textTransform: 'none', marginBottom: 18 }}>{a.dek}</div>
                      <div className="pp-read" style={{ marginTop: 'auto', fontSize: 13.5, color: C.muted2, transition: 'color .25s' }}>
                        {a.read} &middot; Read
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* 24/7 emergency vets */}
            <section style={{ ...shell, padding: '0 28px 88px' }}>
              <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 24, padding: 'clamp(20px, 2.6vw, 30px)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.orange, letterSpacing: '0.1em', marginBottom: 10 }}>
                  EMERGENCY? SAVE THESE NUMBERS
                </div>
                <h2 style={{ fontFamily: sora, fontWeight: 600, fontSize: 'clamp(20px, 2.4vw, 26px)', lineHeight: 1.2, margin: '0 0 8px', textTransform: 'none' }}>
                  24/7 vet hospitals near West Hyderabad
                </h2>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: C.muted, textTransform: 'none', margin: '0 0 18px', maxWidth: 680 }}>
                  Verified against each hospital's own website, with ratings as of September 2026
                  (approximate). Hours change in this city: always call before you drive.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 14 }}>
                  {[
                    { n: 'Mr.VET Animal Hospital', a: 'Gachibowli · also Kokapet', r: '~4.6 · 1,300+ ratings', t: '24/7, on their own site', d: 'Surgery including neurosurgery, diagnostics, exotics. The closest verified round-the-clock option to the pilot communities.', ph: '+91 96767 55544' },
                    { n: 'Vetic Pet Clinic', a: 'HITEC City, opp. Cyber Towers', r: '~4.6 · 280+ ratings', t: 'Open 24 hours', d: 'Emergency, surgery, ICU and post-op monitoring, X-ray, blood work, published pricing.', ph: '+91 89290 43121' },
                    { n: 'Seven Oaks Pet Hospital', a: 'Jubilee Hills', r: '~4.5 · 300+ ratings', t: 'Open 24/7', d: 'Critical care with a CT scanner, oncology, cardiology and an ambulance. Fear Free certified.', ph: '+91 83677 00772' },
                    { n: 'MaxPetZ', a: 'Jubilee Hills', r: 'New branch, few local reviews yet', t: '24/7 emergency, on their own site', d: 'ICU, fluoroscopy, echo and imaging, spinal and ortho surgery. Established chain, new to Hyderabad.', ph: '+91 92203 09755' },
                    { n: 'Crown Vet', a: 'Gachibowli', r: '~4.9 · 240+ ratings', t: 'Daytime: 10 am to 8 pm', d: 'Not 24/7 yet, but an excellent first-choice daytime clinic minutes from Gachibowli, with an emergency helpline.', ph: '+91 80627 44111' },
                  ].map((c) => (
                    <div key={c.n} style={{ border: `1px solid ${C.cardBorder}`, borderRadius: 16, padding: '16px 18px', textTransform: 'none' }}>
                      <div style={{ fontFamily: sora, fontWeight: 600, fontSize: 16, marginBottom: 2 }}>{c.n}</div>
                      <div style={{ fontSize: 12.5, color: C.muted2, marginBottom: 8 }}>{c.a} · {c.r}</div>
                      <div style={{ display: 'inline-block', background: C.peach, color: C.orangeDark, fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 999, marginBottom: 10 }}>{c.t}</div>
                      <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.55, marginBottom: 10 }}>{c.d}</div>
                      <a href={`tel:${c.ph.replace(/ /g, '')}`} style={{ fontSize: 13.5, fontWeight: 700, color: C.orange, textDecoration: 'none' }}>{c.ph}</a>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 12.5, color: C.muted2, textTransform: 'none', margin: '14px 0 0', lineHeight: 1.6 }}>
                  ProxyPaw is not affiliated with these hospitals and earns nothing from listing
                  them. They are here because your pet's emergency should never start with a
                  Google search.
                </p>
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
          display: 'block', border: 'none', background: 'transparent',
          fontFamily: sora, fontWeight: 600, fontSize: 14, color: C.muted, cursor: 'pointer',
          padding: 0, marginBottom: 30, transition: 'color .2s', textDecoration: 'none',
        }}
      >
        Back to all guides
      </button>

      <div style={{ display: 'inline-flex', background: C.peach, color: C.orangeDark, fontSize: 12, fontWeight: 600, padding: '5px 13px', borderRadius: 999, letterSpacing: '0.05em', marginBottom: 18, textTransform: 'capitalize' }}>
        {article.tag.replace(/-/g, ' ')}
      </div>
      <h1 style={{ fontFamily: sora, fontWeight: 600, fontSize: 'clamp(30px, 4vw, 46px)', letterSpacing: '-0.01em', lineHeight: 1.12, margin: '0 0 14px', textTransform: 'capitalize' }}>
        {article.title}
      </h1>
      <div style={{ fontSize: 14, color: C.muted2, marginBottom: 30 }}>
        <time dateTime={article.date}>{formatDate(article.date)}</time> · {article.read} · The Paw Journal
      </div>

      <img
        src={article.img}
        alt=""
        style={{ width: '100%', height: 'min(420px, 46vw)', objectFit: 'cover', borderRadius: 24, marginBottom: 38, boxShadow: '0 20px 50px rgba(28,60,40,.14)' }}
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
                On ProxyPaw
              </span>
              {b.text}
            </aside>
          );
        }
        return (
          <p key={i} style={{ fontSize: 16.5, lineHeight: 1.75, color: C.sub, margin: '0 0 20px' }}>{b.text}</p>
        );
      })}

      {article.sources && article.sources.length > 0 && (
        <section style={{ marginTop: 44, paddingTop: 26, borderTop: `1px solid ${C.bandBorder}` }}>
          <h2 style={{ fontFamily: sora, fontWeight: 600, fontSize: 15, letterSpacing: '-0.004em', lineHeight: 1.3, margin: '0 0 12px', color: C.ink }}>
            Sources and further reading
          </h2>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {article.sources.map((s) => (
              <li key={s.url} style={{ fontSize: 13.5, lineHeight: 1.6, color: C.muted2, marginBottom: 6 }}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: C.green, textDecoration: 'none' }}>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: C.muted2, margin: '14px 0 0' }}>
            This guide is general information, not veterinary advice. Your vet knows your pet best.
          </p>
        </section>
      )}

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
