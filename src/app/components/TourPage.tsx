/**
 * TourPage, "Inside the app".
 *
 * Scroll-driven: the phone stays put while the text cards scroll past, and a
 * cursor on the phone clicks the button that leads to each next screen. The
 * screens are the live app components (src/mobile), in the order a real
 * booking happens. See landing/AppWalkthrough.tsx for the mechanics.
 */
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { AppScrollTour, type DemoStep } from './landing/AppWalkthrough';
import AppFilm from './landing/AppFilm';

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
  band: '#eaf3e4',
  bandBorder: '#d8e8d2',
  green: '#2e7d4f',
  greenPale: '#e7f4e4',
  gold: '#f0b429',
};
const sora = "'Plus Jakarta Sans', system-ui, sans-serif";
const shell: CSSProperties = { maxWidth: 1140, margin: '0 auto' };

interface Section {
  id: string;
  eyebrow: string;
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

// The order a real booking happens, and the button the cursor clicks to move on.
const FLOW: Array<[string, DemoStep['tap'], DemoStep['back']]> = [
  ['home', { x: 73, y: 118, label: 'open Biscuit\'s profile' }, 'nav'],
  ['pet', { x: 194, y: 826, label: 'save the profile' }, 'arrow'],
  ['services', { x: 200, y: 140, label: 'choose dog walking' }, 'arrow'],
  ['walkers', { x: 322, y: 180, label: 'book Priya' }, 'arrow'],
  ['booking', { x: 297, y: 718, label: 'confirm the slot' }, 'arrow'],
  ['payment', { x: 195, y: 792, label: 'confirm the booking' }, 'arrow'],
  ['track', { x: 211, y: 501, label: 'request a change' }, 'arrow'],
  ['switch', { x: 194, y: 638, label: 'raise the ticket' }, 'arrow'],
  ['bookings', { x: 261, y: 790, label: 'open Community' }, 'nav'],
  ['community', { x: 298, y: 211, label: 'raise a request' }, 'nav'],
];
const STEPS: DemoStep[] = FLOW.map(([id, tap, back]) => {
  const sec = SECTIONS.find((x) => x.id === id)!;
  return { screen: id, kicker: sec.eyebrow, title: sec.title, text: sec.body, points: sec.points, tap, back };
});

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

interface TourPageProps {
  onHomeClick: () => void;
  onJoin: (source: string) => void;
  onAboutClick: () => void;
}

export default function TourPage({ onHomeClick, onJoin, onAboutClick }: TourPageProps) {
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
            ProxyPaw is a mobile app, and these are its real screens, the same on Android and iOS. It plays by itself: the phone stays where it is, and a cursor clicks through a whole booking for you, from your pet's profile to payment to live tracking. Scroll any time to take over.
          </p>
        </Reveal>
      </section>

      {/* the whole app as one video */}
      <div id="film" style={{ ...shell, padding: 'clamp(18px, 3vw, 36px) clamp(16px, 2.5vw, 28px) clamp(40px, 6vw, 80px)', scrollMarginTop: 90 }}>
        <AppFilm />
      </div>

      {/* the phone stays put, the cards scroll, the cursor clicks */}
      <div style={{ ...shell, padding: '10px clamp(16px, 2.5vw, 28px) 0' }}>
        <AppScrollTour steps={STEPS} />
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
          <div style={{ display: 'inline-flex', alignItems: 'center', background: '#e7f4e4', border: '1px solid #d5e6cf', color: '#2e7d4f', borderRadius: 999, padding: '9px 18px', fontFamily: sora, fontWeight: 600, fontSize: 13.5, margin: '0 0 26px', maxWidth: '92%' }}>
<span style={{ textAlign: 'left' }}>Founding 1,000 perk: a free onboarding session for your pet, plus &#8377;100 off your first booking!</span>
          </div>
          <br />
          <button className="pp-glass-btn pp-glass-primary" onClick={() => onJoin('tour-closing')} style={{ fontSize: 16.5, padding: '17px 38px' }}>
            Join the waitlist
          </button>
        </Reveal>
      </section>


      {/* founder teaser */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '0 18px clamp(40px, 5vw, 64px)', textTransform: 'none' }}>
        <button
          className="pp-founder-card"
          onClick={onAboutClick}
          style={{ display: 'flex', alignItems: 'stretch', gap: 0, background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 22, padding: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', maxWidth: 560, overflow: 'hidden' }}
        >
          <img src="/founder/pablo-leo-young.jpg" alt="Pablo and Leo, the founder's Persian cats" style={{ width: 150, objectFit: 'cover', objectPosition: 'center', flexShrink: 0 }} />
          <span style={{ padding: '18px 20px', display: 'block' }}>
            <span style={{ display: 'block', fontFamily: sora, fontWeight: 600, fontSize: 10.5, letterSpacing: '0.12em', color: C.muted, marginBottom: 4 }}>NEXT STOP</span>
            <span style={{ display: 'block', fontFamily: sora, fontWeight: 600, fontSize: 17, color: C.ink, marginBottom: 5 }}>Meet the founder, and the boys!</span>
            <span style={{ display: 'block', fontSize: 13, color: C.muted, lineHeight: 1.55 }}>
              She built ProxyPaw for her own community and uses it with Pablo and Leo, her two
              Persian cats. Every volunteer is hand-verified, so your pet is always in safe hands.
              Sound like your pain point too? <span style={{ color: C.orange, fontWeight: 700 }}>Read her story</span>
            </span>
          </span>
        </button>
      </div>
      <style>{`.pp-founder-card { transition: transform .25s, box-shadow .25s; } .pp-founder-card:hover { transform: translateY(-3px); box-shadow: 0 14px 32px rgba(28,60,40,.12); } @media (max-width: 560px) { .pp-founder-card { flex-direction: column; } .pp-founder-card img { width: 100%; height: 140px; } }`}</style>

    </div>
  );
}
