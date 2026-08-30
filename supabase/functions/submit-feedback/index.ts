/**
 * submit-feedback, stores feedback from the form shown after registration.
 *
 * Owners send app/feature feedback and testimonials; volunteers send
 * registration feedback or revisions to their submitted information.
 * Public endpoint, so it carries the same defences as join-waitlist:
 * validation, honeypot, per-IP rate limit.
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

const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 5;
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

  if ((body.website ?? "").trim() !== "") return json({ ok: true });

  const message = (body.message ?? "").trim().slice(0, 2000);
  const email = (body.email ?? "").trim().toLowerCase().slice(0, 160) || null;
  const role = body.role === "walker" ? "walker" : "owner";

  if (message.length < 3) return json({ error: "Please write a little more." }, 400);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const { error } = await admin
    .from("feedback")
    .insert({ email, role, message, source: body.source ?? null });
  if (error) {
    console.error("feedback insert failed", error);
    return json({ error: "Could not save your feedback. Please try again." }, 500);
  }

  return json({ ok: true });
});
