/**
 * AboutUsPage, vision, founder story, and why proxypaw is deliberately small.
 *
 * The positioning here is the moat: city-wide platforms (PawSpace and the
 * like) offer nine services across five cities with contractor networks;
 * proxypaw offers two services inside the communities where both the pets and
 * the carers live. Depth over breadth, neighbours over strangers, the pet's
 * own home over any facility.
 */
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import NextStop from './NextStop';
import { Home, MapPin, Users, Fingerprint, FileSearch, MessagesSquare, GraduationCap, Eye, PawPrint } from 'lucide-react';

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
  green: '#3f6c51',
  greenPale: '#eef0e4',
  gold: '#f0b429',
  band: '#f1eadb',
  bandBorder: '#e9ddc8',
  cream2: '#fdf9f0',
  peach: '#f9e7da',
  darkSub: '#c9b799',
};
const sora = "'Fredoka', system-ui, sans-serif";
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

function PawMark({ size, radius }: { size: number; radius: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: radius, background: C.orange, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
      <PawSvg size={size * 0.5} />
    </span>
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
    Icon: Home,
    accent: C.orange,
    title: 'The safest place is their own home.',
    body: "Kennels and facilities, however good, are strange rooms full of strange smells. Many pets stop eating there. Some fall sick from stress alone. So we flipped the model: the pet stays where every corner smells like family, and a verified neighbour comes to them. Fed in their own bowl, asleep in their own spot, they simply understand: my human is busy today, and someone kind has come.",
  },
  {
    Icon: MapPin,
    accent: C.green,
    title: 'Depth in one place beats breadth everywhere.',
    body: "City-wide platforms cover five cities and nine services with contractors who may live an hour away. We cover the communities of Gachibowli and the Financial District with neighbours who live minutes away, people you share a lift with, rated by people you know. We would rather be irreplaceable in fifty communities than forgettable in five cities.",
  },
  {
    Icon: Users,
    accent: C.gold,
    title: 'A community, not a marketplace.',
    body: "proxypaw is also the place your community's pet life happens: see the pets in your towers, know which dog is friendly before you meet it in the lobby, follow where your own pet is on their walk in real time, and talk to the other owners around you. A stranger with a leash is a transaction. A neighbour with a leash is a relationship.",
  },
];

/** The vetting pipeline, modelled on what serious platforms (Rover, Wag)
 *  run, ID + face match, criminal-record screening, registry checks,
 *  translated to India: Aadhaar, police clearance, references, and our own
 *  pet-parent requirement on top. */
const VETTING = [
  {
    Icon: PawPrint,
    title: 'Pet experience, or no entry',
    body: "Our first filter isn't paperwork: it's love with mileage. Every applicant must be a pet parent or have genuinely cared for pets, and tells us their story in their own words. No pet experience, no exceptions.",
  },
  {
    Icon: Fingerprint,
    title: 'Government ID + face match',
    body: 'Aadhaar or another government ID, verified against the person in front of us, the same identity standard global platforms like Rover and Wag apply.',
  },
  {
    Icon: FileSearch,
    title: 'Background & police verification',
    body: 'A criminal-record check and police clearance certificate before a single booking, plus reference checks with people who know them.',
  },
  {
    Icon: MessagesSquare,
    title: 'A real conversation',
    body: "An in-person interview, because a form can't tell you how someone talks about animals. We can. We're pet parents too.",
  },
  {
    Icon: GraduationCap,
    title: 'Safety training, then a trial',
    body: 'Lobby leash rules, the hot-pavement test, emergency first steps, then supervised trial bookings before they ever go solo.',
  },
  {
    Icon: Eye,
    title: 'Watched on every booking, forever',
    body: 'Live GPS, photo updates, ratings from your own neighbours after every booking, and zero-tolerance removal for any mistreatment. Vetting never really ends.',
  },
];

/** The founder's cats, proxypaw's first and most demanding users. */
const EVANGELISTS = [
  {
    name: 'pablo',
    img: '/founder/pablo.jpg',
    title: 'Chief Comfort Officer',
    tagline: 'The lovable goof',
    body: "Pablo has one superpower: he knows when you've had a bad day before you've said a word. He values his personal space, does his own thing, and then, the moment you're at your lowest, he appears. He's also proxypaw's head of quality television: football matches, random videos, whatever's on, Pablo sits, watches, and judges silently.",
    facts: ['Detects a rough day from two rooms away', 'Watches football like he has money on it', 'Respects personal space. Expects the same.'],
    accent: '#e0662f',
  },
  {
    name: 'leo',
    img: '/founder/leo.jpg',
    title: 'Head of Balcony Security',
    tagline: 'The curious one',
    body: "Leo runs a strict balcony patrol: birds are monitored (never caught, the record stands at zero), insects are personally inspected, and every new smell is investigated on arrival. He is also a certified shoulder cat, he climbs up, settles in, and stays there like it's his office. Of the two, he's the clingy one, and he'd take that as a compliment.",
    facts: ['Career birds caught: 0. Enthusiasm: undented.', 'Full-time shoulder cat, no notice period', 'Inspects every insect. For science.'],
    accent: '#3f6c51',
  },
];

interface AboutUsPageProps {
  onHomeClick: () => void;
  onJoin: (source: string, intent?: 'owner' | 'walker') => void;
  onBlogClick: () => void;
}

export default function AboutUsPage({ onHomeClick, onJoin, onBlogClick }: AboutUsPageProps) {
  return (
    <div style={{ minHeight: '100vh', background: C.cream, color: C.ink, overflowX: 'clip', textTransform: 'none' }}>
      <style>{`
        @keyframes pp-fadeUp { from { opacity:0; transform:translateY(18px);} to {opacity:1;transform:translateY(0);} }
        @keyframes pp-floaty { 0%,100% { transform:translateY(0);} 50% { transform:translateY(-11px);} }
        .pp-screen { animation:.5s cubic-bezier(.16,1,.3,1) both pp-fadeUp; }
        .pp-dark-btn:hover { background:${C.orange} !important; transform:translateY(-2px); }
        .pp-cta:hover { transform:translateY(-2px); box-shadow:0 18px 38px rgba(224,102,47,.42) !important; }
        .pp-ghost:hover { border-color:${C.orange} !important; color:${C.orange} !important; }
        .pp-belief:hover { transform:translateY(-4px); box-shadow:0 18px 40px rgba(74,52,24,.10); }
        @media (max-width: 480px) {
          .pp-about-ctas { flex-direction:column; }
          .pp-about-ctas button { width:100%; }
        }
        @media (prefers-reduced-motion: reduce) { .pp-screen { animation:none !important; } }
      `}</style>

      <div className="pp-screen">
        {/* header */}
        <header style={{ ...shell, maxWidth: 1200, padding: `18px ${SIDE_PAD}`, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div onClick={onHomeClick} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
            <PawMark size={38} radius={13} />
            <span style={{ fontFamily: sora, fontWeight: 600, fontSize: 21, letterSpacing: '-0.008em' }}>proxypaw</span>
          </div>
          <button
            className="pp-dark-btn"
            onClick={() => onJoin('about-header')}
            style={{
              marginLeft: 'auto', border: 'none', background: C.ink, color: C.cream2,
              fontFamily: sora, fontWeight: 600, fontSize: 14.5, padding: '12px 22px',
              borderRadius: 999, cursor: 'pointer', transition: '.25s',
            }}
          >
            Join the waitlist
          </button>
        </header>

        {/* vision hero */}
        <section style={{ ...shell, padding: `clamp(36px, 5vw, 64px) ${SIDE_PAD} clamp(40px, 5vw, 64px)`, position: 'relative' }}>
          <span aria-hidden="true" style={{ position: 'absolute', right: '6%', top: 30, transform: 'rotate(16deg)', animation: 'pp-floaty 10s ease-in-out infinite' }}>
            <PawSvg size={28} color={C.orange} style={{ opacity: 0.1 }} />
          </span>
          <Reveal>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: C.orange, letterSpacing: '0.13em', marginBottom: 14, fontFamily: sora }}>
              OUR VISION
            </div>
            <h1 style={{ fontFamily: sora, fontWeight: 600, fontSize: 'clamp(32px, 4.6vw, 56px)', letterSpacing: '-0.012em', lineHeight: 1.08, margin: '0 0 22px', maxWidth: 820 }}>
              Every pet deserves a safe space.<br />
              <span style={{ color: C.orange }}>Ours is their own home.</span>
            </h1>
            <p style={{ fontSize: 'clamp(16.5px, 1.7vw, 19px)', lineHeight: 1.7, color: C.sub, maxWidth: 720, margin: 0, fontWeight: 400 }}>
              proxypaw exists for one moment: the moment you have to leave, and your pet has to stay.
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
                  proxypaw will stay deliberately small and deliberately deep: walks &amp; home visits, and
                  cage-free boarding in the pet's own home, inside the communities where both the pets and
                  their people live. Because the safest hands for your pet were always the ones a few
                  floors away.
                </p>
                <p style={{ margin: 0, fontFamily: sora, fontWeight: 600, color: C.cream2 }}>
                  Deekshitha<br />
                  <span style={{ fontWeight: 400, fontSize: 14, color: C.muted2 }}>Founder, proxypaw · cat mum to Pablo &amp; Leo · Gachibowli, Hyderabad</span>
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
                  From their very first days home with us: pablo holding leo, brand new to the house and already inseparable.
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
              Pablo and Leo, brothers, flatmates, and proxypaw's first users. They grew up curled in
              the same cage, still groom each other daily, and take turns keeping the founder company.
              Nothing ships until it feels right for these two.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <img
              src="/founder/pablo-leo.jpg"
              alt="Pablo and Leo together on the balcony beside their bonsai"
              style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 24, display: 'block', border: `1px solid ${C.cardBorder}`, boxShadow: '0 20px 48px rgba(74,52,24,.13)', marginBottom: 'clamp(14px, 1.8vw, 20px)' }}
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
                          <span style={{ marginTop: 5 }}><PawSvg size={11} color={cat.accent} /></span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
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
                  <span style={{ width: 40, height: 40, borderRadius: 13, background: b.accent, display: 'grid', placeItems: 'center', marginBottom: 18 }}>
                    <b.Icon size={19} color="#fff" />
                  </span>
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
                  <span style={{ width: 40, height: 40, borderRadius: 13, background: i === 0 ? C.orange : C.green, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <v.Icon size={19} color="#fff" />
                  </span>
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
                  The other half of proxypaw: our volunteers.
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


        <NextStop
          label="Want to read more? Check out our blogs"
          sub="The Paw Journal: practical care guides for flat pets"
          onClick={onBlogClick}
        />

      </div>
    </div>
  );
}
