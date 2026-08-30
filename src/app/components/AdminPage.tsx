/**
 * AdminPage — the founder's private waitlist dashboard at /admin.
 *
 * Privacy has three layers:
 *  1. Never linked from the site, noindex meta, robots.txt Disallow, absent
 *     from the sitemap.
 *  2. Sign-in is a magic link to the email address itself, so only the inbox
 *     owner can complete it.
 *  3. The real gate is server-side: the admin-stats Edge Function verifies
 *     the session token and refuses any email that is not the admin's, so
 *     even someone who signs in with another address gets nothing.
 *
 * Lazy-loaded, so none of this (supabase-js included) ships in the public
 * bundle.
 */
import { useEffect, useMemo, useState } from 'react';
import { createClient, type Session } from '@supabase/supabase-js';
import { useSeo } from '../lib/seo';

const SB_URL = import.meta.env.VITE_SUPABASE_URL ?? 'https://tiodckftpybxwbekxske.supabase.co';
// Public anon key: designed to ship to browsers; every table is RLS-locked.
const SB_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpb2Rja2Z0cHlieHdiZWt4c2tlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwOTMxMTYsImV4cCI6MjA4MDY2OTExNn0.mk97FqDmFaPnfq5RlqG7opkSaQcuOSeL6mSbIqjWXh4';

const supabase = createClient(SB_URL, SB_ANON, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

const FN_URL = `${SB_URL}/functions/v1/admin-stats`;

const C = {
  cream: '#f6f1e7', ink: '#2a2118', orange: '#e0662f', card: '#fffdf8',
  border: '#eee3cf', muted: '#8b7a63', muted2: '#a08e73', green: '#3f6c51',
  gold: '#f0b429', band: '#f1eadb', cream2: '#fdf9f0',
};
const heading = "'Fredoka', system-ui, sans-serif";

interface Row {
  id: string; name: string; email: string; phone: string; community: string;
  role: string; id_proof: string | null; cover_letter: string | null;
  source: string | null; invited_at: string | null; created_at: string;
}
interface Stats {
  total: number; owners: number; walkers: number; invited: number;
  byCommunity: Array<{ community: string; owners: number; walkers: number; invited: number }>;
  rows: Row[];
  feedback: Array<{ email: string | null; role: string; message: string; source: string | null; created_at: string }>;
}

export default function AdminPage() {
  useSeo({ title: 'proxypaw', description: '', path: '/admin', noindex: true });

  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [denied, setDenied] = useState(false);
  const [tab, setTab] = useState<'communities' | 'signups' | 'feedback'>('communities');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setStats(null); setDenied(false); return; }
    (async () => {
      const res = await fetch(FN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: SB_ANON,
        },
        body: JSON.stringify({}),
      });
      if (res.status === 403) { setDenied(true); return; }
      if (!res.ok) { setError('Could not load the dashboard. Try refreshing.'); return; }
      setStats(await res.json());
    })();
  }, [session]);

  async function googleSignIn() {
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/admin` },
    });
    if (error) setError(error.message);
  }

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    if (error) setError(error.message);
    else setSent(true);
  }

  async function toggleInvited(row: Row) {
    if (!session) return;
    const invited = !row.invited_at;
    const res = await fetch(FN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}`, apikey: SB_ANON },
      body: JSON.stringify({ action: 'mark_invited', id: row.id, invited }),
    });
    if (res.ok && stats) {
      setStats({
        ...stats,
        invited: stats.invited + (invited ? 1 : -1),
        rows: stats.rows.map((r) => (r.id === row.id ? { ...r, invited_at: invited ? new Date().toISOString() : null } : r)),
      });
    }
  }

  const page: React.CSSProperties = { minHeight: '100vh', background: C.cream, color: C.ink, fontFamily: "'Nunito', system-ui, sans-serif", padding: 'clamp(18px, 3vw, 40px)' };

  if (!ready) return <div style={page} />;

  /* ---------- signed out: magic-link form ---------- */
  if (!session) {
    return (
      <div style={{ ...page, display: 'grid', placeItems: 'center' }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, padding: 'clamp(26px, 4vw, 40px)', width: 'min(420px, 100%)', boxSizing: 'border-box' }}>
          <div style={{ fontFamily: heading, fontWeight: 600, fontSize: 22, marginBottom: 6 }}>Founder sign-in</div>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, margin: '0 0 20px' }}>
            This page is private. Sign in with the admin account to open the dashboard.
          </p>
          <button
            onClick={googleSignIn}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, border: `1.5px solid #d9cbb2`, background: '#fff', color: C.ink, fontFamily: heading, fontWeight: 600, fontSize: 15, padding: '13px 0', borderRadius: 999, cursor: 'pointer', marginBottom: 16 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.3-2.1 3.7-5.1 3.7-8.6z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-6-2.2-6.9-5.2H1.2v3C3.1 21.2 7.2 24 12 24z"/><path fill="#FBBC05" d="M5.1 14.2c-.3-.7-.4-1.4-.4-2.2s.1-1.5.4-2.2v-3H1.2C.4 8.4 0 10.1 0 12s.4 3.6 1.2 5.2l3.9-3z"/><path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l2.8-2.7C16.5 1.3 14.1 0 12 0 7.2 0 3.1 2.8 1.2 6.8l3.9 3c.9-3 3.7-5.1 6.9-5.1z"/></svg>
            Sign in with Google
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 14px', color: C.muted2, fontSize: 12 }}>
            <span style={{ flex: 1, height: 1, background: C.border }} />or use a sign-in link<span style={{ flex: 1, height: 1, background: C.border }} />
          </div>
          {sent ? (
            <div style={{ background: '#eef0e4', border: '1px solid #d9dec4', borderRadius: 14, padding: '14px 16px', fontSize: 14, color: '#5a6b3f', lineHeight: 1.55 }}>
              Link sent. Open the email on this device and tap the link; it brings you straight back here, signed in.
            </div>
          ) : (
            <form onSubmit={sendLink}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{ width: '100%', boxSizing: 'border-box', padding: '13px 16px', borderRadius: 999, border: `1px solid #d9cbb2`, background: C.cream, fontSize: 16, outline: 'none', fontFamily: 'inherit', marginBottom: 12 }}
              />
              {error && <p style={{ fontSize: 13, color: '#c24e1d', margin: '0 0 10px' }}>{error}</p>}
              <button type="submit" style={{ width: '100%', border: 'none', background: C.ink, color: C.cream2, fontFamily: heading, fontWeight: 600, fontSize: 15, padding: '13px 0', borderRadius: 999, cursor: 'pointer' }}>
                Send sign-in link
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  /* ---------- signed in but not the admin ---------- */
  if (denied) {
    return (
      <div style={{ ...page, display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: heading, fontWeight: 600, fontSize: 20, marginBottom: 8 }}>Nothing here for this account.</div>
          <button onClick={() => supabase.auth.signOut()} style={{ border: '1.5px solid #d9cbb2', background: C.card, color: C.ink, fontFamily: heading, fontWeight: 600, fontSize: 14, padding: '10px 22px', borderRadius: 999, cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return <div style={page}><p style={{ color: C.muted }}>{error || 'Loading…'}</p></div>;

  /* ---------- the dashboard ---------- */
  const tile: React.CSSProperties = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: '16px 20px', flex: '1 1 130px' };
  const th: React.CSSProperties = { textAlign: 'left', fontFamily: heading, fontWeight: 600, fontSize: 12, letterSpacing: '0.07em', color: C.muted, padding: '8px 10px', borderBottom: `1px solid ${C.border}` };
  const td: React.CSSProperties = { fontSize: 13.5, padding: '9px 10px', borderBottom: `1px solid ${C.band}`, verticalAlign: 'top' };

  return (
    <div style={page}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', marginBottom: 22 }}>
          <div style={{ fontFamily: heading, fontWeight: 600, fontSize: 24 }}>🐾 Waitlist dashboard</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <a href="/" style={{ textDecoration: 'none', border: 'none', background: C.orange, color: '#fff', fontFamily: heading, fontWeight: 600, fontSize: 13, padding: '9px 18px', borderRadius: 999, cursor: 'pointer' }}>
              ← Back to proxypaw.com
            </a>
            <button onClick={() => supabase.auth.signOut()} style={{ border: '1.5px solid #d9cbb2', background: C.card, color: C.ink, fontFamily: heading, fontWeight: 600, fontSize: 13, padding: '9px 18px', borderRadius: 999, cursor: 'pointer' }}>
              Sign out
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 22 }}>
          {[
            { label: 'Total signups', value: stats.total, color: C.ink },
            { label: 'Pet parents', value: stats.owners, color: C.orange },
            { label: 'Volunteers', value: stats.walkers, color: C.green },
            { label: 'Invited', value: stats.invited, color: C.gold },
            { label: 'Communities', value: stats.byCommunity.length, color: C.muted },
          ].map((t) => (
            <div key={t.label} style={tile}>
              <div style={{ fontFamily: heading, fontWeight: 600, fontSize: 26, color: t.color }}>{t.value}</div>
              <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>{t.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {(['communities', 'signups', 'feedback'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ border: 'none', background: tab === t ? C.ink : C.card, color: tab === t ? C.cream2 : C.muted, fontFamily: heading, fontWeight: 600, fontSize: 13.5, padding: '10px 20px', borderRadius: 999, cursor: 'pointer', outline: tab === t ? 'none' : `1px solid ${C.border}` }}>
              {t === 'communities' ? 'By community' : t === 'signups' ? `Signups (${stats.rows.length})` : `Feedback (${stats.feedback.length})`}
            </button>
          ))}
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, overflow: 'auto' }}>
          {tab === 'communities' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
              <thead><tr><th style={th}>COMMUNITY</th><th style={th}>PET PARENTS</th><th style={th}>VOLUNTEERS</th><th style={th}>TOTAL</th><th style={th}>INVITED</th></tr></thead>
              <tbody>
                {stats.byCommunity.map((c) => (
                  <tr key={c.community}>
                    <td style={{ ...td, fontWeight: 700 }}>{c.community}</td>
                    <td style={{ ...td, color: C.orange }}>{c.owners}</td>
                    <td style={{ ...td, color: C.green }}>{c.walkers}</td>
                    <td style={td}>{c.owners + c.walkers}</td>
                    <td style={td}>{c.invited}</td>
                  </tr>
                ))}
                {stats.byCommunity.length === 0 && <tr><td style={td} colSpan={5}>No signups yet.</td></tr>}
              </tbody>
            </table>
          )}

          {tab === 'signups' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
              <thead><tr><th style={th}>WHEN</th><th style={th}>NAME</th><th style={th}>ROLE</th><th style={th}>COMMUNITY</th><th style={th}>CONTACT</th><th style={th}>NOTE</th><th style={th}>INVITED</th></tr></thead>
              <tbody>
                {stats.rows.map((r) => (
                  <tr key={r.id}>
                    <td style={{ ...td, whiteSpace: 'nowrap', color: C.muted2 }}>{new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    <td style={{ ...td, fontWeight: 700 }}>{r.name}</td>
                    <td style={td}>
                      <span style={{ background: r.role === 'walker' ? '#eef0e4' : '#f9e7da', color: r.role === 'walker' ? '#3f6c51' : '#c24e1d', fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>
                        {r.role === 'walker' ? 'volunteer' : 'owner'}
                      </span>
                      {r.id_proof && <div style={{ fontSize: 11, color: C.muted2, marginTop: 4 }}>{r.id_proof}</div>}
                    </td>
                    <td style={td}>{r.community}</td>
                    <td style={td}><div>{r.email}</div><div style={{ color: C.muted2 }}>{r.phone}</div></td>
                    <td style={{ ...td, maxWidth: 260, fontSize: 12.5, color: C.muted }}>{r.cover_letter ?? '—'}</td>
                    <td style={td}>
                      <button onClick={() => toggleInvited(r)} style={{ border: 'none', cursor: 'pointer', borderRadius: 999, padding: '5px 13px', fontSize: 12, fontWeight: 700, fontFamily: heading, background: r.invited_at ? C.gold : C.band, color: C.ink }}>
                        {r.invited_at ? 'invited ✓' : 'mark invited'}
                      </button>
                    </td>
                  </tr>
                ))}
                {stats.rows.length === 0 && <tr><td style={td} colSpan={7}>No signups yet.</td></tr>}
              </tbody>
            </table>
          )}

          {tab === 'feedback' && (
            <div style={{ padding: 6 }}>
              {stats.feedback.map((f, i) => (
                <div key={i} style={{ padding: '12px 14px', borderBottom: `1px solid ${C.band}` }}>
                  <div style={{ fontSize: 12, color: C.muted2, marginBottom: 4 }}>
                    {new Date(f.created_at).toLocaleString('en-IN')} · {f.role === 'walker' ? 'volunteer' : 'owner'}{f.email ? ` · ${f.email}` : ''}
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.55 }}>{f.message}</div>
                </div>
              ))}
              {stats.feedback.length === 0 && <div style={{ padding: 16, fontSize: 14, color: C.muted }}>No feedback yet.</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
