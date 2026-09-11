/**
 * TourPage, "Inside the app".
 *
 * Real screenshots of the built ProxyPaw app (captured from the running
 * screens, not mocked), one section per area, so someone deciding whether to
 * join the waitlist can see exactly what they're queuing for. Modelled on
 * buddyai's Tour page. Images live in public/shots/.
 */
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import {
  LayoutDashboard, Users, CalendarCheck, Wallet, ClipboardList, Cat, ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

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
  band: '#f1eadb',
  bandBorder: '#e9ddc8',
  green: '#3f6c51',
  greenPale: '#eef0e4',
  gold: '#f0b429',
};
const sora = "'Fredoka', system-ui, sans-serif";
const shell: CSSProperties = { maxWidth: 1140, margin: '0 auto' };

interface Section {
  id: string;
  eyebrow: string;
  Icon: LucideIcon;
  accent: string;
  title: string;
  body: string;
  points: string[];
  shot: string;
  alt: string;
}

const SECTIONS: Section[] = [
  {
    id: 'home',
    eyebrow: 'YOUR HOME SCREEN',
    Icon: LayoutDashboard,
    accent: '#e0662f',
    title: 'Everything about your pets, one thumb-reach away.',
    body: "Open ProxyPaw and it's all there: your pets, your next booking with live tracking one tap away, Paw Points, and the photo updates from yesterday's walk. Built for the phone in your hand, not a desk.",
    points: [
      'Switch between your pets in one tap',
      'Next booking up top, with live tracking and reschedule',
      'Paw Points balance and your latest photo updates',
    ],
    shot: '/shots/m-home.png',
    alt: 'ProxyPaw home screen with pets, next booking and Paw Points',
  },
  {
    id: 'services',
    eyebrow: 'THREE SERVICES, HONESTLY',
    Icon: CalendarCheck,
    accent: '#3f6c51',
    title: 'We only list what we actually deliver.',
    body: "Dog walking and cleaning from ₹149. Home pet boarding, day or overnight, from ₹449, in your pet's own home. Pet sitting and feeding at ₹129 a visit, litter box included, for adult dogs, puppies, cats and kittens. Missing food, medicine or equipment? Ask in the booking: if your volunteer accepts, they bring it at MRP, no markup.",
    points: [
      'Dog walking & cleaning · GPS-tracked, from ₹149',
      'Home boarding, day or overnight · cage-free, from ₹449',
      'Pet sitting, feeding & litter care · ₹129 a visit',
    ],
    shot: '/shots/m-services.png',
    alt: 'The three ProxyPaw services with prices and the MRP add-on note',
  },
  {
    id: 'pet',
    eyebrow: 'YOUR PET, PROPERLY KNOWN',
    Icon: Cat,
    accent: '#f0b429',
    title: 'Tell us once. Every volunteer knows.',
    body: "Biscuit's profile carries his birth date, his temperament, his chicken allergy and the fact that he sleeps with the hallway light on. Add care instructions in your own words, kept practical on purpose, and only your booked volunteer ever sees them.",
    points: [
      'Name and birth date, so age is always right',
      'Temperament in one tap: zoomy, shy, cuddly, chaser and more',
      'Medical notes and instructions, 200 words each, private to your volunteer',
    ],
    shot: '/shots/m-pet.png',
    alt: "Biscuit's pet profile with temperament chips and care instructions",
  },
  {
    id: 'walkers',
    eyebrow: 'NEIGHBOURS, NOT STRANGERS',
    Icon: Users,
    accent: '#e0662f',
    title: 'Your volunteers live minutes away.',
    body: 'Every volunteer is from your own community: Aadhaar-verified, background-checked and safety-trained before their first booking, rated by neighbours you share a lift with. Two minutes away, not two suburbs.',
    points: [
      'Aadhaar-checked, background-verified, community-rated',
      'Distance shown in minutes from your tower',
      'See who already walks your pet regularly',
    ],
    shot: '/shots/m-walkers.png',
    alt: 'Verified volunteer cards with ratings and distance in minutes',
  },
  {
    id: 'booking',
    eyebrow: 'BOOK IN 30 SECONDS',
    Icon: ClipboardList,
    accent: '#3f6c51',
    title: 'Pick a slot. Add a request. Done.',
    body: 'Duration, day, time, confirm. Out of poop bags or need something for the booking? Add it as a request: your volunteer brings it at MRP if they accept. Every booking earns Paw Points.',
    points: [
      'Durations from 30 minutes to 2 hours',
      'Add practical requests, brought at MRP on acceptance',
      '25 Paw Points on every booking',
    ],
    shot: '/shots/m-booking.png',
    alt: 'Booking a walk: duration, day, time and an extra request',
  },
  {
    id: 'bookings',
    eyebrow: 'EVERY BOOKING, KEPT',
    Icon: CalendarCheck,
    accent: '#f0b429',
    title: 'Your history, photos and ratings in one place.',
    body: 'Upcoming bookings up top, everything earlier below: who came, what it cost, the photos they sent and the rating you gave. Rebook any of it in one tap.',
    points: [
      'Upcoming and past bookings at a glance',
      'Photos and ratings attached to every visit',
      'One-tap rebook for the regulars',
    ],
    shot: '/shots/m-bookings.png',
    alt: 'Bookings history with photos, ratings and one-tap rebook',
  },
  {
    id: 'payment',
    eyebrow: 'PAY YOUR WAY',
    Icon: Wallet,
    accent: '#f0b429',
    title: 'Card, UPI, before or after. Your call.',
    body: 'A clean payment sheet slides up: pay now with a card or by scanning a UPI QR, or simply pay after the service with UPI or cash. Built for how Hyderabad actually pays.',
    points: [
      'Pay now: card, or scan the UPI QR in any app',
      'Pay after the service: UPI or cash',
      'Every booking insured and receipted either way',
    ],
    shot: '/shots/m-payment.png',
    alt: 'Payment sheet with card and UPI QR options, pay now or after',
  },
  {
    id: 'track',
    eyebrow: 'WATCH THE WALK LIVE',
    Icon: ShieldCheck,
    accent: '#e0662f',
    title: 'Your pet on the map, your rules followed.',
    body: 'Live GPS through your community, photo updates at the pace you asked for in your instructions, and a timeline of the whole walk: pickup, zoomies, water break, home. Promised, and delivered.',
    points: [
      'Live route through your own community',
      'Photo updates at your chosen rhythm',
      'A timeline you can check from anywhere',
    ],
    shot: '/shots/m-track.png',
    alt: 'Live walk tracking with route map, stats and update timeline',
  },
  {
    id: 'switch',
    eyebrow: 'NOT WORKING OUT? SWITCH',
    Icon: ShieldCheck,
    accent: '#3f6c51',
    title: 'Request a change, no questions asked.',
    body: 'Not happy with your volunteer? Switch! Raise a ticket right from the app and we immediately send the next best verified volunteer, with your current one continuing until they arrive, so care never pauses. Keep switching until it feels exactly right: once you are happy, the same trusted person comes for every booking after. Drama-free, always: our team talks to the volunteer, never you.',
    points: [
      'Raise a ticket in two taps, straight from the booking',
      'Replacement assigned immediately, care never pauses',
      'No questions, no awkwardness: our team talks to the volunteer, not you',
    ],
    shot: '/shots/m-switch.png',
    alt: 'Request a change screen with reasons, replacement steps and raise ticket button',
  },
  {
    id: 'community',
    eyebrow: 'EVERY TOWER, EVERY PET',
    Icon: ShieldCheck,
    accent: '#e0662f',
    title: 'Your community, tower by tower.',
    body: 'Pick your community and see the pets who live around you, which tower they are in, and the care they are looking for. Raise a request in one tap and it reaches our team instantly, with smart volunteer auto-assignment on the roadmap. Screens shown with sample data from our demo community.',
    points: [
      'Every pet listed with their tower and their needs',
      'One-tap requests that reach our team instantly',
      'Neighbour reviews build trust where you live',
    ],
    shot: '/shots/m-community.png',
    alt: 'Community screen listing pets by tower with requests and neighbour reviews',
  },
];

/** Fade-and-rise on scroll, once, honouring reduced-motion. */
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
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(26px)',
        transition: `opacity .6s cubic-bezier(.16,1,.3,1) ${delay}ms, transform .6s cubic-bezier(.16,1,.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

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

interface TourPageProps {
  onHomeClick: () => void;
  onJoin: (source: string) => void;
  onAboutClick: () => void;
}

export default function TourPage({ onHomeClick, onJoin, onAboutClick }: TourPageProps) {
  // Deck effect: as the next card slides up, the one beneath settles back
  // slightly, like cards closing into an envelope. Subtle, and disabled for
  // reduced-motion users.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const wraps = Array.from(document.querySelectorAll<HTMLElement>('.pp-stack-wrap'));
      for (let i = 0; i < wraps.length; i++) {
        const inner = wraps[i].querySelector<HTMLElement>('.pp-stack-card');
        if (!inner) continue;
        const next = wraps[i + 1];
        if (!next) { inner.style.transform = ''; inner.style.opacity = ''; continue; }
        const r = wraps[i].getBoundingClientRect();
        const n = next.getBoundingClientRect();
        const span = Math.max(r.height * 0.9, 1);
        const pRaw = (r.top + span - n.top) / span;
        const prog = Math.min(1, Math.max(0, pRaw));
        inner.style.transform = `scale(${1 - prog * 0.055}) translateY(${(-prog * 8).toFixed(1)}px)`;
        inner.style.transformOrigin = 'top center';
        inner.style.opacity = String(1 - prog * 0.12);
        inner.style.willChange = prog > 0 && prog < 1 ? 'transform' : '';
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: C.cream, color: C.ink, overflowX: 'clip', textTransform: 'none' }}>
      <style>{`
        .pp-dark-btn:hover { background:${C.orange} !important; transform:translateY(-2px); }
        .pp-cta:hover { transform:translateY(-2px); box-shadow:0 18px 38px rgba(224,102,47,.42) !important; }
        .pp-shot { transition: transform .5s cubic-bezier(.16,1,.3,1); }
        .pp-shot:hover { transform: scale(1.015) rotate(-0.3deg); }
      `}</style>

      {/* header */}

      {/* hero */}
      <section style={{ ...shell, padding: '40px 28px 30px', textAlign: 'center' }}>
        <Reveal>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.orange, letterSpacing: '0.12em', marginBottom: 14 }}>
            INSIDE THE APP
          </div>
          <h1 style={{ fontFamily: sora, fontWeight: 600, fontSize: 'clamp(34px, 4.8vw, 60px)', letterSpacing: '-0.012em', lineHeight: 1.05, margin: '0 auto 18px', maxWidth: 760 }}>
            See what you're joining.
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: C.sub, maxWidth: 560, margin: '0 auto 10px', fontWeight: 400 }}>
            ProxyPaw is a mobile app, and these are its real screens, the same on Android and iOS. Keep scrolling: each screen stacks over the last, from booking to payment to live tracking.
          </p>
        </Reveal>
      </section>

      {/* sections: sticky stacked cards — each new card slides over the last */}
      <div style={{ ...shell, padding: '10px 0 40px', position: 'relative' }}>
        {SECTIONS.map((sec, i) => {
          const tints = ['#fffdf8', '#f7f3e6', '#fdf6ec'];
          return (
            <section
              key={sec.id}
              id={sec.id}
              className="pp-stack-wrap"
              style={{ position: 'sticky', top: 'clamp(64px, 8vh, 88px)', zIndex: i + 1, padding: '0 clamp(14px, 2.5vw, 28px)', marginBottom: 'clamp(28px, 4vh, 44px)' }}
            >
              <div
                className="pp-stack-card"
                style={{
                  background: tints[i % tints.length],
                  border: `1px solid ${C.cardBorder}`,
                  borderRadius: 26,
                  boxShadow: '0 -14px 40px rgba(74,52,24,.10), 0 18px 44px rgba(74,52,24,.10)',
                  padding: 'clamp(20px, 2.8vw, 36px)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
                  gap: 'clamp(20px, 3vw, 44px)',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#f6f1e7', border: `1px solid ${C.cardBorder}`, borderRadius: 999, padding: '6px 14px 6px 7px', marginBottom: 16 }}>
                    <span style={{ width: 26, height: 26, borderRadius: 999, background: sec.accent, display: 'grid', placeItems: 'center' }}>
                      <sec.Icon size={14} color="#fff" />
                    </span>
                    <span style={{ fontFamily: sora, fontWeight: 600, fontSize: 11.5, letterSpacing: '0.1em', color: C.muted }}>
                      {sec.eyebrow}
                    </span>
                    <span style={{ fontFamily: sora, fontWeight: 600, fontSize: 11.5, color: C.muted2 }}>· {i + 1}/{SECTIONS.length}</span>
                  </div>
                  <h2 style={{ fontFamily: sora, fontWeight: 600, fontSize: 'clamp(23px, 2.6vw, 32px)', letterSpacing: '-0.01em', lineHeight: 1.15, margin: '0 0 12px' }}>
                    {sec.title}
                  </h2>
                  <p style={{ fontSize: 15.5, lineHeight: 1.65, color: C.sub, margin: '0 0 16px', fontWeight: 400 }}>
                    {sec.body}
                  </p>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {sec.points.map((pt) => (
                      <li key={pt} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.55, color: C.sub, marginBottom: 8 }}>
                        <span style={{ width: 7, height: 7, borderRadius: 999, background: sec.accent, marginTop: 7, flexShrink: 0 }} />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ borderRadius: 34, overflow: 'hidden', border: `6px solid ${C.ink}`, boxShadow: '0 22px 50px rgba(42,33,24,.22)', background: '#fffdf8', width: 'min(280px, 72vw)' }}>
                    <img
                      src={sec.shot}
                      alt={sec.alt}
                      loading="lazy"
                      style={{ display: 'block', width: '100%', aspectRatio: '390 / 844', objectFit: 'cover' }}
                    />
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* closing CTA */}
      <section style={{ ...shell, padding: '90px 28px 100px', textAlign: 'center' }}>
        <Reveal>
          <h2 style={{ fontFamily: sora, fontWeight: 600, fontSize: 'clamp(28px, 3.8vw, 48px)', letterSpacing: '-0.01em', margin: '0 0 14px' }}>
            Paws crossed, your community could be next!
          </h2>
          <p style={{ fontSize: 16.5, color: C.muted, margin: '0 auto 18px', fontWeight: 400, maxWidth: 560 }}>
            We open tower by tower, and every wagging tail brings it closer to home. Come, let's
            build this community together!
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#eef0e4', border: '1px solid #dfe4cf', color: '#3f6c51', borderRadius: 999, padding: '9px 18px', fontFamily: sora, fontWeight: 600, fontSize: 13.5, margin: '0 0 26px', maxWidth: '92%' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#3f6c51" aria-hidden="true"><ellipse cx="8.2" cy="7.4" rx="2.1" ry="2.9" /><ellipse cx="15.8" cy="7.4" rx="2.1" ry="2.9" /><ellipse cx="4.4" cy="12.2" rx="1.9" ry="2.5" /><ellipse cx="19.6" cy="12.2" rx="1.9" ry="2.5" /><path d="M12 11c3 0 5.6 2.4 5.9 5.3.2 2-1.3 3.7-3.3 3.7-1 0-1.8-.5-2.6-.5s-1.6.5-2.6.5c-2 0-3.5-1.7-3.3-3.7C6.4 13.4 9 11 12 11z" /></svg>
            <span style={{ textAlign: 'left' }}>Founding 1,000 perk: a free onboarding session for your pet, plus &#8377;100 off your first booking!</span>
          </div>
          <br />
          <button
            className="pp-cta"
            onClick={() => onJoin('tour-closing')}
            style={{
              border: 'none', background: C.orange, color: '#fff', fontFamily: sora,
              fontWeight: 600, fontSize: 16.5, padding: '18px 40px', borderRadius: 999,
              cursor: 'pointer', boxShadow: '0 14px 32px rgba(224,102,47,.32)', transition: '.25s',
            }}
          >
            Join the waitlist
          </button>
        </Reveal>
      </section>


      {/* founder teaser */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '0 18px clamp(40px, 5vw, 64px)', textTransform: 'none' }}>
        <button
          className="pp-founder-card"
          onClick={onAboutClick}
          style={{ display: 'flex', alignItems: 'stretch', gap: 0, background: C.card, border: `1px solid ${C.border}`, borderRadius: 22, padding: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', maxWidth: 560, overflow: 'hidden' }}
        >
          <img src="/founder/pablo-leo-young.jpg" alt="Pablo and Leo, the founder's Persian cats" style={{ width: 150, objectFit: 'cover', objectPosition: 'center', flexShrink: 0 }} />
          <span style={{ padding: '18px 20px', display: 'block' }}>
            <span style={{ display: 'block', fontFamily: sora, fontWeight: 600, fontSize: 10.5, letterSpacing: '0.12em', color: C.muted, marginBottom: 4 }}>NEXT STOP</span>
            <span style={{ display: 'block', fontFamily: sora, fontWeight: 600, fontSize: 17, color: C.ink, marginBottom: 5 }}>Meet the founder, and the boys!</span>
            <span style={{ display: 'block', fontSize: 13, color: C.muted, lineHeight: 1.55 }}>
              She built ProxyPaw for her own community and uses it with Pablo and Leo, her two
              Persian cats. Every volunteer is hand-verified, so your pet is always in safe hands.
              Sound like your pain point too? <span style={{ color: C.orange, fontWeight: 700 }}>Read her story &rarr;</span>
            </span>
          </span>
        </button>
      </div>
      <style>{`.pp-founder-card { transition: transform .25s, box-shadow .25s; } .pp-founder-card:hover { transform: translateY(-3px); box-shadow: 0 14px 32px rgba(74,52,24,.12); } @media (max-width: 560px) { .pp-founder-card { flex-direction: column; } .pp-founder-card img { width: 100%; height: 140px; } }`}</style>

    </div>
  );
}
