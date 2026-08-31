-- Volunteer eligibility + document uploads.
--
-- Documents live in the PRIVATE volunteer-docs bucket (created below), only
-- reachable with the service-role key: the join-waitlist function writes,
-- admin-stats hands the admin short-lived signed URLs. The waitlist row
-- stores only storage paths, never file contents.

alter table public.waitlist
  add column if not exists dob date,
  add column if not exists aadhaar_path text,
  add column if not exists pan_path text,
  add column if not exists dl_path text,
  add column if not exists consent_terms boolean not null default false,
  add column if not exists consent_docs boolean not null default false,
  add column if not exists consent_bgc boolean not null default false,
  add column if not exists consented_at timestamptz;

-- Private bucket; storage.objects RLS has no anon policies, so only the
-- service role can read or write it.
insert into storage.buckets (id, name, public)
values ('volunteer-docs', 'volunteer-docs', false)
on conflict (id) do nothing;
