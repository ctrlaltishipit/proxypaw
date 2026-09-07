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
import NextStop from './NextStop';
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
  return (
    <div style={{ minHeight: '100vh', background: C.cream, color: C.ink, overflowX: 'clip', textTransform: 'none' }}>
      <style>{`
        .pp-dark-btn:hover { background:${C.orange} !important; transform:translateY(-2px); }
        .pp-cta:hover { transform:translateY(-2px); box-shadow:0 18px 38px rgba(224,102,47,.42) !important; }
        .pp-shot { transition: transform .5s cubic-bezier(.16,1,.3,1); }
        .pp-shot:hover { transform: scale(1.015) rotate(-0.3deg); }
      `}</style>

      {/* header */}
      <header style={{ ...shell, padding: '22px 28px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div onClick={onHomeClick} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
          <PawMark size={38} radius={13} />
          <span style={{ fontFamily: sora, fontWeight: 600, fontSize: 21, letterSpacing: '-0.008em' }}>ProxyPaw</span>
        </div>
        <button
          className="pp-dark-btn"
          onClick={() => onJoin('tour-header')}
          style={{
            marginLeft: 'auto', border: 'none', background: C.ink, color: C.cream2,
            fontFamily: sora, fontWeight: 600, fontSize: 14.5, padding: '12px 22px',
            borderRadius: 999, cursor: 'pointer', transition: '.25s',
          }}
        >
          Join the waitlist
        </button>
      </header>

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
      <div style={{ ...shell, padding: `10px ${'{'}0{'}'} 40px`, position: 'relative' }}>
        {SECTIONS.map((sec, i) => {
          const tints = ['#fffdf8', '#f7f3e6', '#fdf6ec'];
          return (
            <section
              key={sec.id}
              id={sec.id}
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
            Your community could be next.
          </h2>
          <p style={{ fontSize: 16.5, color: C.muted, margin: '0 0 30px', fontWeight: 400 }}>
            We open tower by tower. Join the waitlist and you're first in line when yours goes live.
          </p>
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


      <NextStop
        label="Meet the founder, and the boys"
        sub="Why ProxyPaw exists, plus Pablo and Leo"
        onClick={onAboutClick}
      />

    </div>
  );
}
