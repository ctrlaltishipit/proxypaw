-- Launch loop: mark waitlist rows as invited from the admin dashboard.
alter table public.waitlist
  add column if not exists invited_at timestamptz;
