/**
 * WaitlistModal — the split-card signup from the Claude Design artifact.
 *
 * Photo and testimonial on the left, form on the right. Submits to the
 * join-waitlist Edge Function, which saves the row and sends the confirmation
 * email. There is no account and no OTP: this is a waitlist, so asking someone
 * to verify a code before they're even in would cost signups for nothing.
 *
 * Email is collected alongside phone because the confirmation is an email —
 * a phone number alone can't be written to.
 */
import { useEffect, useRef, useState } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { COMMUNITIES } from '../data/communities';

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
  band: '#f1eadb',
  btnBorder: '#d9cbb2',
  green: '#3f6c51',
};
const sora = "'Sora', system-ui, sans-serif";

const HERO_IMG =
  'https://images.unsplash.com/photo-1552053831-71594a27632d?w=900&q=80&auto=format&fit=crop';

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL ?? 'https://tiodckftpybxwbekxske.supabase.co'}/functions/v1/join-waitlist`;
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

export default function WaitlistModal({ open, onClose, source = 'site', intent = 'owner' }: WaitlistModalProps) {
  const [mode, setMode] = useState<Mode>('signup');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [community, setCommunity] = useState(COMMUNITIES[0]);
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch(FN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(ANON ? { Authorization: `Bearer ${ANON}`, apikey: ANON } : {}),
        },
        body: JSON.stringify({ name, phone, email, community, role: intent, source, website }),
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
    fontSize: 15, color: C.ink, outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  return (
    <div
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 1050, background: 'rgba(42,33,24,.55)',
        backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', padding: 20,
        overflowY: 'auto', textTransform: 'none',
      }}
    >
      <style>{`
        @keyframes pp-modal-in { from { opacity:0; transform:translateY(14px) scale(.985);} to {opacity:1;transform:none;} }
        .pp-modal { animation:.28s cubic-bezier(.16,1,.3,1) both pp-modal-in; }
        .pp-field:focus { border-color:${C.orange} !important; box-shadow:0 0 0 3px rgba(224,102,47,.15); }
        .pp-submit:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 16px 34px rgba(224,102,47,.4); }
        .pp-x:hover { background:${C.band}; }
        @media (max-width: 860px) { .pp-modal-photo { display:none !important; } }
        @media (prefers-reduced-motion: reduce) { .pp-modal { animation:none; } }
      `}</style>

      <div
        ref={dialogRef}
        className="pp-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Join the Proxypaw waitlist"
        style={{
          width: 'min(1000px, 100%)', background: C.card, borderRadius: 32,
          overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr',
          boxShadow: '0 40px 90px rgba(42,33,24,.35)', position: 'relative',
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
            alt="A golden retriever waiting by the gate"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(42,33,24,0) 40%, rgba(42,33,24,.85) 100%)' }} />
          <blockquote
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, margin: 0, padding: 34,
              fontFamily: sora, fontWeight: 700, fontSize: 22, lineHeight: 1.35, color: '#fff',
            }}
          >
            “Biscuit gets three walks a week, and Whiskers never misses her 7 PM dinner visit.”
          </blockquote>
        </div>

        {/* ---- right: form ---- */}
        <div style={{ padding: 'clamp(28px, 4vw, 44px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 26 }}>
            <span style={{ width: 38, height: 38, borderRadius: 13, background: C.orange, display: 'grid', placeItems: 'center' }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="#fff">
                <ellipse cx="8.2" cy="7.4" rx="2.1" ry="2.9" /><ellipse cx="15.8" cy="7.4" rx="2.1" ry="2.9" />
                <ellipse cx="4.4" cy="12.2" rx="1.9" ry="2.5" /><ellipse cx="19.6" cy="12.2" rx="1.9" ry="2.5" />
                <path d="M12 11c3 0 5.6 2.4 5.9 5.3.2 2-1.3 3.7-3.3 3.7-1 0-1.8-.5-2.6-.5s-1.6.5-2.6.5c-2 0-3.5-1.7-3.3-3.7C6.4 13.4 9 11 12 11z" />
              </svg>
            </span>
            <span style={{ fontFamily: sora, fontWeight: 800, fontSize: 21, letterSpacing: '-0.02em', color: C.ink }}>Proxypaw</span>
          </div>

          {done ? (
            <div>
              <div style={{ width: 52, height: 52, borderRadius: 999, background: C.green, display: 'grid', placeItems: 'center', marginBottom: 20 }}>
                <Check size={26} color="#fff" strokeWidth={3} />
              </div>
              <h2 style={{ fontFamily: sora, fontWeight: 800, fontSize: 27, letterSpacing: '-0.02em', margin: '0 0 12px', color: C.ink }}>
                {done.alreadyOnList ? "You're already on the list." : "You're on the list."}
              </h2>
              <p style={{ fontSize: 15.5, lineHeight: 1.65, color: C.sub, margin: '0 0 10px' }}>
                {done.alreadyOnList
                  ? `We already have you down for ${community}. We'll notify you shortly about your access.`
                  : `We've added you to the Proxypaw waitlist and sent a confirmation to ${email}. We'll notify you shortly about your access.`}
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: C.muted2, margin: '0 0 28px' }}>
                We open community by community. {community} is on our map — you'll be among the first in.
              </p>
              <button
                onClick={onClose}
                style={{
                  border: 'none', background: C.ink, color: '#fffdf8', fontFamily: sora,
                  fontWeight: 600, fontSize: 15.5, padding: '15px 30px', borderRadius: 999, cursor: 'pointer',
                }}
              >
                Back to the site
              </button>
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
                      boxShadow: mode === m ? '0 2px 8px rgba(74,52,24,.10)' : 'none',
                    }}
                  >
                    {m === 'login' ? 'Log In' : 'Sign Up'}
                  </button>
                ))}
              </div>

              {mode === 'login' ? (
                <div style={{ padding: '8px 0 4px' }}>
                  <h2 style={{ fontFamily: sora, fontWeight: 700, fontSize: 20, margin: '0 0 10px', color: C.ink }}>
                    We're not open just yet.
                  </h2>
                  <p style={{ fontSize: 15, lineHeight: 1.65, color: C.sub, margin: '0 0 22px' }}>
                    Proxypaw is opening one community at a time. There are no accounts to log into
                    yet — join the waitlist and we'll email you the moment your towers go live.
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
                    <label style={label} htmlFor="pp-name">Your Name</label>
                    <input id="pp-name" className="pp-field" style={field} value={name}
                      onChange={(e) => setName(e.target.value)} placeholder="e.g. Ananya"
                      autoComplete="name" required />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={label} htmlFor="pp-phone">Phone Number</label>
                    <input id="pp-phone" className="pp-field" style={field} value={phone}
                      onChange={(e) => setPhone(e.target.value)} placeholder="+91 98••• •••••"
                      type="tel" autoComplete="tel" required />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={label} htmlFor="pp-email">Email</label>
                    <input id="pp-email" className="pp-field" style={field} value={email}
                      onChange={(e) => setEmail(e.target.value)} placeholder="ananya@example.com"
                      type="email" autoComplete="email" required />
                  </div>

                  <div style={{ marginBottom: 22 }}>
                    <label style={label} htmlFor="pp-community">Your Community</label>
                    <select id="pp-community" className="pp-field" style={{ ...field, appearance: 'none', cursor: 'pointer' }}
                      value={community} onChange={(e) => setCommunity(e.target.value)} required>
                      {COMMUNITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Honeypot — hidden from people, catches bots. */}
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
                      fontFamily: sora, fontWeight: 700, fontSize: 16.5, padding: '17px 32px',
                      borderRadius: 999, cursor: busy ? 'wait' : 'pointer',
                      boxShadow: '0 12px 28px rgba(224,102,47,.3)', transition: '.25s',
                      opacity: busy ? 0.75 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                    }}
                  >
                    {busy && <Loader2 size={18} className="pp-spin" style={{ animation: 'spin 1s linear infinite' }} />}
                    {busy ? 'Joining…' : 'Join Your Community'}
                  </button>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

                  <p style={{ fontSize: 13, lineHeight: 1.6, color: C.muted2, textAlign: 'center', margin: '18px 0 0' }}>
                    We'll email you when your community goes live. By continuing you accept the
                    community walker code of conduct.
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
