-- Proxypaw early-access waitlist.
--
-- One row per person. Unlike buddyai's waitlist there is no auth.users FK:
-- signup here is a plain form (name, phone, email, community) with no account,
-- so email is the natural key.
--
-- Nothing writes here from the browser. The join-waitlist Edge Function does
-- the insert with the service-role key.

create table if not exists public.waitlist (
  id           uuid primary key default gen_random_uuid(),
  name         text        not null,
  email        text        not null,
  phone        text        not null,
  community    text        not null,
  role         text        not null default 'owner'
                 check (role in ('owner', 'walker')),
  source       text,
  welcomed_at  timestamptz,
  created_at   timestamptz not null default now()
);

-- One signup per email; the function upserts on this. Must be a plain-column
-- index, not lower(email): ON CONFLICT can't target an expression index, and
-- the function already lowercases the address before it inserts.
create unique index if not exists waitlist_email_key on public.waitlist (email);
create index if not exists waitlist_created_at_idx on public.waitlist (created_at desc);
create index if not exists waitlist_community_idx on public.waitlist (community);

-- RLS on with NO policies: PostgREST exposes every public table to the anon
-- key, so without this anyone could read the full signup list — names, phone
-- numbers and emails. The Edge Function uses the service-role key, which
-- bypasses RLS by design.
alter table public.waitlist enable row level security;

comment on table public.waitlist is
  'Early-access signups. Written only by the join-waitlist Edge Function.';
