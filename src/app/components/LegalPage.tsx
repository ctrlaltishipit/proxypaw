/**
 * LegalPage — /terms and /privacy, in plain English.
 *
 * The volunteer consent checkbox and the footer link here. Deliberately
 * short and readable; the internal volunteer rules stay backend-only and are
 * shared at onboarding, not published.
 */
import NextStop from './NextStop';
import { useSeo } from '../lib/seo';

const C = {
  cream: '#f6f1e7', ink: '#2a2118', orange: '#e0662f', card: '#fffdf8',
  border: '#eee3cf', muted: '#8b7a63', muted2: '#a08e73', sub: '#6f5f4b', cream2: '#fdf9f0',
};
const heading = "'Fredoka', system-ui, sans-serif";

interface Section { h: string; p: string[] }
interface Doc { title: string; intro: string; updated: string; sections: Section[] }

const TERMS: Doc = {
  title: 'Terms and conditions',
  updated: '1 September 2026',
  intro: 'These are the terms for using proxypaw.com and, once it opens, the proxypaw app. We have kept them short and in plain English. By joining the waitlist, registering as a volunteer, or booking a service, you agree to them.',
  sections: [
    { h: 'What proxypaw is', p: [
      'proxypaw connects pet parents in gated communities with verified neighbours who walk dogs, visit cats at home, and host overnight boarding. We are currently in a waitlist phase and operate only in Hyderabad.',
      'proxypaw arranges and supports the service. The care itself is provided by a verified volunteer from your community.',
    ]},
    { h: 'Joining the waitlist', p: [
      'You give us your name, phone number, email and community so we can tell you when your community opens. Joining the waitlist does not guarantee access or a booking.',
    ]},
    { h: 'Registering as a volunteer', p: [
      'You must be at least 21 years old, have real experience caring for pets, and give us accurate information and original identity documents.',
      'Registration is complete only after we verify your identity, speak with you, and you finish our safety training and trial bookings. We may decline or remove a volunteer at any time, and any mistreatment of a pet means immediate, permanent removal.',
      'Volunteers keep 70% of every booking. The exact payout schedule is shared at onboarding.',
    ]},
    { h: 'Bookings, payments and cancellations', p: [
      'Prices are shown before you book and are charged in Indian rupees. Every booking is insured and GPS-tracked. Cancellation and refund terms are shown at the time of booking.',
    ]},
    { h: 'Your responsibilities as a pet parent', p: [
      'Tell us the truth about your pet: health, temperament, fears and quirks. Keep vaccinations current. Provide what the volunteer needs to care for your pet safely.',
    ]},
    { h: 'Liability', p: [
      'We take safety seriously and insure every booking, but proxypaw is not liable for indirect losses, or for outcomes caused by information you did not share with us. Nothing here limits liability that cannot be limited under Indian law.',
    ]},
    { h: 'Changes and contact', p: [
      'We may update these terms as the service grows; the date at the top tells you when. Questions or concerns: use the feedback form after you register, or reply to any email from proxypaw.',
    ]},
  ],
};

const PRIVACY: Doc = {
  title: 'Privacy policy',
  updated: '1 September 2026',
  intro: 'This explains what proxypaw collects, why, where it is kept, and your rights. Short version: we collect only what verification and bookings need, we keep it private, and we never sell it.',
  sections: [
    { h: 'What we collect', p: [
      'Pet parents: name, phone number, email address, and community.',
      'Volunteers: the above, plus date of birth, a short note on your pet experience, your identity documents (e-Aadhaar, or PAN if you do not have one, and optionally a driving licence), and your consent records.',
      'Feedback you send us, and basic technical logs needed to keep the site running.',
    ]},
    { h: 'Why we collect it', p: [
      'To tell you when your community opens, to verify that volunteers are who they say they are and are at least 21, to run background verification you have consented to, and to operate bookings once the app is live.',
    ]},
    { h: 'Where it is kept', p: [
      'Data is stored with Supabase in the Mumbai region. Identity documents go into a private storage area that only the founder can open, through short-lived links, and they are used only for verification.',
      'Emails are sent through Resend. The site is hosted on Vercel. The founder dashboard uses Google sign-in restricted to a single admin account.',
    ]},
    { h: 'Who can see it', p: [
      'Only the founder, for verification and running the service. We do not sell or rent your data, and we do not share it with advertisers. A volunteer sees only what they need for a booking they have accepted.',
    ]},
    { h: 'How long we keep it', p: [
      'Waitlist details until your community opens and you decide whether to join. Volunteer documents until verification is complete and for as long as you remain an active volunteer, after which they are deleted.',
    ]},
    { h: 'Your rights', p: [
      'You can ask what we hold about you, ask us to correct it, or ask us to delete it, in line with the Digital Personal Data Protection Act, 2023. Use the feedback form after you register, or reply to any email from proxypaw, and we will respond.',
    ]},
    { h: 'Cookies', p: [
      'The public site sets no tracking cookies. The founder dashboard keeps a sign-in session in the browser of the person who signed in, and nothing else.',
    ]},
  ],
};

export default function LegalPage({ kind, onHomeClick, onBlogClick }: { kind: 'terms' | 'privacy'; onHomeClick: () => void; onBlogClick: () => void }) {
  const doc = kind === 'terms' ? TERMS : PRIVACY;
  useSeo({
    title: `${doc.title} · proxypaw`,
    description: doc.intro.slice(0, 150),
    path: `/${kind}`,
  });

  return (
    <div style={{ minHeight: '100vh', background: C.cream, color: C.ink, textTransform: 'none' }}>
      <header style={{ maxWidth: 1200, margin: '0 auto', padding: '18px clamp(18px, 3vw, 28px)', display: 'flex', alignItems: 'center', gap: 9 }}>
        <div onClick={onHomeClick} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
          <span style={{ width: 38, height: 38, borderRadius: 13, background: C.orange, display: 'grid', placeItems: 'center' }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="#fff"><ellipse cx="8.2" cy="7.4" rx="2.1" ry="2.9" /><ellipse cx="15.8" cy="7.4" rx="2.1" ry="2.9" /><ellipse cx="4.4" cy="12.2" rx="1.9" ry="2.5" /><ellipse cx="19.6" cy="12.2" rx="1.9" ry="2.5" /><path d="M12 11c3 0 5.6 2.4 5.9 5.3.2 2-1.3 3.7-3.3 3.7-1 0-1.8-.5-2.6-.5s-1.6.5-2.6.5c-2 0-3.5-1.7-3.3-3.7C6.4 13.4 9 11 12 11z" /></svg>
          </span>
          <span style={{ fontFamily: heading, fontWeight: 600, fontSize: 21 }}>proxypaw</span>
        </div>
      </header>

      <article style={{ maxWidth: 760, margin: '0 auto', padding: '20px clamp(18px, 3vw, 28px) 60px' }}>
        <div style={{ fontFamily: heading, fontWeight: 600, fontSize: 12.5, letterSpacing: '0.13em', color: C.orange, marginBottom: 12 }}>
          {kind === 'terms' ? 'THE FINE PRINT, WITHOUT THE FINE PRINT' : 'YOUR DATA, PLAINLY'}
        </div>
        <h1 style={{ fontFamily: heading, fontWeight: 600, fontSize: 'clamp(30px, 4vw, 44px)', lineHeight: 1.1, margin: '0 0 8px' }}>{doc.title}</h1>
        <div style={{ fontSize: 13, color: C.muted2, marginBottom: 22 }}>Last updated {doc.updated}</div>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: C.sub, margin: '0 0 30px' }}>{doc.intro}</p>

        {doc.sections.map((s) => (
          <section key={s.h} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 'clamp(16px, 2.4vw, 24px)', marginBottom: 14 }}>
            <h2 style={{ fontFamily: heading, fontWeight: 600, fontSize: 19, margin: '0 0 8px' }}>{s.h}</h2>
            {s.p.map((para, i) => (
              <p key={i} style={{ fontSize: 15, lineHeight: 1.7, color: C.sub, margin: i === s.p.length - 1 ? 0 : '0 0 10px' }}>{para}</p>
            ))}
          </section>
        ))}
      </article>

      <NextStop label="Want to read more? Check out our blogs" sub="The Paw Journal: practical care guides for flat pets" onClick={onBlogClick} />
    </div>
  );
}
