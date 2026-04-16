-- Migration: Track last-send time for system emails so the cron can
-- rate-limit and not spam users.
-- Date: 2026-04-16

alter table public.profiles
  add column if not exists last_profile_completion_email_at timestamptz,
  add column if not exists last_inactivity_email_at timestamptz;

comment on column public.profiles.last_profile_completion_email_at is 'Timestamp of most recent profile_completion email. Rate-limited to once per 7 days.';
comment on column public.profiles.last_inactivity_email_at is 'Timestamp of most recent inactivity_reminder email. Rate-limited to once per 14 days.';
