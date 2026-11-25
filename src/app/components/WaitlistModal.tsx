/**
 * WaitlistModal, the split-card signup from the Claude Design artifact.
 *
 * Photo and testimonial on the left, form on the right. Submits to the
 * join-waitlist Edge Function, which saves the row and sends the confirmation
 * email. There is no account and no OTP: this is a waitlist, so asking someone
 * to verify a code before they're even in would cost signups for nothing.
 *
 * Email is collected alongside phone because the confirmation is an email,
 * a phone number alone can't be written to.
 */
import { useEffect, useRef, useState } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { COMMUNITIES } from '../data/communities';
import BrandLogo from './BrandLogo';

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
  band: '#eaf3e4',
  btnBorder: '#c9dcc4',
  green: '#2e7d4f',
};
const sora = "'Plus Jakarta Sans', system-ui, sans-serif";

const HERO_IMG =
  '/real/hero.jpg';

const ID_PROOFS = [
  { value: 'aadhaar', label: 'Aadhaar Card' },
  { value: 'pan', label: 'PAN Card' },
  { value: 'driving-licence', label: 'Driving Licence' },
  { value: 'passport', label: 'Passport' },
  { value: 'voter-id', label: 'Voter ID' },
];

const SB_URL = import.meta.env.VITE_SUPABASE_URL ?? 'https://tiodckftpybxwbekxske.supabase.co';
const FN_URL = `${SB_URL}/functions/v1/join-waitlist`;
const FEEDBACK_URL = `${SB_URL}/functions/v1/submit-feedback`;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

type Mode = 'signup' | 'login';

interface WaitlistModalProps {
  open: boolean;
  onClose: () => void;
  /** What the visitor clicked, recorded as the signup source. */
  source?: string;
  /** 'walker' when they came from a "become a walker" CTA. */
  intent?: 'owner' | 'walker';
}


/** Shown on the success screen. Role-aware: volunteers can flag revisions to
 *  their registration; owners send app feedback, feature asks, testimonials. */
function FeedbackForm({ email, volunteer, source }: { email: string; volunteer: boolean; source: string }) {
  const [message, setMessage] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'sent' | 'error'>('idle');

  async function send() {
    if (message.trim().length < 3) return;
    setState('busy');
    try {
      const res = await fetch(FEEDBACK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: volunteer ? 'walker' : 'owner', message, source }),
      });
      setState(res.ok ? 'sent' : 'error');
    } catch {
      setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <div style={{ background: '#e7f4e4', border: '1px solid #cfe5cb', borderRadius: 18, padding: '16px 20px', marginTop: 24, fontSize: 14, lineHeight: 1.55, color: '#2e6b43' }}>
        Thank you, we've received it and we read every message.
      </div>
    );
  }

  return (
    <div style={{ borderTop: `1px solid ${C.btnBorder}`, marginTop: 26, paddingTop: 22 }}>
      <div style={{ fontFamily: sora, fontWeight: 600, fontSize: 15, color: C.ink, marginBottom: 5 }}>
        {volunteer ? 'Anything to add or revise?' : 'Tell us what you think'}
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.55, color: C.muted2, margin: '0 0 12px' }}>
        {volunteer
          ? 'If you want to correct or add to anything you just submitted, or share feedback about registering, write it here and we\u2019ll attach it to your application.'
          : 'Features you\u2019d love, upgrades you\u2019d want, or a few words about why you\u2019re joining, we read everything, and the best notes shape what we build next.'}
      </p>
      <textarea
        className="pp-field"
        value={message}
        onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
        placeholder={volunteer ? 'e.g. My phone number should be… / I also wanted to mention…' : 'e.g. It would be great if the app could…'}
        style={{
          width: '100%', boxSizing: 'border-box', padding: '13px 16px', borderRadius: 16,
          border: `1px solid ${C.btnBorder}`, background: C.cream, fontSize: 16, color: C.ink,
          outline: 'none', fontFamily: 'inherit', minHeight: 84, resize: 'vertical', lineHeight: 1.55,
        }}
      />
      {state === 'error' && (
        <p role="alert" style={{ fontSize: 13, color: C.orangeDark, margin: '8px 0 0' }}>
          Could not send, please try again.
        </p>
      )}
      <button
        onClick={send}
        disabled={state === 'busy' || message.trim().length < 3}
        style={{
          marginTop: 12, border: `1.5px solid ${C.btnBorder}`, background: C.card, color: C.ink,
          fontFamily: sora, fontWeight: 600, fontSize: 14, padding: '11px 24px', borderRadius: 999,
          cursor: 'pointer', opacity: state === 'busy' || message.trim().length < 3 ? 0.55 : 1,
        }}
      >
        {state === 'busy' ? 'Sending…' : 'Send feedback'}
      </button>
    </div>
  );
}

export default function WaitlistModal({ open, onClose, source = 'site', intent = 'owner' }: WaitlistModalProps) {
  const [mode, setMode] = useState<Mode>('signup');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [community, setCommunity] = useState(COMMUNITIES[0]);
  const [communityQuery, setCommunityQuery] = useState('');
  const [communityOpen, setCommunityOpen] = useState(false);
  const [idProof, setIdProof] = useState(ID_PROOFS[0].value);
  const [coverLetter, setCoverLetter] = useState('');
  const [dob, setDob] = useState('');
  const [files, setFiles] = useState<Record<'aadhaar' | 'pan' | 'dl', { name: string; size: number; b64: string; type: string } | null>>({ aadhaar: null, pan: null, dl: null });
  const [consents, setConsents] = useState({ terms: false, docs: false, bgc: false });
  const [website, setWebsite] = useState(''); // honeypot
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<null | { alreadyOnList: boolean }>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  // Reset only when it reopens, so a mid-flight close doesn't wipe the form.
  useEffect(() => {
    if (open) {
      setError('');
      setDone(null);
    }
  }, [open]);

  if (!open) return null;
  const volunteer = intent === 'walker';

  /** Type-ahead ranking: names starting with the query first, then contains. */
  function communityMatches(): string[] {
    const q = communityQuery.trim().toLowerCase();
    if (!q) return COMMUNITIES;
    const starts = COMMUNITIES.filter((c) => c.toLowerCase().startsWith(q));
    const wordStarts = COMMUNITIES.filter((c) => !starts.includes(c) && c.toLowerCase().split(/\s+/).some((w) => w.startsWith(q)));
    const contains = COMMUNITIES.filter((c) => !starts.includes(c) && !wordStarts.includes(c) && c.toLowerCase().includes(q));
    const out = [...starts, ...wordStarts, ...contains];
    return out.length ? out : [COMMUNITIES[COMMUNITIES.length - 1]];
  }

  const DOC_MIMES = ['application/pdf', 'image/jpeg', 'image/png'];

  function pickFile(kind: 'aadhaar' | 'pan' | 'dl') {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      if (!DOC_MIMES.includes(f.type)) { setError('Documents must be PDF, JPG or PNG.'); return; }
      if (f.size > 3 * 1024 * 1024) { setError('Each document must be under 3 MB.'); return; }
      setError('');
      const reader = new FileReader();
      reader.onload = () => {
        const b64 = String(reader.result).split(',')[1] ?? '';
        setFiles((prev) => ({ ...prev, [kind]: { name: f.name, size: f.size, b64, type: f.type } }));
      };
      reader.readAsDataURL(f);
    };
  }

  function volunteerAge(): number {
    const d = new Date(dob + 'T00:00:00');
    if (isNaN(d.getTime())) return -1;
    const now = new Date();
    let a = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
    return a;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (volunteer) {
      const age = volunteerAge();
      if (age < 0) { setError('Please enter your date of birth.'); return; }
      if (age < 21) { setError('Volunteers must be at least 21 years old.'); return; }
      if (!files.aadhaar && !files.pan) { setError("Please upload your e-Aadhaar, or your PAN card if you don't have one."); return; }
      if (!consents.terms || !consents.docs || !consents.bgc) { setError('Please tick all three confirmations to register.'); return; }
    }
    setBusy(true);
    try {
      const res = await fetch(FN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(ANON ? { Authorization: `Bearer ${ANON}`, apikey: ANON } : {}),
        },
        body: JSON.stringify({
          name, phone, email, community, role: intent, source, website,
          ...(intent === 'walker' ? {
            cover_letter: coverLetter,
            dob,
            consents,
            ...(files.aadhaar ? { aadhaar_file: { data: files.aadhaar.b64, type: files.aadhaar.type } } : {}),
            ...(files.pan ? { pan_file: { data: files.pan.b64, type: files.pan.type } } : {}),
            ...(files.dl ? { dl_file: { data: files.dl.b64, type: files.dl.type } } : {}),
          } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }
      setDone({ alreadyOnList: Boolean(data.alreadyOnList) });
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  const label: React.CSSProperties = {
    display: 'block', fontFamily: sora, fontWeight: 600, fontSize: 13.5,
    color: C.ink, marginBottom: 7,
  };
  const field: React.CSSProperties = {
    width: '100%', padding: '14px 18px', borderRadius: 999,
    border: `1px solid ${C.btnBorder}`, background: C.cream,
    // 16px minimum: below that, iOS Safari zooms the whole page on focus.
    fontSize: 16, color: C.ink, outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  return (
    <div
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      className="pp-modal-overlay"
      style={{
        position: 'fixed', inset: 0, zIndex: 1050, background: 'rgba(20,48,31,.55)',
        backdropFilter: 'blur(4px)', display: 'flex', padding: 20,
        overflowY: 'auto', textTransform: 'none',
      }}
    >
      <style>{`
        @keyframes pp-modal-in { from { opacity:0; transform:translateY(14px) scale(.985);} to {opacity:1;transform:none;} }
        .pp-modal { animation:.28s cubic-bezier(.16,1,.3,1) both pp-modal-in; }
        .pp-field:focus { border-color:${C.orange} !important; box-shadow:0 0 0 3px rgba(224,102,47,.15); }
        .pp-submit:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 16px 34px rgba(224,102,47,.4); }
        .pp-x:hover { background:${C.band}; }
        @media (min-width: 861px) {
          .pp-modal { max-height: 92vh; }
          .pp-modal-form { overflow-y: auto; max-height: 92vh; justify-content: flex-start !important; }
        }
        @media (max-width: 860px) {
          .pp-modal-photo { display:none !important; }
          .pp-modal { grid-template-columns: 1fr !important; width: 100% !important; border-radius: 24px !important; }
          .pp-modal-form { padding: 26px 20px 30px !important; justify-content: flex-start !important; }
        }
        @media (max-width: 480px) {
          .pp-modal-overlay { padding: 10px !important; align-items: flex-start !important; }
          .pp-modal-form { padding: 24px 16px 28px !important; }
        }
        @media (prefers-reduced-motion: reduce) { .pp-modal { animation:none; } }
      `}</style>

      <div
        ref={dialogRef}
        className="pp-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Join the ProxyPaw waitlist"
        style={{
          width: 'min(1000px, 100%)', margin: 'auto', background: C.card, borderRadius: 32,
          overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr',
          boxShadow: '0 40px 90px rgba(20,48,31,.35)', position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="pp-x"
          style={{
            position: 'absolute', top: 16, right: 16, zIndex: 2, border: 'none',
            background: 'transparent', borderRadius: 999, width: 36, height: 36,
            display: 'grid', placeItems: 'center', cursor: 'pointer', color: C.muted,
            transition: '.2s',
          }}
        >
          <X size={18} />
        </button>

        {/* ---- left: photo + testimonial ---- */}
        <div className="pp-modal-photo" style={{ position: 'relative', minHeight: 560 }}>
          <img
            src={HERO_IMG}
            alt="A neighbour walking a golden retriever across a community lawn at sunrise"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '74% 50%' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(20,48,31,0) 40%, rgba(20,48,31,.85) 100%)' }} />
          <blockquote
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, margin: 0, padding: 34,
              fontFamily: sora, fontWeight: 600, fontSize: 22, lineHeight: 1.35, color: '#fff',
            }}
          >
            “Biscuit gets three walks a week, and Whiskers never misses her 7 PM dinner visit.”
          </blockquote>
        </div>

        {/* ---- right: form ---- */}
        <div className="pp-modal-form" style={{ padding: 'clamp(28px, 4vw, 44px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 26 }}>
            <BrandLogo tile={38} />
          </div>

          {done ? (
            <div>
              <div style={{ width: 52, height: 52, borderRadius: 999, background: C.green, display: 'grid', placeItems: 'center', marginBottom: 20 }}>
                <Check size={26} color="#fff" strokeWidth={3} />
              </div>
              <h2 style={{ fontFamily: sora, fontWeight: 600, fontSize: 27, letterSpacing: '-0.008em', margin: '0 0 12px', color: C.ink }}>
                {done.alreadyOnList
                  ? "You're already on the list."
                  : volunteer ? "You're registered." : "You're on the list."}
              </h2>
              <p style={{ fontSize: 15.5, lineHeight: 1.65, color: C.sub, margin: '0 0 10px' }}>
                {done.alreadyOnList
                  ? `We already have you down for ${community}. We'll notify you shortly about your access.`
                  : volunteer
                    ? `Thank you for volunteering. We've sent a confirmation to ${email}, we'll reach out about onboarding, ID verification and safety training.`
                    : `We've added you to the ProxyPaw waitlist and sent a confirmation to ${email}. We'll notify you shortly about your access.`}
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: C.muted2, margin: '0 0 28px' }}>
                We open community by community. {community} is on our map, you'll be among the first in.
              </p>
              <button
                onClick={onClose}
                style={{
                  border: 'none', background: C.ink, color: '#ffffff', fontFamily: sora,
                  fontWeight: 600, fontSize: 15.5, padding: '15px 30px', borderRadius: 999, cursor: 'pointer',
                }}
              >
                Back to the site
              </button>

              <FeedbackForm email={email} volunteer={volunteer} source={source} />
            </div>
          ) : (
            <>
              {/* Log In / Sign Up toggle. Login is disabled during the waitlist:
                  there are no accounts to log into yet. */}
              <div style={{ display: 'flex', background: C.band, borderRadius: 999, padding: 5, marginBottom: 26 }}>
                {(['login', 'signup'] as Mode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    style={{
                      flex: 1, border: 'none', borderRadius: 999, padding: '12px 0', cursor: 'pointer',
                      fontFamily: sora, fontWeight: 600, fontSize: 15.5, transition: '.2s',
                      background: mode === m ? C.card : 'transparent',
                      color: mode === m ? C.ink : C.muted,
                      boxShadow: mode === m ? '0 2px 8px rgba(28,60,40,.10)' : 'none',
                    }}
                  >
                    {m === 'login' ? 'Log In' : 'Sign Up'}
                  </button>
                ))}
              </div>

              {mode === 'signup' && (
                <div style={{ background: '#e7f4e4', border: '1px solid #cfe5cb', borderRadius: 14, padding: '10px 14px', marginBottom: 16, fontSize: 11.5, lineHeight: 1.55, color: '#2e6b43' }}>
                  <strong style={{ fontFamily: sora }}>A quick note:</strong> we're live only in Hyderabad,
                  gated communities first. Pick your community to sign up as an owner, or register as a
                  volunteer from that same community: if you live in a community and want to walk, care for,
                  or foster a neighbour's pet, you can volunteer and earn on every booking. Your pet stays
                  with someone from your own community, often a face you already know.
                </div>
              )}
              {volunteer && mode === 'signup' && (
                <div style={{ marginBottom: 20 }}>
                  <h2 style={{ fontFamily: sora, fontWeight: 600, fontSize: 22, letterSpacing: '-0.008em', margin: '0 0 6px', color: C.ink }}>
                    Register as a Volunteer
                  </h2>
                  <p style={{ fontSize: 14, lineHeight: 1.55, color: C.sub, margin: '0 0 8px' }}>
                    Walk dogs, visit cats, host sleepovers, and keep 70% of every booking.
                    We'll verify your ID at onboarding.
                  </p>
                  <p style={{ fontSize: 12.5, lineHeight: 1.5, color: C.orangeDark, margin: 0, fontWeight: 500 }}>
                    One thing we ask of every volunteer: real experience with pets, you have (or have
                    had) a pet, or you've genuinely cared for one. Pets can't tell their humans how they
                    were treated, so we only take people who already understand them.
                  </p>
                </div>
              )}
              {mode === 'login' ? (
                <div style={{ padding: '8px 0 4px' }}>
                  <h2 style={{ fontFamily: sora, fontWeight: 600, fontSize: 20, margin: '0 0 10px', color: C.ink }}>
                    We're not open just yet.
                  </h2>
                  <p style={{ fontSize: 15, lineHeight: 1.65, color: C.sub, margin: '0 0 22px' }}>
                    ProxyPaw is opening one community at a time. There are no accounts to log into
                    yet, join the waitlist and we'll email you the moment your towers go live.
                  </p>
                  <button
                    onClick={() => setMode('signup')}
                    style={{
                      border: 'none', background: C.orange, color: '#fff', fontFamily: sora,
                      fontWeight: 600, fontSize: 16, padding: '16px 32px', borderRadius: 999,
                      cursor: 'pointer', boxShadow: '0 12px 28px rgba(224,102,47,.3)',
                    }}
                  >
                    Join the waitlist
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} noValidate>
                  <div style={{ marginBottom: 16 }}>
                    <label style={label} htmlFor="pp-name">{volunteer ? 'Your Name (as per ID proof)' : 'Your Name'}</label>
                    <input id="pp-name" className="pp-field" style={field} value={name}
                      onChange={(e) => setName(e.target.value)} placeholder="e.g. Ananya"
                      autoComplete="name" enterKeyHint="next" required />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={label} htmlFor="pp-phone">Phone Number</label>
                    <input id="pp-phone" className="pp-field" style={field} value={phone}
                      onChange={(e) => setPhone(e.target.value)} placeholder="+91 98••• •••••"
                      type="tel" inputMode="tel" autoComplete="tel" enterKeyHint="next" required />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={label} htmlFor="pp-email">Email</label>
                    <input id="pp-email" className="pp-field" style={field} value={email}
                      onChange={(e) => setEmail(e.target.value)} placeholder="ananya@example.com"
                      type="email" inputMode="email" autoComplete="email" enterKeyHint="next" required />
                  </div>

                  {volunteer && (
                    <div style={{ marginBottom: 16 }}>
                      <label style={label} htmlFor="pp-cover">Why do you want to volunteer?</label>
                      <textarea
                        id="pp-cover"
                        className="pp-field"
                        style={{ ...field, borderRadius: 18, minHeight: 110, resize: 'vertical', lineHeight: 1.55 }}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value.slice(0, 1600))}
                        placeholder="Your experience with pets and why you'd like to volunteer. Even a line is enough, you can tell us more if you're shortlisted."
                        required
                      />
                      <p style={{ fontSize: 11.5, color: C.muted2, margin: '6px 2px 0', lineHeight: 1.5 }}>
                        Only the team onboarding volunteers reads this. Tip: tap the mic on your phone keyboard to dictate.
                      </p>
                    </div>
                  )}

                  {volunteer && (
                    <div style={{ marginBottom: 13 }}>
                      <label style={label} htmlFor="pp-dob">Date of Birth</label>
                      <input id="pp-dob" className="pp-field" type="date" style={field}
                        value={dob} onChange={(e) => setDob(e.target.value)} required
                        max={new Date().toISOString().slice(0, 10)} />
                      <p style={{ fontSize: 12, color: C.muted2, margin: '7px 2px 0', lineHeight: 1.5 }}>
                        Volunteers must be 21 or older, and your ID proof should say the same.
                      </p>
                    </div>
                  )}

                  {volunteer && (
                    <div style={{ marginBottom: 18 }}>
                      <label style={label}>ID Documents</label>
                      {([
                        { kind: 'aadhaar' as const, title: 'e-Aadhaar', note: 'Mandatory. Download it from the UIDAI website.', required: !files.pan },
                        { kind: 'pan' as const, title: 'PAN card', note: files.aadhaar ? 'Optional additional document.' : "Mandatory if you don't have an e-Aadhaar.", required: !files.aadhaar },
                        { kind: 'dl' as const, title: 'Driving licence', note: 'Optional. Upload it or leave it blank.', required: false },
                      ]).map((d) => (
                        <label key={d.kind} style={{ display: 'flex', alignItems: 'center', gap: 12, background: C.cream, border: `1px dashed ${files[d.kind] ? C.green : C.btnBorder}`, borderRadius: 16, padding: '9px 13px', marginBottom: 7, cursor: 'pointer' }}>
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={pickFile(d.kind)} style={{ display: 'none' }} />
                          <span style={{ width: 30, height: 30, borderRadius: 10, background: files[d.kind] ? C.green : '#d8e8d2', display: 'grid', placeItems: 'center', flexShrink: 0, color: '#fff', fontSize: 15 }}>
                            {files[d.kind] ? <Check size={15} strokeWidth={3} /> : '+'}
                          </span>
                          <span style={{ minWidth: 0 }}>
                            <span style={{ display: 'block', fontFamily: sora, fontWeight: 600, fontSize: 13.5, color: C.ink }}>
                              {d.title}{d.required && <span style={{ color: C.orangeDark }}> *</span>}
                            </span>
                            <span style={{ display: 'block', fontSize: 11.5, color: files[d.kind] ? C.green : C.muted2, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {files[d.kind] ? `${files[d.kind]!.name} · ${(files[d.kind]!.size / 1024).toFixed(0)} KB` : d.note}
                            </span>
                          </span>
                        </label>
                      ))}
                      <p style={{ fontSize: 11.5, color: C.muted2, margin: '4px 2px 0', lineHeight: 1.5 }}>
                        PDF, JPG or PNG, under 3 MB each. Stored privately, seen only by the founder, used only for verification.
                      </p>
                    </div>
                  )}

                  {volunteer && (
                    <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {([
                        { key: 'terms' as const, text: null },
                        { key: 'docs' as const, text: 'All documents I submitted above are original; I previewed and double-checked each one before submitting.' },
                        { key: 'bgc' as const, text: 'I consent to ProxyPaw conducting a background verification check on me as part of my volunteer registration.' },
                      ]).map((c) => (
                        <label key={c.key} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={consents[c.key]}
                            onChange={(e) => setConsents((prev) => ({ ...prev, [c.key]: e.target.checked }))}
                            style={{ marginTop: 3, width: 16, height: 16, accentColor: C.orange, flexShrink: 0 }}
                          />
                          <span style={{ fontSize: 12.5, lineHeight: 1.55, color: C.sub }}>
                            {c.text ?? (
                              <>I accept ProxyPaw's <a href="/terms" target="_blank" rel="noreferrer" style={{ color: C.orangeDark, fontWeight: 600 }}>terms and conditions</a>, <a href="/privacy" target="_blank" rel="noreferrer" style={{ color: C.orangeDark, fontWeight: 600 }}>privacy policy</a>, and all volunteer rules and regulations, and I'm ready to follow them.</>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  <div style={{ marginBottom: 22, position: 'relative' }}>
                    <label style={label} htmlFor="pp-community">Your Community</label>
                    <input
                      id="pp-community"
                      className="pp-field"
                      style={field}
                      value={communityOpen ? communityQuery : community}
                      placeholder="Type to search, e.g. Aparna"
                      autoComplete="off"
                      onFocus={() => { setCommunityOpen(true); setCommunityQuery(''); }}
                      onChange={(e) => { setCommunityQuery(e.target.value); setCommunityOpen(true); }}
                      onBlur={() => setTimeout(() => setCommunityOpen(false), 150)}
                    />
                    {communityOpen && (
                      <div style={{ position: 'absolute', zIndex: 5, left: 0, right: 0, top: '100%', marginTop: 6, background: C.card, border: `1px solid ${C.btnBorder}`, borderRadius: 16, boxShadow: '0 18px 40px rgba(20,48,31,.18)', maxHeight: 208, overflowY: 'auto' }}>
                        {communityMatches().slice(0, 40).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); setCommunity(c); setCommunityQuery(''); setCommunityOpen(false); }}
                            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px', border: 'none', background: c === community ? C.band : 'transparent', fontSize: 15, color: C.ink, cursor: 'pointer', fontFamily: 'inherit' }}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Honeypot, hidden from people, catches bots. */}
                  <input type="text" name="website" value={website} tabIndex={-1} autoComplete="off"
                    aria-hidden="true" onChange={(e) => setWebsite(e.target.value)}
                    style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />

                  {error && (
                    <p role="alert" style={{ fontSize: 14, color: C.orangeDark, margin: '0 0 14px', lineHeight: 1.5 }}>
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={busy}
                    className="pp-submit"
                    style={{
                      width: '100%', border: 'none', background: C.orange, color: '#fff',
                      fontFamily: sora, fontWeight: 600, fontSize: 16.5, padding: '17px 32px',
                      borderRadius: 999, cursor: busy ? 'wait' : 'pointer',
                      boxShadow: '0 12px 28px rgba(224,102,47,.3)', transition: '.25s',
                      opacity: busy ? 0.75 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                    }}
                  >
                    {busy && <Loader2 size={18} className="pp-spin" style={{ animation: 'spin 1s linear infinite' }} />}
                    {busy ? 'Joining…' : volunteer ? 'Register as a Volunteer' : 'Join Your Community'}
                  </button>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

                  <p style={{ fontSize: 13, lineHeight: 1.6, color: C.muted2, textAlign: 'center', margin: '18px 0 0' }}>
                    {volunteer
                      ? "We'll email you about onboarding. By continuing you accept the community walker code of conduct."
                      : "We'll email you when your community goes live. By continuing you accept the community walker code of conduct."}
                  </p>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
