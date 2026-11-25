/**
 * AboutUsPage, vision, founder story, and why ProxyPaw is deliberately small.
 *
 * The positioning here is the moat: city-wide platforms (PawSpace and the
 * like) offer nine services across five cities with contractor networks;
 * ProxyPaw offers two services inside the communities where both the pets and
 * the carers live. Depth over breadth, neighbours over strangers, the pet's
 * own home over any facility.
 */
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import NextStop from './NextStop';

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
  green: '#2e7d4f',
  greenPale: '#e7f4e4',
  gold: '#f0b429',
  band: '#eaf3e4',
  bandBorder: '#d8e8d2',
  btnBorder: '#c9dcc4',
  cream2: '#fbfdf8',
  peach: '#f9e7da',
  darkSub: '#b9d3c0',
};
const sora = "'Plus Jakarta Sans', system-ui, sans-serif";
const shell: CSSProperties = { maxWidth: 1080, margin: '0 auto' };
const SIDE_PAD = 'clamp(18px, 3vw, 28px)';

function PawSvg({ size = 24, color = '#fff', style }: { size?: number; color?: string; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style} aria-hidden="true">
      <ellipse cx="8.2" cy="7.4" rx="2.1" ry="2.9" />
      <ellipse cx="15.8" cy="7.4" rx="2.1" ry="2.9" />
      <ellipse cx="4.4" cy="12.2" rx="1.9" ry="2.5" />
      <ellipse cx="19.6" cy="12.2" rx="1.9" ry="2.5" />
      <path d="M12 11c3 0 5.6 2.4 5.9 5.3.2 2-1.3 3.7-3.3 3.7-1 0-1.8-.5-2.6-.5s-1.6.5-2.6.5c-2 0-3.5-1.7-3.3-3.7C6.4 13.4 9 11 12 11z" />
    </svg>
  );
}

function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } },
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: shown ? 1 : 0,
      transform: shown ? 'none' : 'translateY(26px)',
      transition: `opacity .65s cubic-bezier(.16,1,.3,1) ${delay}ms, transform .65s cubic-bezier(.16,1,.3,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

const BELIEFS = [
  {
    accent: C.orange,
    title: 'The safest place is their own home.',
    body: "Kennels and facilities, however good, are strange rooms full of strange smells. Many pets stop eating there. Some fall sick from stress alone. So we flipped the model: the pet stays where every corner smells like family, and a verified neighbour comes to them. Fed in their own bowl, asleep in their own spot, they simply understand: my human is busy today, and someone kind has come.",
  },
  {
    accent: C.green,
    title: 'Depth in one place beats breadth everywhere.',
    body: "City-wide platforms cover five cities and nine services with contractors who may live an hour away. We cover the communities of Gachibowli and the Financial District with neighbours who live minutes away, people you share a lift with, rated by people you know. We would rather be irreplaceable in fifty communities than forgettable in five cities.",
  },
  {
    accent: C.gold,
    title: 'A community, not a marketplace.',
    body: "ProxyPaw is also the place your community's pet life happens: see the pets in your towers, know which dog is friendly before you meet it in the lobby, follow where your own pet is on their walk in real time, and talk to the other owners around you. A stranger with a leash is a transaction. A neighbour with a leash is a relationship.",
  },
];

/** The vetting pipeline, modelled on what serious platforms (Rover, Wag)
 *  run, ID + face match, criminal-record screening, registry checks,
 *  translated to India: Aadhaar, police clearance, references, and our own
 *  pet-parent requirement on top. */
const VETTING = [
  {
    title: 'Pet experience, or no entry',
    body: "Our first filter isn't paperwork: it's love with mileage. Every applicant must be a pet parent or have genuinely cared for pets, and tells us their story in their own words. No pet experience, no exceptions.",
  },
  {
    title: 'Government ID + face match',
    body: 'Aadhaar or another government ID, verified against the person in front of us, the same identity standard global platforms like Rover and Wag apply.',
  },
  {
    title: 'Background & police verification',
    body: 'A criminal-record check and police clearance certificate before a single booking, plus reference checks with people who know them.',
  },
  {
    title: 'A real conversation',
    body: "An in-person interview, because a form can't tell you how someone talks about animals. We can. We're pet parents too.",
  },
  {
    title: 'Safety training, then a trial',
    body: 'Lobby leash rules, the hot-pavement test, emergency first steps, then supervised trial bookings before they ever go solo.',
  },
  {
    title: 'Watched on every booking, forever',
    body: 'Live GPS, photo updates, ratings from your own neighbours after every booking, and zero-tolerance removal for any mistreatment. Vetting never really ends.',
  },
];

/** The founder's cats, ProxyPaw's first and most demanding users. */
const EVANGELISTS = [
  {
    name: 'Pablo',
    img: '/founder/pablo.jpg',
    title: 'Chief Comfort Officer',
    tagline: 'The lovable goof',
    body: "Pablo has one superpower: he knows when you've had a bad day before you've said a word. He values his personal space, does his own thing, and then, the moment you're at your lowest, he appears. He's also ProxyPaw's head of quality television: football matches, random videos, whatever's on, Pablo sits, watches, and judges silently.",
    facts: ['Detects a rough day from two rooms away', 'Watches football like he has money on it', 'Respects personal space. Expects the same.'],
    accent: '#e0662f',
  },
  {
    name: 'Leo',
    img: '/founder/leo.jpg',
    title: 'Head of Balcony Security',
    tagline: 'The curious one',
    body: "Leo runs a strict balcony patrol: birds are monitored (never caught, the record stands at zero), insects are personally inspected, and every new smell is investigated on arrival. He is also a certified shoulder cat, he climbs up, settles in, and stays there like it's his office. Of the two, he's the clingy one, and he'd take that as a compliment.",
    facts: ['Career birds caught: 0. Enthusiasm: undented.', 'Full-time shoulder cat, no notice period', 'Inspects every insect. For science.'],
    accent: '#2e7d4f',
  },
];

interface AboutUsPageProps {
  onTourClick: () => void;
  onHomeClick: () => void;
  onJoin: (source: string, intent?: 'owner' | 'walker') => void;
  onBlogClick: () => void;
}

export default function AboutUsPage({ onHomeClick, onJoin, onBlogClick, onTourClick }: AboutUsPageProps) {
  return (
    <div style={{ minHeight: '100vh', background: C.cream, color: C.ink, overflowX: 'clip', textTransform: 'none' }}>
      <style>{`
        @keyframes pp-fadeUp { from { opacity:0; transform:translateY(18px);} to {opacity:1;transform:translateY(0);} }
        @keyframes pp-floaty { 0%,100% { transform:translateY(0);} 50% { transform:translateY(-11px);} }
        .pp-screen { animation:.5s cubic-bezier(.16,1,.3,1) both pp-fadeUp; }
        .pp-dark-btn:hover { background:${C.orange} !important; transform:translateY(-2px); }
        .pp-cta:hover { transform:translateY(-2px); box-shadow:0 18px 38px rgba(224,102,47,.42) !important; }
        .pp-ghost:hover { border-color:${C.orange} !important; color:${C.orange} !important; }
        .pp-belief:hover { transform:translateY(-4px); box-shadow:0 18px 40px rgba(28,60,40,.10); }
        @media (max-width: 480px) {
          .pp-about-ctas { flex-direction:column; }
          .pp-about-ctas button { width:100%; }
        }
        @media (prefers-reduced-motion: reduce) { .pp-screen { animation:none !important; } }
      `}</style>

      <div className="pp-screen">
        {/* header */}

        {/* vision hero */}
        <section style={{ ...shell, padding: `clamp(36px, 5vw, 64px) ${SIDE_PAD} clamp(40px, 5vw, 64px)`, position: 'relative' }}>
          <Reveal>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: C.orange, letterSpacing: '0.13em', marginBottom: 14, fontFamily: sora }}>
              OUR VISION
            </div>
            <h1 style={{ fontFamily: sora, fontWeight: 600, fontSize: 'clamp(32px, 4.6vw, 56px)', letterSpacing: '-0.012em', lineHeight: 1.08, margin: '0 0 22px', maxWidth: 820 }}>
              Every pet deserves a safe space.<br />
              <span style={{ color: C.orange }}>Ours is their own home.</span>
            </h1>
            <p style={{ fontSize: 'clamp(16.5px, 1.7vw, 19px)', lineHeight: 1.7, color: C.sub, maxWidth: 720, margin: 0, fontWeight: 400 }}>
              ProxyPaw exists for one moment: the moment you have to leave, and your pet has to stay.
              We believe that moment should never mean a cage, a strange facility, or a stranger.
              It should mean a verified neighbour walking through a familiar door, so your pet
              feels what we want every pet to feel: <em>my human is busy today, and someone kind has come.</em>
            </p>
          </Reveal>
        </section>

        {/* founder story */}
        <section style={{ background: C.ink, color: C.cream2 }}>
          <div style={{ ...shell, padding: `clamp(44px, 6vw, 80px) ${SIDE_PAD}` }}>
            <Reveal>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: C.gold, letterSpacing: '0.13em', marginBottom: 14, fontFamily: sora }}>
                WHY WE BUILT THIS
              </div>
              <h2 style={{ fontFamily: sora, fontWeight: 600, fontSize: 'clamp(26px, 3.2vw, 40px)', letterSpacing: '-0.01em', lineHeight: 1.12, margin: '0 0 26px', maxWidth: 680 }}>
                A note from the founder
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <div style={{ maxWidth: 720, fontSize: 'clamp(16px, 1.6vw, 17.5px)', lineHeight: 1.8, color: C.darkSub, fontWeight: 400 }}>
                <p style={{ margin: '0 0 18px' }}>
                  My first pet found me. A street dog outside the Balaji temple, my parents named him
                  Balaji after it; I laughed and called him Baloo, and Baloo stuck. He was with us for six
                  years before his health gave out, and losing him taught me something I've carried since:
                  <em style={{ color: C.cream2 }}> what comes to you from nature, without you searching for it,
                  one day goes back to nature.</em> I told myself I wouldn't get another pet. Then my dad
                  surprised me with Coco, a Shih Tzu with a heart bigger than her whole body. When I moved
                  away to study, she went back to grow up alongside her sisters and brothers, and today
                  she's a mother of two. I'm so happy for her.
                </p>
                <p style={{ margin: '0 0 18px' }}>
                  Now there's Pablo and Leo, two Persian cats who've been with me since they were 45 days
                  old. They grew up in the same cage, bonded so tightly I couldn't bear to separate them,
                  so I brought both home. Best decision I ever made: when I'm out, they have each other to
                  play with, argue with, and nap against. And every night, one sleeps on my head and the
                  other curls up near my heart. That kind of unconditional trust takes a pet time to give
                  you, and once you've felt it, you understand what's really being handed over when an
                  owner gives someone their keys.
                </p>
                <p style={{ margin: '0 0 18px' }}>
                  Whenever I had to leave the city, I was lucky, my parents live here and could come care
                  for the boys. But I kept thinking about everyone who doesn't have that. There was no
                  service I would have trusted with Pablo and Leo. So I built the one I'd trust: a small
                  set of people who handle pets with empathy and genuine affection, pet parents
                  themselves, every one of them, verified, trained, and minutes from your door.
                </p>
                <p style={{ margin: '0 0 18px' }}>
                  ProxyPaw will stay deliberately small and deliberately deep: walks &amp; home visits, and
                  cage-free boarding in the pet's own home, inside the communities where both the pets and
                  their people live. Because the safest hands for your pet were always the ones a few
                  floors away.
                </p>
                <p style={{ margin: 0, fontFamily: sora, fontWeight: 600, color: C.cream2 }}>
                  Deekshitha<br />
                  <span style={{ fontWeight: 400, fontSize: 14, color: C.muted2 }}>Founder, ProxyPaw · cat mum to Pablo &amp; Leo · Gachibowli, Hyderabad</span>
                </p>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <figure style={{ margin: '36px 0 0', maxWidth: 400 }}>
                <img
                  src="/founder/pablo-leo-young.jpg"
                  alt="Pablo and Leo as kittens, cuddled together"
                  style={{ width: '100%', borderRadius: 22, display: 'block', border: '1px solid rgba(253,249,240,.14)' }}
                />
                <figcaption style={{ fontSize: 13, color: C.muted2, marginTop: 10, lineHeight: 1.5 }}>
                  From their very first days home with us: Pablo holding Leo, brand new to the house and already inseparable.
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </section>

        {/* the evangelists */}
        <section style={{ ...shell, padding: `clamp(44px, 6vw, 80px) ${SIDE_PAD} 0` }}>
          <Reveal>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: C.orange, letterSpacing: '0.13em', marginBottom: 14, fontFamily: sora }}>
              THE PROXYPAW EVANGELISTS
            </div>
            <h2 style={{ fontFamily: sora, fontWeight: 600, fontSize: 'clamp(26px, 3.2vw, 40px)', letterSpacing: '-0.01em', lineHeight: 1.12, margin: '0 0 14px' }}>
              Meet the boys who approve every feature.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: C.sub, maxWidth: 640, margin: '0 0 clamp(18px, 2.4vw, 28px)', fontWeight: 400 }}>
              Pablo and Leo, brothers, flatmates, and ProxyPaw's first users. They grew up curled in
              the same cage, still groom each other daily, and take turns keeping the founder company.
              Nothing ships until it feels right for these two.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <img
              src="/founder/pablo-leo.jpg"
              alt="Pablo and Leo together on the balcony beside their bonsai"
              style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 24, border: `1px solid ${C.cardBorder}`, boxShadow: '0 20px 48px rgba(28,60,40,.13)', marginBottom: 'clamp(14px, 1.8vw, 20px)' }}
            />
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'clamp(14px, 1.8vw, 20px)' }}>
            {EVANGELISTS.map((cat, i) => (
              <Reveal key={cat.name} delay={i * 120}>
                <article className="pp-belief" style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 26, overflow: 'hidden', height: '100%', boxSizing: 'border-box', transition: '.3s' }}>
                  <img
                    src={cat.img}
                    alt={`${cat.name} the Persian cat`}
                    style={{ width: '100%', aspectRatio: '1 / 1', height: 'auto', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
                  />
                  <div style={{ padding: 'clamp(20px, 2.4vw, 26px)' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontFamily: sora, fontWeight: 600, fontSize: 22, letterSpacing: '-0.008em', color: C.ink }}>{cat.name}</span>
                      <span style={{ fontFamily: sora, fontWeight: 600, fontSize: 12.5, color: cat.accent, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{cat.title}</span>
                    </div>
                    <div style={{ fontSize: 13, color: C.muted2, marginBottom: 12, fontStyle: 'italic' }}>{cat.tagline}</div>
                    <p style={{ fontSize: 14.5, lineHeight: 1.65, color: C.sub, margin: '0 0 16px', fontWeight: 400 }}>{cat.body}</p>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                      {cat.facts.map((f) => (
                        <li key={f} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 13.5, lineHeight: 1.5, color: C.muted, marginBottom: 7 }}>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <div style={{ marginTop: 'clamp(14px, 1.8vw, 20px)', background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 26, padding: 'clamp(22px, 3vw, 34px)' }}>
              <p style={{ fontSize: 'clamp(15.5px, 1.6vw, 17px)', lineHeight: 1.8, color: C.sub, margin: '0 0 12px', fontWeight: 400 }}>
                I got two of them so they would always have each other for company. But even with a
                brother around, someone still has to feed them on time, clean the litter, refill the
                water bowl, brush out the knots, and give them the human touch they quietly wait for
                all day. We have a hundred ways to entertain ourselves: for our pets, we are the
                entertainment. We are their whole Netflix.
              </p>
              <p style={{ fontSize: 'clamp(15.5px, 1.6vw, 17px)', lineHeight: 1.8, color: C.sub, margin: '0 0 16px', fontWeight: 400 }}>
                The real joy, for mine, is when they climb up, cuddle in and fall asleep, completely
                safe. And now, every single time I open the front door, both of them are standing
                right there waiting. It is the first time I have ever seen cats do that. If you have
                a story like this, we would love to hear it when you join.
              </p>
              <button
                className="pp-ghost"
                onClick={onTourClick}
                style={{
                  border: `1.5px solid ${C.btnBorder}`, background: C.card, color: C.ink,
                  fontFamily: sora, fontWeight: 600, fontSize: 13.5, padding: '10px 20px',
                  borderRadius: 999, cursor: 'pointer', transition: '.25s',
                }}
              >
                See how the app works
              </button>
            </div>
          </Reveal>
        </section>

        {/* what we believe */}
        <section style={{ ...shell, padding: `clamp(44px, 6vw, 80px) ${SIDE_PAD} 0` }}>
          <Reveal>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: C.orange, letterSpacing: '0.13em', marginBottom: 14, fontFamily: sora }}>
              WHAT WE BELIEVE
            </div>
            <h2 style={{ fontFamily: sora, fontWeight: 600, fontSize: 'clamp(26px, 3.2vw, 40px)', letterSpacing: '-0.01em', lineHeight: 1.12, margin: '0 0 clamp(26px, 3.4vw, 40px)' }}>
              Less, done properly.
            </h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 'clamp(14px, 1.8vw, 20px)' }}>
            {BELIEFS.map((b, i) => (
              <Reveal key={b.title} delay={i * 100}>
                <div className="pp-belief" style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 20, padding: 'clamp(18px, 2.2vw, 26px)', height: '100%', boxSizing: 'border-box', transition: '.3s' }}>
                  <div style={{ fontFamily: sora, fontWeight: 600, fontSize: 18.5, lineHeight: 1.3, marginBottom: 10 }}>{b.title}</div>
                  <div style={{ fontSize: 15, lineHeight: 1.65, color: C.sub, fontWeight: 400 }}>{b.body}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* how we vet, BGV */}
        <section style={{ ...shell, padding: `clamp(44px, 6vw, 80px) ${SIDE_PAD} 0` }}>
          <Reveal>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: C.orange, letterSpacing: '0.13em', marginBottom: 14, fontFamily: sora }}>
              BACKGROUND VERIFICATION
            </div>
            <h2 style={{ fontFamily: sora, fontWeight: 600, fontSize: 'clamp(26px, 3.2vw, 40px)', letterSpacing: '-0.01em', lineHeight: 1.12, margin: '0 0 16px', maxWidth: 640 }}>
              Six gates before anyone holds a leash.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: C.sub, maxWidth: 680, margin: '0 0 clamp(26px, 3.4vw, 40px)', fontWeight: 400 }}>
              Pets can't tell you how they were treated. If something goes wrong, they carry it
              silently, and the trauma lives on long after. If everything goes right, they greet you
              at the door happier than you left them. That asymmetry is why our vetting is stricter
              than it "needs" to be: we verify like the pet's silence depends on us, because it does.
            </p>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 'clamp(14px, 1.8vw, 20px)' }}>
            {VETTING.map((v, i) => (
              <Reveal key={v.title} delay={i * 80}>
                <div className="pp-belief" style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 18, padding: 'clamp(16px, 2vw, 22px)', height: '100%', boxSizing: 'border-box', transition: '.3s', display: 'flex', gap: 16 }}>
                  <div>
                    <div style={{ fontFamily: sora, fontWeight: 600, fontSize: 16, lineHeight: 1.3, marginBottom: 7 }}>
                      <span style={{ color: C.muted2, fontSize: 12.5, fontWeight: 600, marginRight: 7 }}>0{i + 1}</span>
                      {v.title}
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.6, color: C.sub, fontWeight: 400 }}>{v.body}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* volunteers */}
        <section style={{ ...shell, padding: `clamp(44px, 6vw, 80px) ${SIDE_PAD}` }}>
          <Reveal>
            <div style={{ background: C.greenPale, border: `1px solid ${C.bandBorder}`, borderRadius: 28, padding: 'clamp(26px, 3.6vw, 44px)', display: 'flex', gap: 'clamp(20px, 3vw, 40px)', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 380px' }}>
                <h2 style={{ fontFamily: sora, fontWeight: 600, fontSize: 'clamp(22px, 2.6vw, 30px)', letterSpacing: '-0.01em', margin: '0 0 12px' }}>
                  The other half of ProxyPaw: our volunteers.
                </h2>
                <p style={{ fontSize: 15.5, lineHeight: 1.7, color: C.sub, margin: '0 0 8px', fontWeight: 400 }}>
                  Every walk and every visit happens because a neighbour raised their hand. Volunteers
                  register, verify their ID, complete our safety training, and then earn 70% of every
                  booking doing something they already love, minutes from their own front door.
                </p>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: C.muted2, margin: 0 }}>
                  If you're the person whose day gets better when a dog walks into the lift, we're looking for you.
                </p>
              </div>
              <div className="pp-about-ctas" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  className="pp-cta"
                  onClick={() => onJoin('about-register-volunteer', 'walker')}
                  style={{
                    border: 'none', background: C.orange, color: '#fff', fontFamily: sora,
                    fontWeight: 600, fontSize: 15.5, padding: '16px 30px', borderRadius: 999,
                    cursor: 'pointer', boxShadow: '0 12px 28px rgba(224,102,47,.3)', transition: '.25s',
                  }}
                >
                  Register as a volunteer
                </button>
                <button
                  className="pp-ghost"
                  onClick={() => onJoin('about-join-owner')}
                  style={{
                    border: `1.5px solid ${C.btnBorder}`, background: C.card, color: C.ink,
                    fontFamily: sora, fontWeight: 600, fontSize: 15.5, padding: '16px 30px',
                    borderRadius: 999, cursor: 'pointer', transition: '.25s',
                  }}
                >
                  Join as a pet parent
                </button>
              </div>
            </div>
          </Reveal>
        </section>


        {/* the evidence */}
        <section style={{ ...shell, padding: `clamp(44px, 6vw, 80px) ${SIDE_PAD} 0` }}>
          <Reveal>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: C.orange, letterSpacing: '0.13em', marginBottom: 14, fontFamily: sora }}>
              THE EVIDENCE
            </div>
            <h2 style={{ fontFamily: sora, fontWeight: 600, fontSize: 'clamp(26px, 3.2vw, 40px)', letterSpacing: '-0.01em', lineHeight: 1.12, margin: '0 0 14px', maxWidth: 680 }}>
              We did not guess at this problem. We read it, in our neighbours' own words.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: C.sub, maxWidth: 680, margin: '0 0 clamp(18px, 2.4vw, 28px)', fontWeight: 400 }}>
              Before a single line of ProxyPaw was built, we spoke with pet parents in our own
              community and read what Hyderabad's pet parents post publicly. The same two things
              come up again and again: nobody to trust, and nowhere to turn. A few of those posts,
              quoted word for word:
            </p>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'clamp(14px, 1.8vw, 20px)' }}>
            {[
              {
                q: 'When I went for a surprise pickup in the evening, she was in a cage. It didn\u2019t feel like a boarding center. It felt like a warehouse.',
                who: 'u/Advanced_Alarm_937 · r/hyderabad, Mar 2026',
                url: 'https://www.reddit.com/r/hyderabad/comments/1s1g9j9/i_regret_leaving_my_puppy_in_boarding/',
              },
              {
                q: 'Walkers here in hyd ask for around 12k per month only to walk him for 20 mins a day... We have tried asking our maids, drivers, and even watchmen.',
                who: 'u/Onthe_otherside · r/IndianPets, Jan 2026',
                url: 'https://www.reddit.com/r/IndianPets/comments/1qrri6d/how_do_i_convince_my_family_to_not_put_our_dog_in/',
              },
              {
                q: 'As a pet parent for the past 16 years. We couldn\u2019t do boarding and won\u2019t, saw those kennels and everything... We all don\u2019t go out together.',
                who: 'u/pat12186 · r/hyderabad, Mar 2026',
                url: 'https://www.reddit.com/r/hyderabad/comments/1s1g9j9/i_regret_leaving_my_puppy_in_boarding/',
              },
              {
                q: 'Are there any leads on pet sitters in and around Kondapur? I have cats and would prefer someone coming to the house twice a day rather than boarding which always stresses them out.',
                who: 'u/Usual_Outcome8281 · r/hyderabad, Jun 2026',
                url: 'https://www.reddit.com/r/hyderabad/comments/1tzgw5v/pet_sitter_wanted/',
              },
              {
                q: 'Does anyone know of any trusted place in Hyderabad that can take care of cats?? Please share your experience if you have used their services.',
                who: 'u/doveNglock · r/hyderabad, Aug 2023',
                url: 'https://www.reddit.com/r/hyderabad/comments/15ru3ox/pet_boarding_for_cats/',
              },
              {
                q: 'I\u2019ve tried looking for a mobile app to help with this, but haven\u2019t had much luck so far.',
                who: 'u/Alphalegion379 · r/IndianPets, Aug 2024',
                url: 'https://www.reddit.com/r/IndianPets/comments/1ekvo4u/traveling_with_my_labrador_bruno_need/',
              },
            ].map((e) => (
              <Reveal key={e.url + e.who}>
                <figure className="pp-belief" style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 20, padding: 'clamp(18px, 2.2vw, 24px)', height: '100%', boxSizing: 'border-box', margin: 0, display: 'flex', flexDirection: 'column', transition: '.3s' }}>
                  <blockquote style={{ margin: '0 0 14px', fontSize: 15, lineHeight: 1.65, color: C.sub, fontWeight: 400, flex: 1 }}>
                    &ldquo;{e.q}&rdquo;
                  </blockquote>
                  <figcaption style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12.5, color: C.muted2 }}>{e.who}</span>
                    <a href={e.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, fontWeight: 700, color: C.orange, textDecoration: 'none' }}>
                      Read the thread
                    </a>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
          <Reveal delay={80}>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: C.muted2, margin: '14px 0 0', maxWidth: 720 }}>
              Quotes are reproduced verbatim from public posts and are trimmed only for length.
              They belong to their authors, and each link opens the original thread.
            </p>
          </Reveal>
        </section>

        {/* platform failures + abandonment */}
        <section style={{ ...shell, padding: `clamp(34px, 4.5vw, 56px) ${SIDE_PAD} 0` }}>
          <Reveal>
            <h3 style={{ fontFamily: sora, fontWeight: 600, fontSize: 'clamp(19px, 2.2vw, 24px)', margin: '0 0 8px' }}>
              The platforms that exist have not earned the trust
            </h3>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: C.sub, maxWidth: 700, margin: '0 0 18px', fontWeight: 400 }}>
              Reviews of today's pet-care platforms, quoted verbatim from public app stores and
              Trustpilot. Each link opens the original review page.
            </p>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'clamp(14px, 1.8vw, 20px)', marginBottom: 'clamp(22px, 3vw, 32px)' }}>
            {[
              {
                q: 'They didn\u2019t send a groomer on the scheduled date. Rescheduled for the 23rd at 11am, but the groomer called asking to come earlier, then delayed multiple times to 1pm.',
                who: '1-star App Store review of a pet-care app (India)',
                url: 'https://apps.apple.com/in/app/pawspace-doorstep-pet-care/id6478494508',
              },
              {
                q: 'After 3 days of haircut I noticed a wound between the eyes and nose area... They dropped my pet 3 to 4 times.',
                who: '1-star App Store review of a pet-care app (India), Jun 2024',
                url: 'https://apps.apple.com/in/app/thepetnest/id1632865181',
              },
              {
                q: 'Petbacker does NO SCREENING AT ALL to the people who they accept to take care of your pet.',
                who: '1-star Trustpilot review, Dec 2024. 22% of the platform\u2019s reviews are 1-star.',
                url: 'https://www.trustpilot.com/review/petbacker.com?stars=1',
              },
            ].map((e) => (
              <Reveal key={e.url + e.who}>
                <figure className="pp-belief" style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 20, padding: 'clamp(18px, 2.2vw, 24px)', height: '100%', boxSizing: 'border-box', margin: 0, display: 'flex', flexDirection: 'column', transition: '.3s' }}>
                  <blockquote style={{ margin: '0 0 14px', fontSize: 15, lineHeight: 1.65, color: C.sub, fontWeight: 400, flex: 1 }}>
                    &ldquo;{e.q}&rdquo;
                  </blockquote>
                  <figcaption style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12.5, color: C.muted2 }}>{e.who}</span>
                    <a href={e.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, fontWeight: 700, color: C.orange, textDecoration: 'none' }}>
                      Source
                    </a>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div style={{ background: C.greenPale, border: `1px solid ${C.bandBorder}`, borderRadius: 24, padding: 'clamp(20px, 2.8vw, 30px)' }}>
              <h3 style={{ fontFamily: sora, fontWeight: 600, fontSize: 'clamp(18px, 2vw, 22px)', margin: '0 0 10px' }}>
                And when care fails, pets pay the price
              </h3>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 10, maxWidth: 760 }}>
                {[
                  { t: '50% of Indian pet owners have relinquished a pet, against 28% globally.', s: 'Mars State of Pet Homelessness Index', u: 'https://lifeandmore.in/pets/india-80-million-street-dogs-cats-says-mars-petcare-report/' },
                  { t: '\u201cThe maids are not coming so there\u2019s no one to walk the dog\u201d: the reasons rescuers hear when pets are surrendered.', s: 'VICE, on India\u2019s abandonment wave', u: 'https://www.vice.com/en/article/pets-abandoned-india-pandemic-animal-shelters-rescuers/' },
                  { t: 'Hyderabad rescues rose from 30\u201340 to 50\u201360 pets a month when owners\u2019 routines changed.', s: 'The News Minute', u: 'https://www.thenewsminute.com/telangana/more-pets-abandoned-hyderabad-during-lockdown-many-adopted-too-131394' },
                  { t: '32% of Indian dog owners, and 38% of cat owners, feel guilty about leaving their pets alone.', s: 'Mars Global Pet Parent Study, Dec 2024', u: 'https://www.theweek.in/wire-updates/business/2024/12/27/dcm4-mars-petcare-india.html' },
                ].map((r) => (
                  <li key={r.u} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14.5, lineHeight: 1.6, color: C.sub }}>
                    <span style={{ width: 7, height: 7, borderRadius: 999, background: C.orange, marginTop: 8, flexShrink: 0 }} />
                    <span>
                      {r.t}{' '}
                      <a href={r.u} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, color: C.muted2, textDecoration: 'underline' }}>{r.s}</a>
                    </span>
                  </li>
                ))}
              </ul>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: C.sub, margin: '14px 0 0', maxWidth: 760, fontWeight: 400 }}>
                This is the real cost of the care gap: pets lose homes because care felt impossible
                to arrange. ProxyPaw exists so that no one in our communities ever reaches that
                point, and our volunteers also coach first-time pet parents, so wanting a pet and
                being able to care for one stop being different things.
              </p>
            </div>
          </Reveal>
        </section>

        {/* the market */}
        <section style={{ ...shell, padding: `clamp(44px, 6vw, 80px) ${SIDE_PAD} 0` }}>
          <Reveal>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: C.orange, letterSpacing: '0.13em', marginBottom: 14, fontFamily: sora }}>
              THE MARKET SAYS THE SAME
            </div>
            <h2 style={{ fontFamily: sora, fontWeight: 600, fontSize: 'clamp(26px, 3.2vw, 40px)', letterSpacing: '-0.01em', lineHeight: 1.12, margin: '0 0 clamp(20px, 2.6vw, 30px)', maxWidth: 640 }}>
              The love is funded. The trust is not.
            </h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 'clamp(14px, 1.8vw, 20px)' }}>
            {[
              { n: '\u20b950,000', d: 'what the average urban pet parent already spends per pet, every year', s: 'Redseer, via Outlook Money', su: 'https://www.outlookmoney.com/spend/from-having-pets-to-becoming-paw-parents-how-indians-are-spending-more-on-pet-care' },
              { n: '$3.6B \u2192 $7B', d: 'India\u2019s pet care market, 2024 to 2028: it doubled in the last five years too', s: 'Redseer Strategy Consultants', su: 'https://redseer.com/articles/from-kibble-to-care-understanding-indias-evolving-petcare-market/' },
              { n: 'World no. 1', d: 'India is the fastest-growing pet sitting market on the planet, at 16.4% a year', s: 'Grand View Research', su: 'https://www.grandviewresearch.com/horizon/outlook/pet-sitting-market/india' },
            ].map((m) => (
              <Reveal key={m.n}>
                <div className="pp-belief" style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 20, padding: 'clamp(18px, 2.2vw, 26px)', height: '100%', boxSizing: 'border-box', transition: '.3s' }}>
                  <div style={{ fontFamily: sora, fontWeight: 600, fontSize: 'clamp(26px, 3vw, 34px)', color: C.ink, marginBottom: 8 }}>{m.n}</div>
                  <div style={{ fontSize: 14.5, lineHeight: 1.6, color: C.sub, fontWeight: 400, marginBottom: 10 }}>{m.d}</div>
                  <a href={m.su} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: C.muted2, textDecoration: 'none', borderBottom: `1px solid ${C.cardBorder}` }}>{m.s}</a>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={80}>
            <p style={{ fontSize: 14.5, lineHeight: 1.7, color: C.muted2, margin: '16px 0 0', maxWidth: 720 }}>
              Every big platform in this market sends a different stranger to every booking. Nobody
              has built the trusted, same-neighbour version: that is the gap ProxyPaw fills, one
              community at a time.
            </p>
          </Reveal>
        </section>

        {/* pilot stage, founder CTA */}
        <section style={{ ...shell, padding: `0 ${SIDE_PAD} clamp(44px, 6vw, 80px)` }}>
          <Reveal>
            <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 28, padding: 'clamp(26px, 3.6vw, 44px)' }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: C.orange, letterSpacing: '0.13em', marginBottom: 14, fontFamily: sora }}>
                WHERE WE ARE TODAY
              </div>
              <h2 style={{ fontFamily: sora, fontWeight: 600, fontSize: 'clamp(24px, 3vw, 36px)', letterSpacing: '-0.01em', lineHeight: 1.15, margin: '0 0 16px', maxWidth: 640 }}>
                We're in pilot, and building in the open.
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.75, color: C.sub, maxWidth: 720, margin: '0 0 14px', fontWeight: 400 }}>
                ProxyPaw is live as a pilot in a handful of West Hyderabad communities. Pick your
                community in the app and you can see every tower and the pets who live there, their
                names, their breeds, their little quirks. Volunteer for one and you meet the pet
                parent in person first, understand exactly what their pet needs, and only then take
                the leash. That first meeting is non-negotiable: it is how a neighbour becomes a
                trusted carer instead of a stranger.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.75, color: C.sub, maxWidth: 720, margin: '0 0 22px', fontWeight: 400 }}>
                Built out of Hyderabad, for Hyderabad first: operating here is our home advantage.
                The roadmap is bigger, though. Next come more communities across the city, then
                India's other big metros, and in time, wherever in the world busy pet parents need
                a trusted neighbour, in the countries where we are permitted to operate. We will do
                that research when the time is right: one community done properly beats ten done
                loosely.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.75, color: C.sub, maxWidth: 720, margin: '0 0 22px', fontWeight: 400 }}>
                If this idea resonates with you, as a pet parent, a volunteer, or someone who wants
                to help build it, I would love to hear from you and build this further together.
              </p>
              <a
                className="pp-cta"
                href="https://www.linkedin.com/in/deekshitha-sreerala/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block', textDecoration: 'none', border: 'none', background: C.orange,
                  color: '#fff', fontFamily: sora, fontWeight: 600, fontSize: 15.5, padding: '16px 30px',
                  borderRadius: 999, cursor: 'pointer', boxShadow: '0 12px 28px rgba(224,102,47,.3)', transition: '.25s',
                }}
              >
                Connect with me on LinkedIn
              </a>
              <span style={{ display: 'block', marginTop: 12, fontSize: 13, color: C.muted2 }}>
                Deekshitha Sreerala, founder · Gachibowli, Hyderabad
              </span>
            </div>
          </Reveal>
        </section>

        <NextStop
          label="Want to read more? Check out our blogs"
          sub="The Paw Journal: practical care guides for flat pets"
          onClick={onBlogClick}
        />

      </div>
    </div>
  );
}
