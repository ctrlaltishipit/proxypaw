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
    id: 'dashboard',
    eyebrow: 'YOUR DASHBOARD',
    Icon: LayoutDashboard,
    accent: '#e0662f',
    title: 'Everything about your pet, one screen.',
    body: "Open the app and it's all there: today's bookings, your paw points balance, your community's activity, and one-tap paths to book a walk or a visit. No digging through menus while your dog waits at the door.",
    points: [
      'Live view of upcoming walks, visits and boarding stays',
      'Paw points earned on every booking, spendable on the next one',
      'Quick actions: book, rebook your favourite walker, get help',
    ],
    shot: '/shots/dashboard.png',
    alt: 'The ProxyPaw dashboard showing bookings, paw points and quick actions',
  },
  {
    id: 'walkers',
    eyebrow: 'FIND YOUR WALKER',
    Icon: Users,
    accent: '#3f6c51',
    title: 'Neighbours, not strangers.',
    body: 'Browse verified walkers and sitters who live in your towers. Every profile shows their Aadhaar-verified badge, community rating, completed walks and the buildings they cover, so the person holding the leash is someone your neighbours already trust.',
    points: [
      'Aadhaar-checked, background-verified, community-rated',
      'Filter by tower, timing and service, walks, visits, boarding',
      'See real reviews from pet parents in your own community',
    ],
    shot: '/shots/volunteers.png',
    alt: 'Browsing verified walkers with ratings and verification badges',
  },
  {
    id: 'booking',
    eyebrow: 'BOOK IN 30 SECONDS',
    Icon: CalendarCheck,
    accent: '#f0b429',
    title: 'Pick a day. Pick a time. Done.',
    body: "Choose a duration from 30 minutes to 2 hours, pick your slot, and your walker gets your pet's quirks, route notes and vet details automatically. Repeat bookings take one tap, because Tuesday's 7 AM walk is always Tuesday's 7 AM walk.",
    points: [
      'Walks from ₹149, cat home visits ₹129, boarding from ₹549',
      "Your pet's profile travels with every booking, quirks included",
      'Reschedule or cancel without a phone call',
    ],
    shot: '/shots/booking.png',
    alt: 'Booking a walk: choosing duration, date and time slot',
  },
  {
    id: 'payment',
    eyebrow: 'PAY BY UPI',
    Icon: Wallet,
    accent: '#e0662f',
    title: 'Checkout that takes seconds, not forms.',
    body: 'Pay by UPI like everything else in your life. Fair, flat pricing with no surge and no tips awkwardness, and walkers keep 70% of every booking, so good people stay on the platform.',
    points: [
      'UPI, cards and net banking',
      'Every booking insured and receipted',
      'Paw points credited instantly, 25 per booking',
    ],
    shot: '/shots/payment.png',
    alt: 'The payment screen with UPI checkout and booking summary',
  },
  {
    id: 'bookings',
    eyebrow: 'TRACK EVERYTHING',
    Icon: ClipboardList,
    accent: '#3f6c51',
    title: 'Every walk on the record.',
    body: "Live GPS while the walk happens, photos from every visit, and a full history of who walked whom and when. When you're travelling, the boarding host's daily photo update is the difference between a holiday and a worry.",
    points: [
      'Live GPS tracking on every walk',
      'Photo updates from visits and sleepovers',
      'Complete history, rebook any past booking in one tap',
    ],
    shot: '/shots/bookings.png',
    alt: 'Bookings screen with live status and booking history',
  },
  {
    id: 'community',
    eyebrow: 'COMMUNITY PETS',
    Icon: Cat,
    accent: '#f0b429',
    title: "Meet the pets you share a lift with.",
    body: "Every pet in your community, tower by tower: who's friendly with dogs, who's shy, whose birthday it is. Owner details stay masked until you're a verified member, community, with privacy done properly.",
    points: [
      'Tower-by-tower pet directory',
      'Personal details masked until verification',
      'Know the dogs before you meet them in the lobby',
    ],
    shot: '/shots/community.png',
    alt: 'The community pets directory, organised by tower',
  },
  {
    id: 'safety',
    eyebrow: 'SAFETY TRAINING',
    Icon: ShieldCheck,
    accent: '#e0662f',
    title: 'Walkers trained before their first walk.',
    body: 'Every walker completes our safety modules before they can accept a booking: leash rules in lobbies and lifts, the hot-pavement test, emergency first steps, and when to call the vet line. The training lives in the app, and so does the record of who passed it.',
    points: [
      'Mandatory modules with completion tracking',
      'Heat, monsoon and lobby protocols specific to gated communities',
      'Emergency playbook one tap away during every booking',
    ],
    shot: '/shots/safety.png',
    alt: 'The safety training modules walkers complete',
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
            Real screens from the ProxyPaw app, the one your community gets when the doors open. Keep scrolling: each screen stacks over the last.
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

                <div style={{ borderRadius: 18, overflow: 'hidden', border: `1px solid ${C.cardBorder}`, boxShadow: '0 16px 40px rgba(74,52,24,.12)', background: '#fffdf8' }}>
                  <img
                    src={sec.shot}
                    alt={sec.alt}
                    loading="lazy"
                    style={{ display: 'block', width: '100%', aspectRatio: '1280 / 800', objectFit: 'cover', objectPosition: 'top' }}
                  />
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
