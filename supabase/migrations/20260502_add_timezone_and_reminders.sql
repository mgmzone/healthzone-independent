-- Migration: user time zone + daily reminder email preference
-- Date: 2026-05-02
--
-- Adds the fields the new email system needs:
--   time_zone            IANA tz (e.g. America/New_York). Used by the
--                        daily-reminder cron to pick the right users each
--                        hour and by both emails to compute "today" in the
--                        user's local frame.
--   daily_reminder_enabled Opt-in toggle for the nightly 8pm summary.
--                        Off by default so existing users don't start
--                        receiving mail they didn't ask for.
--
-- Default time zone is UTC so we never produce a null; the UI should nudge
-- new users to confirm/override on their first profile visit.

alter table public.profiles
  add column if not exists time_zone text not null default 'UTC',
  add column if not exists daily_reminder_enabled boolean not null default false;

-- Seed the three known users with their real time zones so they don't
-- have to visit Profile > Health just to get the feature working.
-- Name-based match is safe here — we verified each first_name is unique
-- in the profiles table. For future users we rely on the UI default.
update public.profiles set time_zone = 'America/New_York'   where first_name = 'Mark'    and last_name = 'Myers';
update public.profiles set time_zone = 'America/Los_Angeles' where first_name = 'Robey'   and last_name = 'Diaz';
update public.profiles set time_zone = 'America/Sao_Paulo'   where first_name = 'gustavo' and last_name = 'santos';

-- Index supports the hourly cron that selects users whose local hour now
-- equals 20 (8 PM). Small table today, but we'll grow into it.
create index if not exists idx_profiles_daily_reminder_tz
  on public.profiles(time_zone)
  where daily_reminder_enabled = true;
