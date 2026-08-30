/**
 * admin-stats — data for the founder's private waitlist dashboard.
 *
 * The gate is server-side and email-based: the caller must present a valid
 * Supabase Auth session token, and the token's email must be on ADMIN_EMAILS.
 * Anyone else, signed in or not, gets 403 and zero data. The dashboard UI is
 * just a window; this function is the lock.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_EMAILS = ["deekshitha.sreerala@gmail.com"];

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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "Not signed in" }, 401);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const { data: userData, error: userErr } = await admin.auth.getUser(
    authHeader.replace("Bearer ", ""),
  );
  const email = userData?.user?.email?.toLowerCase();
  if (userErr || !email) return json({ error: "Not signed in" }, 401);
  if (!ADMIN_EMAILS.includes(email)) return json({ error: "Not authorised" }, 403);

  let body: { action?: string; id?: string; invited?: boolean } = {};
  try {
    body = await req.json();
  } catch { /* default to stats */ }

  if (body.action === "mark_invited" && body.id) {
    const { error } = await admin
      .from("waitlist")
      .update({ invited_at: body.invited === false ? null : new Date().toISOString() })
      .eq("id", body.id);
    if (error) return json({ error: "Update failed" }, 500);
    return json({ ok: true });
  }

  const { data: rows, error: rowsErr } = await admin
    .from("waitlist")
    .select("id, name, email, phone, community, role, id_proof, cover_letter, source, invited_at, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (rowsErr) return json({ error: "Read failed" }, 500);

  const { data: feedback } = await admin
    .from("feedback")
    .select("email, role, message, source, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const byCommunity: Record<string, { community: string; owners: number; walkers: number; invited: number }> = {};
  let owners = 0, walkers = 0, invited = 0;
  for (const r of rows ?? []) {
    const c = (byCommunity[r.community] ??= { community: r.community, owners: 0, walkers: 0, invited: 0 });
    if (r.role === "walker") { walkers++; c.walkers++; } else { owners++; c.owners++; }
    if (r.invited_at) { invited++; c.invited++; }
  }

  return json({
    total: rows?.length ?? 0,
    owners,
    walkers,
    invited,
    byCommunity: Object.values(byCommunity).sort((a, b) => (b.owners + b.walkers) - (a.owners + a.walkers)),
    rows: rows ?? [],
    feedback: feedback ?? [],
  });
});
