-- Migration: pg_cron jobs for the two new emails
-- Date: 2026-05-04
--
-- send-daily-reminders-hourly — fires every hour on the 0th minute.
-- The edge function filters for users whose *local* hour right now equals
-- 8 PM, so most fires end up sending zero messages; that's fine.
--
-- send-admin-daily-digest — fires once a day at 10:00 UTC (6 AM US/Eastern)
-- so Eastern admins get it with coffee. The email covers "yesterday" for
-- every user in their own timezone.
--
-- Both jobs call get_cron_secret() so the bearer token isn't embedded in
-- committed migrations. Same pattern the existing jobs use.

select cron.schedule(
  'send-daily-reminders-hourly',
  '0 * * * *',
  $$
  select net.http_post(
    url := 'https://kvmvekesxdzwodnfabdr.supabase.co/functions/v1/send-daily-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || public.get_cron_secret()
    ),
    body := '{}'::jsonb
  );
  $$
);

select cron.schedule(
  'send-admin-daily-digest',
  '0 10 * * *',
  $$
  select net.http_post(
    url := 'https://kvmvekesxdzwodnfabdr.supabase.co/functions/v1/send-admin-daily-digest',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || public.get_cron_secret()
    ),
    body := '{}'::jsonb
  );
  $$
);
