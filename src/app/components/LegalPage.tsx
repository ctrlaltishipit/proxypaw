/**
 * LegalPage: /privacy (the privacy note) and /terms (terms and conditions).
 *
 * The words live in data/legal.ts; this file only lays them out, in the
 * Garden Community system (DESIGN.md): garden canvas, ink text, greens as soft
 * tints, glass controls, no icons in front of words.
 *
 * Layout: a calm header with the title, the last-updated line and a switch
 * between the two pages; "At a glance"; then numbered sections, each opening
 * with a one-line "In short" card. On desktop a sticky table of contents
 * follows the reader; on phones it becomes a compact "Jump to" control pinned
 * under the site header. Nothing fades or moves while you read: this is the
 * one place on the site where the text must simply stay put.
 */
import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSeo } from '../lib/seo';
import { T, head, body } from './landing/ui';
import { LEGAL, UPDATED, type Block } from '../data/legal';

/** Inline links written as [label](/path) or [label](https://…). */
function Rich({ text }: { text: string }) {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const [, label, href] = m;
    out.push(
      href.startsWith('/')
        ? <Link key={m.index} to={href} className="lg-a">{label}</Link>
        : <a key={m.index} href={href} target="_blank" rel="noreferrer" className="lg-a">{label}</a>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

function BlockView({ b }: { b: Block }) {
  if ('p' in b) return <p className="lg-p"><Rich text={b.p} /></p>;
  if ('h' in b) return <h3 className="lg-h3">{b.h}</h3>;
  if ('ul' in b) return <ul className="lg-ul">{b.ul.map((t) => <li key={t}><Rich text={t} /></li>)}</ul>;
  if ('dl' in b) {
    return (
      <dl className="lg-dl">
        {b.dl.map(([term, text]) => (
          <div key={term} className="lg-dl-row">
            <dt>{term}</dt>
            <dd><Rich text={text} /></dd>
          </div>
        ))}
      </dl>
    );
  }
  if ('rows' in b) {
    const { head: h, items } = b.rows;
    return (
      <div className="lg-rows" role="table">
        <div className="lg-row lg-row-head" role="row">
          {h.map((c) => <div key={c} role="columnheader">{c}</div>)}
        </div>
        {items.map((r) => (
          <div key={r[0]} className="lg-row" role="row">
            {r.map((c, i) => <div key={i} role="cell" data-label={h[i]}><Rich text={c} /></div>)}
          </div>
        ))}
      </div>
    );
  }
  return (
    <aside className="lg-note">
      <div className="lg-note-k">Before booking opens</div>
      <p><Rich text={b.note} /></p>
    </aside>
  );
}

const SB_URL = import.meta.env.VITE_SUPABASE_URL ?? 'https://tiodckftpybxwbekxske.supabase.co';

/**
 * "Write to us": the working way to reach ProxyPaw from these pages. It posts to
 * the same endpoint as the feedback box (supabase/functions/submit-feedback), so
 * messages land in the founder's dashboard under Feedback, tagged legal-privacy
 * or legal-terms. No address is published because none is confirmed yet.
 */
function ContactForm({ kind }: { kind: 'privacy' | 'terms' }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [trap, setTrap] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [err, setErr] = useState('');

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setErr('Enter the email address we should reply to.'); return; }
    if (message.trim().length < 10) { setErr('Tell us a little more, so we know how to help.'); return; }
    setErr(''); setState('sending');
    try {
      const res = await fetch(`${SB_URL}/functions/v1/submit-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role: 'owner', message: message.trim(), source: `legal-${kind}`, website: trap }),
      });
      setState(res.ok ? 'sent' : 'error');
    } catch {
      setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <div className="lg-form" role="status">
        <div className="lg-form-t">Your message has reached us.</div>
        <p className="lg-form-d">Thank you. We will reply to {email.trim()}.</p>
      </div>
    );
  }
  return (
    <form className="lg-form" onSubmit={send} noValidate>
      <div className="lg-form-t">Write to us</div>
      <p className="lg-form-d">
        {kind === 'privacy'
          ? 'Ask to see, correct or delete your details, withdraw your consent, or raise a concern.'
          : 'Ask a question about these terms, report a problem, or raise a complaint.'}
      </p>
      <label htmlFor="lg-email">Your email address</label>
      <input id="lg-email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      <label htmlFor="lg-msg">Your message</label>
      <textarea id="lg-msg" rows={5} maxLength={2000} value={message} onChange={(e) => setMessage(e.target.value)} />
      {/* Left empty by people; filled in by bots. */}
      <input className="lg-trap" tabIndex={-1} autoComplete="off" aria-hidden="true" value={trap} onChange={(e) => setTrap(e.target.value)} />
      {err && <div className="lg-form-err" role="alert">{err}</div>}
      {state === 'error' && <div className="lg-form-err" role="alert">That did not send. Please try again in a minute.</div>}
      <div className="lg-form-row">
        <button type="submit" className="pp-glass-btn pp-glass-primary" disabled={state === 'sending'}>{state === 'sending' ? 'Sending' : 'Send message'}</button>
        <span>We use your email address only to reply to you.</span>
      </div>
    </form>
  );
}

const CSS = `
.lg-form { background: ${T.surface}; border: 1px solid ${T.line}; border-radius: 22px; padding: clamp(18px, 2.4vw, 26px); margin: 18px 0 6px; max-width: 70ch; box-sizing: border-box; box-shadow: 0 18px 44px rgba(28,60,40,.08); }
.lg-form-t { font-family: ${head}; font-weight: 800; font-size: 20px; letter-spacing: -.02em; color: ${T.ink}; }
.lg-form-d { margin: 6px 0 16px; font-size: 15.5px; line-height: 1.6; color: ${T.sub}; }
.lg-form label { display: block; font-size: 13.5px; font-weight: 600; color: ${T.sub}; margin: 12px 0 6px; }
.lg-form input, .lg-form textarea { width: 100%; box-sizing: border-box; font: inherit; font-size: 16px; color: ${T.ink}; background: ${T.canvas2}; border: 1.5px solid ${T.line2}; border-radius: 14px; padding: 12px 14px; outline: none; transition: border-color .2s, box-shadow .2s; }
.lg-form textarea { resize: vertical; min-height: 120px; line-height: 1.55; }
.lg-form input:focus, .lg-form textarea:focus { border-color: ${T.leaf}; box-shadow: 0 0 0 4px ${T.leafGlass}; }
.lg-trap { position: absolute !important; left: -9999px; width: 1px !important; height: 1px; opacity: 0; }
.lg-form-err { margin-top: 10px; font-size: 14.5px; font-weight: 600; color: ${T.marigoldDark}; }
.lg-form-row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-top: 16px; }
.lg-form-row span { font-size: 13.5px; color: ${T.muted}; }
.lg { min-height: 100vh; background: ${T.canvas}; color: ${T.ink}; font-family: ${body}; text-transform: none; --lg-top: 72px; }
.lg-shell { max-width: 1200px; box-sizing: border-box; margin: 0 auto; padding-left: clamp(18px, 3vw, 28px); padding-right: clamp(18px, 3vw, 28px); }
.lg-head { padding-top: clamp(26px, 5vw, 60px); padding-bottom: clamp(22px, 3vw, 34px); animation: lg-in .7s cubic-bezier(.2,.7,.2,1) both; }
@keyframes lg-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
.lg-kicker { font-size: 12.5px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: ${T.leaf}; margin-bottom: 14px; }
.lg-h1 { font-family: ${head}; font-weight: 800; font-size: clamp(34px, 5vw, 58px); line-height: 1.04; letter-spacing: -.035em; margin: 0; }
.lg-meta { display: flex; flex-wrap: wrap; gap: 6px 14px; align-items: center; margin-top: 16px; font-size: 14px; color: ${T.muted}; }
.lg-meta b { color: ${T.ink}; font-weight: 600; }
.lg-intro { font-size: clamp(16.5px, 1.5vw, 18.5px); line-height: 1.68; color: ${T.sub}; max-width: 68ch; margin: 20px 0 0; }
.lg-switch { display: inline-flex; gap: 2px; padding: 4px; margin-top: 26px; border-radius: 999px; max-width: 100%;
  background: linear-gradient(180deg, rgba(255,255,255,.8), rgba(255,255,255,.5)); border: 1px solid rgba(255,255,255,.9);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.9), 0 1px 0 rgba(46,125,79,.14), 0 8px 22px rgba(20,48,31,.07);
  -webkit-backdrop-filter: blur(14px) saturate(1.6); backdrop-filter: blur(14px) saturate(1.6); }
.lg-switch a { font-family: ${head}; font-weight: 700; font-size: 14.5px; color: ${T.sub}; text-decoration: none; white-space: nowrap; padding: 10px 18px; border-radius: 999px; min-height: 24px; display: inline-flex; align-items: center;
  transition: background .25s ease, color .2s ease, transform .35s cubic-bezier(.34,1.56,.64,1); }
.lg-switch a:hover { color: ${T.ink}; background: rgba(255,255,255,.9); transform: translateY(-1px); }
.lg-switch a[aria-current="page"] { color: ${T.leafDeep}; background: ${T.leafGlass2}; box-shadow: inset 0 0 0 1px rgba(46,125,79,.22); transform: none; }
.lg-glance { margin-top: clamp(24px, 3vw, 36px); background: ${T.surface}; border: 1px solid ${T.line}; border-radius: 24px; padding: clamp(18px, 2.4vw, 26px) clamp(18px, 2.6vw, 30px); max-width: 860px; box-shadow: 0 18px 44px rgba(20,48,31,.06); }
.lg-glance-k { font-family: ${head}; font-weight: 800; font-size: 17px; letter-spacing: -.01em; margin-bottom: 4px; }
.lg-glance ol { list-style: none; margin: 0; padding: 0; counter-reset: g; }
.lg-glance li { counter-increment: g; display: grid; grid-template-columns: 30px 1fr; gap: 6px; padding: 12px 0; font-size: 15.5px; line-height: 1.55; color: ${T.sub}; border-top: 1px solid ${T.line}; }
.lg-glance li:first-child { border-top: none; }
.lg-glance li::before { content: counter(g); font-family: ${head}; font-weight: 800; font-size: 14px; color: ${T.marigoldDark}; padding-top: 1px; }
.lg-grid { display: grid; grid-template-columns: 250px minmax(0, 1fr); gap: clamp(28px, 5vw, 76px); align-items: start; padding-top: clamp(28px, 4vw, 52px); padding-bottom: clamp(48px, 6vw, 88px); }
.lg-toc { position: sticky; top: calc(var(--lg-top) + 22px); max-height: calc(100vh - var(--lg-top) - 44px); overflow-y: auto; padding-right: 4px; scrollbar-width: thin; }
.lg-toc-k { font-size: 11.5px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: ${T.muted2}; margin: 0 0 10px 12px; }
.lg-toc ol { list-style: none; margin: 0; padding: 0; display: grid; gap: 1px; }
.lg-toc a { display: grid; grid-template-columns: 24px 1fr; gap: 4px; padding: 7px 12px; border-radius: 12px; text-decoration: none; font-size: 13.5px; line-height: 1.4; color: ${T.muted}; transition: background .25s ease, color .2s ease; }
.lg-toc a span:first-child { font-variant-numeric: tabular-nums; color: ${T.muted2}; }
.lg-toc a:hover { color: ${T.ink}; background: rgba(255,255,255,.8); }
.lg-toc a[aria-current="true"] { color: ${T.ink}; font-weight: 600; background: ${T.leafGlass}; box-shadow: inset 0 0 0 1px rgba(46,125,79,.14); }
.lg-toc a[aria-current="true"] span:first-child { color: ${T.leaf}; }
.lg-main { max-width: 720px; min-width: 0; }
.lg-sec { scroll-margin-top: calc(var(--lg-top) + 24px); padding-bottom: clamp(34px, 4.4vw, 56px); }
.lg-sec + .lg-sec { border-top: 1px solid ${T.line}; padding-top: clamp(30px, 4vw, 48px); }
.lg-num { font-family: ${head}; font-weight: 800; font-size: 13.5px; letter-spacing: .08em; color: ${T.marigoldDark}; margin-bottom: 8px; font-variant-numeric: tabular-nums; }
.lg-h2 { font-family: ${head}; font-weight: 800; font-size: clamp(23px, 2.6vw, 30px); line-height: 1.14; letter-spacing: -.025em; margin: 0 0 16px; }
.lg-short { background: ${T.leafGlass}; border: 1px solid rgba(46,125,79,.14); box-shadow: inset 0 1px 0 rgba(255,255,255,.7); border-radius: 18px; padding: 14px 18px 15px; margin: 0 0 20px; }
.lg-short-k { font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: ${T.leaf}; margin-bottom: 5px; }
.lg-short p { margin: 0; font-size: 16px; line-height: 1.55; font-weight: 500; color: ${T.ink}; }
.lg-p { font-size: 16.5px; line-height: 1.74; color: ${T.sub}; margin: 0 0 14px; max-width: 70ch; }
.lg-h3 { font-family: ${head}; font-weight: 700; font-size: 18.5px; letter-spacing: -.015em; margin: 26px 0 12px; color: ${T.ink}; }
.lg-ul { list-style: disc outside; margin: 0 0 16px; padding: 0 0 0 22px; display: grid; gap: 9px; max-width: 70ch; }
.lg-ul li { font-size: 16px; line-height: 1.66; color: ${T.sub}; padding-left: 4px; }
.lg-ul li::marker { color: ${T.leafBright}; }
.lg-dl { margin: 0 0 16px; display: grid; gap: 0; border-top: 1px solid ${T.line}; }
.lg-dl-row { display: grid; grid-template-columns: minmax(0, 190px) minmax(0, 1fr); gap: 6px 22px; padding: 13px 0; border-bottom: 1px solid ${T.line}; }
.lg-dl dt { font-family: ${head}; font-weight: 700; font-size: 15px; color: ${T.ink}; line-height: 1.45; }
.lg-dl dd { margin: 0; font-size: 15.5px; line-height: 1.64; color: ${T.sub}; }
.lg-rows { margin: 4px 0 18px; background: ${T.surface}; border: 1px solid ${T.line}; border-radius: 18px; overflow: hidden; }
.lg-row { display: grid; grid-template-columns: 1.15fr 1fr 1.15fr; gap: 0 18px; padding: 13px 18px; font-size: 14.5px; line-height: 1.55; color: ${T.sub}; border-top: 1px solid ${T.line}; }
.lg-row > div:first-child { color: ${T.ink}; font-weight: 600; }
.lg-row-head { border-top: none; background: ${T.leafGlass}; font-size: 11.5px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
.lg-row-head > div, .lg-row-head > div:first-child { color: ${T.leaf}; font-weight: 700; }
.lg-note { background: ${T.sunPale}; border: 1px solid rgba(240,180,41,.4); border-radius: 16px; padding: 12px 16px 13px; margin: 6px 0 16px; max-width: 70ch; }
.lg-note-k { font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: ${T.marigoldDark}; margin-bottom: 4px; }
.lg-note p { margin: 0; font-size: 15px; line-height: 1.6; color: ${T.sub}; }
.lg-a { color: ${T.marigoldDark}; font-weight: 600; text-decoration: none; border-radius: 4px; transition: color .2s ease, background .2s ease; }
.lg-a:hover { color: ${T.ink}; background: ${T.marigoldPale}; }
.lg-end { background: linear-gradient(180deg, rgba(46,125,79,.11), rgba(46,125,79,.05)); border: 1px solid rgba(46,125,79,.14); box-shadow: inset 0 1px 0 rgba(255,255,255,.7); border-radius: 26px; padding: clamp(22px, 3vw, 34px); margin-top: 6px; }
.lg-end-k { font-size: 12px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: ${T.leaf}; margin-bottom: 8px; }
.lg-end h2 { font-family: ${head}; font-weight: 800; font-size: clamp(21px, 2.4vw, 27px); letter-spacing: -.02em; line-height: 1.2; margin: 0 0 8px; }
.lg-end p { margin: 0 0 20px; font-size: 15.5px; line-height: 1.6; color: ${T.sub}; max-width: 56ch; }
.lg-end-row { display: flex; flex-wrap: wrap; gap: 10px; }
.lg-end-row .pp-glass-btn { font-size: 15px; }
.lg-jump { display: none; }
.lg a:focus-visible, .lg select:focus-visible, .lg button:focus-visible { outline: 3px solid ${T.leaf}; outline-offset: 3px; }
@media (max-width: 900px) {
  .lg-grid { grid-template-columns: minmax(0, 1fr); padding-top: 14px; }
  .lg-toc { display: none; }
  .lg-jump { display: flex; align-items: center; gap: 10px; position: sticky; top: calc(var(--lg-top) + 8px); z-index: 20; margin: 0 0 22px; padding: 6px 8px 6px 16px; border-radius: 999px;
    background: linear-gradient(180deg, rgba(255,255,255,.9), rgba(255,255,255,.72)); border: 1px solid rgba(255,255,255,.95);
    box-shadow: inset 0 1px 0 #fff, 0 1px 0 rgba(46,125,79,.14), 0 12px 28px rgba(20,48,31,.12);
    -webkit-backdrop-filter: blur(16px) saturate(1.6); backdrop-filter: blur(16px) saturate(1.6); }
  .lg-jump label { font-size: 11px; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; color: ${T.leaf}; white-space: nowrap; }
  .lg-jump select { flex: 1; min-width: 0; border: none; background: ${T.leafGlass}; border-radius: 999px; padding: 10px 12px; min-height: 42px; font-family: ${head}; font-weight: 700; font-size: 16px; color: ${T.ink}; text-overflow: ellipsis; }
  .lg-sec { scroll-margin-top: calc(var(--lg-top) + 76px); }
  .lg-main { max-width: none; }
}
@media (max-width: 640px) {
  .lg-switch { display: flex; }
  .lg-switch a { flex: 1; justify-content: center; padding: 11px 10px; font-size: 14px; white-space: normal; text-align: center; line-height: 1.2; }
  .lg-dl-row { grid-template-columns: minmax(0, 1fr); gap: 3px; }
  .lg-row-head { display: none; }
  .lg-row { grid-template-columns: minmax(0, 1fr); gap: 9px; padding: 15px 16px; }
  .lg-row:nth-child(2) { border-top: none; }
  .lg-row > div[data-label]::before { content: attr(data-label); display: block; font-size: 10.5px; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; color: ${T.leaf}; margin-bottom: 2px; }
  .lg-p { font-size: 16px; } .lg-end-row .pp-glass-btn { flex: 1 1 100%; white-space: normal; text-align: center; }
}
@media (prefers-reduced-motion: reduce) { .lg-head { animation: none; } .lg * { transition: none !important; } }
@media print { .lg-toc, .lg-jump, .lg-switch, .lg-end { display: none !important; } .lg-grid { display: block; } }
`;

export default function LegalPage({ kind, onHomeClick, onBlogClick }: { kind: 'terms' | 'privacy'; onHomeClick: () => void; onBlogClick: () => void }) {
  const doc = LEGAL[kind];
  const other = LEGAL[kind === 'terms' ? 'privacy' : 'terms'];
  const rootRef = useRef<HTMLDivElement>(null);
  const tocRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(doc.sections[0].id);
  const { hash } = useLocation();

  useSeo({
    title: `${doc.title} · ProxyPaw`,
    description: doc.intro.slice(0, 155),
    path: `/${kind}`,
  });

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
    window.history.replaceState(window.history.state, '', `#${id}`);
    setActive(id);
  };

  // Keep the sticky parts clear of the site header, whatever its height.
  useEffect(() => {
    const fit = () => {
      const h = document.querySelector<HTMLElement>('header.pph')?.offsetHeight;
      if (h && rootRef.current) rootRef.current.style.setProperty('--lg-top', `${h}px`);
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  // A link such as /terms#community-guidelines opens at that section.
  useEffect(() => {
    const id = hash.replace('#', '');
    if (!id) { setActive(doc.sections[0].id); return; }
    // Jump straight there (no smooth scroll on arrival), and once more after
    // the fonts have settled, in case the text above it changed height.
    const go = () => {
      document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior });
      setActive(id);
    };
    const t1 = window.setTimeout(go, 80);
    const t2 = window.setTimeout(go, 700);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, [hash, kind, doc.sections]);

  // Mark the section being read in the table of contents and the jump control.
  useEffect(() => {
    let raf = 0;
    const ids = doc.sections.map((s) => s.id);
    const read = () => {
      raf = 0;
      const top = (document.querySelector<HTMLElement>('header.pph')?.offsetHeight ?? 72) + 120;
      let cur = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= top) cur = id;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = ids[ids.length - 1];
      setActive(cur);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(read); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); };
  }, [doc.sections]);

  // Keep the current entry visible inside the table of contents when it is long.
  useEffect(() => {
    const toc = tocRef.current;
    const link = toc?.querySelector<HTMLElement>('a[aria-current="true"]');
    if (!toc || !link) return;
    const top = link.offsetTop, bottom = top + link.offsetHeight;
    if (top < toc.scrollTop + 30) toc.scrollTop = Math.max(0, top - 30);
    else if (bottom > toc.scrollTop + toc.clientHeight - 8) toc.scrollTop = bottom - toc.clientHeight + 8;
  }, [active]);

  const num = (i: number) => String(i + 1).padStart(2, '0');

  return (
    <div ref={rootRef} className="lg">
      <style>{CSS}</style>

      <header className="lg-shell lg-head">
        <div className="lg-kicker">{doc.kicker}</div>
        <h1 className="lg-h1">{doc.title}</h1>
        <div className="lg-meta">
          <span>Last updated: <b>{UPDATED}</b></span>
          <span aria-hidden="true">·</span>
          <span>{doc.sections.length} sections, in plain language</span>
        </div>
        <p className="lg-intro">{doc.intro}</p>

        <nav className="lg-switch" aria-label="Legal pages">
          <Link to="/privacy" aria-current={kind === 'privacy' ? 'page' : undefined}>Privacy note</Link>
          <Link to="/terms" aria-current={kind === 'terms' ? 'page' : undefined}>Terms and conditions</Link>
        </nav>

        <section className="lg-glance" aria-labelledby="lg-glance-k">
          <div className="lg-glance-k" id="lg-glance-k">At a glance</div>
          <ol>{doc.glance.map((g) => <li key={g}><span>{g}</span></li>)}</ol>
        </section>
      </header>

      <div className="lg-shell lg-grid">
        <nav className="lg-toc" ref={tocRef} aria-label="On this page">
          <div className="lg-toc-k">On this page</div>
          <ol>
            {doc.sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} aria-current={active === s.id ? 'true' : undefined} onClick={(e) => { e.preventDefault(); jump(s.id); }}>
                  <span>{num(i)}</span><span>{s.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <main className="lg-main">
          <div className="lg-jump">
            <label htmlFor="lg-jump">Jump to</label>
            <select id="lg-jump" value={active} onChange={(e) => jump(e.target.value)}>
              {doc.sections.map((s, i) => <option key={s.id} value={s.id}>{i + 1}. {s.title}</option>)}
            </select>
          </div>

          {doc.sections.map((s, i) => (
            <section key={s.id} id={s.id} className="lg-sec" aria-labelledby={`${s.id}-h`}>
              <div className="lg-num">{num(i)}</div>
              <h2 className="lg-h2" id={`${s.id}-h`}>{s.title}</h2>
              <div className="lg-short">
                <div className="lg-short-k">In short</div>
                <p>{s.short}</p>
              </div>
              {s.blocks.map((b, n) => <BlockView key={n} b={b} />)}
              {s.id === 'contact' && <ContactForm kind={kind} />}
            </section>
          ))}

          <div className="lg-end">
            <div className="lg-end-k">Read next</div>
            <h2>{kind === 'privacy' ? 'The rules for using ProxyPaw' : 'How we look after your details'}</h2>
            <p>
              {kind === 'privacy'
                ? 'The terms and conditions cover bookings, prices, the community guidelines for pet parents and volunteers, and what happens when something goes wrong.'
                : 'The privacy note covers what we collect, why, where it is kept, who can see it, and how to see, correct or delete it.'}
            </p>
            <div className="lg-end-row">
              <Link className="pp-glass-btn" to={`/${other.kind}`}>Read the {other.title.toLowerCase()}</Link>
              <button className="pp-glass-btn" onClick={onHomeClick}>Back to the home page</button>
              <button className="pp-glass-btn" onClick={onBlogClick}>Read the Paw Journal</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
