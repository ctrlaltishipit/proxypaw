/**
 * join-waitlist, records a proxypaw early-access signup and emails a confirmation.
 *
 * Called straight from the signup form. There is no account and no JWT to
 * verify, so unlike buddyai's version this endpoint is public and has to do its
 * own validation: field checks, a honeypot, and a per-IP rate limit. The
 * service-role key never leaves the function.
 *
 * Secrets (set with `supabase secrets set`):
 *   RESEND_API_KEY   from resend.com
 *   WAITLIST_FROM    e.g. "proxypaw <hello@proxypaw.com>"  (domain must be verified)
 *
 * SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.
 * Without RESEND_API_KEY the signup still saves, only the email is skipped.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

/** In-memory, per-instance. Not bulletproof across cold starts, enough to blunt a script. */
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function welcomeEmail(name: string, community: string, role: string): { subject: string; html: string; text: string } {
  const who = name || "there";
  const walker = role === "walker";
  const subject = walker
    ? `You're registered as a proxypaw volunteer, ${who}`
    : `You're on the proxypaw waitlist, ${who}`;

  const walkerIntro = walker
    ? `Thank you for registering as a proxypaw volunteer. We will get back to you shortly, we're going ` +
      `through the information you sent and reviewing everything, including your note about your ` +
      `experience with pets. If you'd like to revise anything, just write to us through the feedback ` +
      `form that appears right after you register.\n\n` +
      `What happens next: ID verification, a short conversation, our safety training, and then you ` +
      `can start accepting walks, visits and boarding in your community, keeping 70% of every booking.\n\n`
    : `You've been added to the proxypaw waitlist. We'll notify you shortly about your access.\n\n`;
  const text =
    `Hi ${who},\n\n` +
    walkerIntro +
    `We're opening community by community, and yours, ${community}, is on our map. ` +
    `The moment we have verified walkers and sitters in your towers, you'll be among the first in.\n\n` +
    `proxypaw is walks, cat home visits and overnight boarding from neighbours who live in your own ` +
    `gated community. Every one of them Aadhaar-checked, every booking GPS-tracked and insured.\n\n` +
    `There's nothing else you need to do. We'll email you when your access is ready.\n\n` +
    `Give your pet a scratch behind the ears from us.\n\n` +
    `Deekshitha\nFounder, proxypaw\n\n` +
    `You're getting this because you joined the waitlist at proxypaw.com\n`;

  // Deliberately flat markup: Gmail collapses deeply nested tables behind a
  // "show trimmed content" toggle, which breaks the layout on mobile.
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<meta name="color-scheme" content="light"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#f6f1e7;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f6f1e7;">
<tr><td align="center" style="padding:40px 20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;background:#fffdf8;border:1px solid #eee3cf;border-radius:16px;">
<tr><td style="padding:40px 36px;font-family:-apple-system, BlinkMacSystemFont,'Segoe UI', Helvetica, Arial, sans-serif;color:#2a2118;">
<div style="width:52px;height:52px;border-radius:16px;background:#e0662f;text-align:center;line-height:52px;font-size:26px;margin:0 0 24px;">&#128062;</div>
<h1 style="margin:0 0 20px;font-size:25px;line-height:1.25;font-weight:700;color:#2a2118;">You're on the list.</h1>
<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#4a3f33;">Hi ${who},</p>
<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#4a3f33;">${walker
  ? "Thank you for registering as a proxypaw volunteer. We will get back to you shortly, we're going through the information you sent and reviewing everything, including your note about your experience with pets. If you'd like to revise anything, just write to us through the feedback form that appears right after you register."
  : "You've been added to the proxypaw waitlist. We'll notify you shortly about your access."}</p>
${walker ? `<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#4a3f33;">What happens next: ID verification, a short conversation, our safety training, and then you can start accepting walks, visits and boarding in your community, keeping <strong style="color:#2a2118;">70%</strong> of every booking.</p>` : ""}
<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#4a3f33;">We're opening community by community, and yours, <strong style="color:#2a2118;">${community}</strong>, is on our map. The moment we have verified walkers and sitters in your towers, you'll be among the first in.</p>
<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#4a3f33;">proxypaw is walks, cat home visits and overnight boarding from neighbours who live in your own gated community. Every one of them Aadhaar-checked, every booking GPS-tracked and insured.</p>
<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#4a3f33;">There's nothing else you need to do. We'll email you when your access is ready.</p>
<p style="margin:0 0 28px;font-size:16px;line-height:1.65;color:#4a3f33;">Give your pet a scratch behind the ears from us.</p>
<p style="margin:0;font-size:16px;line-height:1.5;color:#2a2118;font-weight:600;">Deekshitha</p>
<p style="margin:0 0 32px;font-size:14px;line-height:1.5;color:#8b7a63;">Founder, proxypaw</p>
<p style="margin:0;padding-top:22px;border-top:1px solid #eee3cf;font-size:12.5px;line-height:1.6;color:#a08e73;">You're getting this because you joined the waitlist at <a href="https://www.proxypaw.com" style="color:#c24e1d;text-decoration:none;">proxypaw.com</a>.</p>
</td></tr></table>
</td></tr></table>
</body></html>`;

  return { subject, html, text };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) return json({ error: "Too many attempts. Try again in a minute." }, 429);

  let body: Record<string, string> = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  // Honeypot: a field hidden from humans. Anything filling it is a bot, return
  // 200 so it can't tell it was caught.
  if ((body.website ?? "").trim() !== "") return json({ ok: true, emailed: false });

  const name = (body.name ?? "").trim().slice(0, 80);
  const email = (body.email ?? "").trim().toLowerCase().slice(0, 160);
  const phone = (body.phone ?? "").trim().slice(0, 24);
  const community = (body.community ?? "").trim().slice(0, 120);
  const role = body.role === "walker" ? "walker" : "owner";
  const ID_PROOFS = ["aadhaar", "pan", "driving-licence", "passport", "voter-id"];
  const idProof = ID_PROOFS.includes(body.id_proof ?? "") ? body.id_proof! : null;
  const coverLetter = (body.cover_letter ?? "").trim().slice(0, 1600) || null;

  if (!name) return json({ error: "Please tell us your name." }, 400);
  if (!EMAIL_RE.test(email)) return json({ error: "That email doesn't look right." }, 400);
  if (phone.replace(/\D/g, "").length < 10) return json({ error: "Please enter a valid phone number." }, 400);
  if (!community) return json({ error: "Please pick your community." }, 400);
  if (role === "walker" && (!coverLetter || coverLetter.length < 40)) {
    return json({ error: "Please tell us a bit more about your experience with pets." }, 400);
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const { data: existing } = await admin
    .from("waitlist")
    .select("id, welcomed_at")
    .eq("email", email)
    .maybeSingle();

  const { error: upsertErr } = await admin
    .from("waitlist")
    .upsert(
      { name, email, phone, community, role, id_proof: idProof, cover_letter: coverLetter, source: body.source ?? null },
      { onConflict: "email" },
    );
  if (upsertErr) {
    console.error("upsert failed", upsertErr);
    return json({ error: "Could not save your spot. Please try again." }, 500);
  }

  // Only ever email once, even if they submit the form again.
  if (existing?.welcomed_at) {
    return json({ ok: true, alreadyOnList: true, emailed: false });
  }

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("WAITLIST_FROM") ?? "proxypaw <onboarding@resend.dev>";
  let emailed = false;

  if (resendKey) {
    const { subject, html, text } = welcomeEmail(name.split(" ")[0], community, role);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [email], subject, html, text }),
    });
    emailed = res.ok;
    if (!res.ok) console.error("resend failed", res.status, await res.text());
  } else {
    console.warn("RESEND_API_KEY unset; skipping welcome email");
  }

  if (emailed) {
    await admin.from("waitlist").update({ welcomed_at: new Date().toISOString() }).eq("email", email);
  }

  return json({ ok: true, alreadyOnList: Boolean(existing), emailed });
});
