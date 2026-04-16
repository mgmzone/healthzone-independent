-- Migration: Welcome + milestone_reminder email types, trigger update, and
-- per-milestone reminder tracking.
-- Date: 2026-04-16
--
-- The bearer token used for authenticating the pg_net callback to
-- send-welcome-email is fetched at runtime from Supabase Vault via
-- public.get_cron_secret() (defined in migration 20260430). No secret is
-- embedded in this file.

alter table public.email_templates drop constraint if exists valid_template_type;
alter table public.email_templates drop constraint if exists email_templates_type_check;
alter table public.email_templates add constraint email_templates_type_check
  check (type in ('profile_completion','inactivity_reminder','weekly_summary','welcome','milestone_reminder'));

alter table public.profiles
  add column if not exists welcome_email_sent_at timestamptz;

alter table public.period_milestones
  add column if not exists reminder_sent_7d_at timestamptz,
  add column if not exists reminder_sent_1d_at timestamptz;

-- Extend handle_new_user to fire the welcome email via pg_net (non-blocking).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', '')
  )
  on conflict (id) do nothing;

  begin
    perform net.http_post(
      url := 'https://kvmvekesxdzwodnfabdr.supabase.co/functions/v1/send-welcome-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || public.get_cron_secret()
      ),
      body := json_build_object('userId', new.id)::jsonb
    );
  exception when others then
    -- Swallow: signup must not fail if email delivery hiccups.
    null;
  end;

  return new;
end;
$$;
