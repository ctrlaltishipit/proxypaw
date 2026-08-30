-- Volunteer cover letters + a feedback table for post-registration feedback.

-- Why they want to volunteer / their pet experience (~200 words). Required
-- for role='walker' — enforced by the Edge Function, not a constraint, so
-- old rows stay valid.
alter table public.waitlist
  add column if not exists cover_letter text;

-- Feedback from the form shown after registration. Owners send app/feature
-- feedback and testimonials; volunteers send registration feedback and
-- revisions to their submitted info.
create table if not exists public.feedback (
  id          uuid primary key default gen_random_uuid(),
  email       text,
  role        text not null default 'owner' check (role in ('owner', 'walker')),
  message     text not null,
  source      text,
  created_at  timestamptz not null default now()
);

create index if not exists feedback_created_at_idx on public.feedback (created_at desc);

-- Same posture as waitlist: RLS on, zero policies. Only the Edge Function's
-- service-role key can read or write.
alter table public.feedback enable row level security;

comment on table public.feedback is
  'Post-registration feedback. Written only by the submit-feedback Edge Function.';
