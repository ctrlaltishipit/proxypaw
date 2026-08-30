-- Volunteer registrations share the waitlist table (role='walker') and add
-- which ID proof they can present at onboarding. We deliberately store the
-- document TYPE only — never the number or a scan. Actual verification
-- happens in person at onboarding; collecting Aadhaar/PAN numbers through a
-- public form would make this table a DPDP-sensitive honeypot for no benefit.

alter table public.waitlist
  add column if not exists id_proof text
    check (id_proof in ('aadhaar', 'pan', 'driving-licence', 'passport', 'voter-id'));
