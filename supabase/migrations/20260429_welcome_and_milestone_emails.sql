-- Migration: Welcome + milestone_reminder email types, trigger update, and
-- per-milestone reminder tracking.
-- Date: 2026-04-16

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
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer d48dcc847d4c93fc9ee90523e5878a97d4ca839187fd0399fa3dfdf81ac36407"}'::jsonb,
      body := json_build_object('userId', new.id)::jsonb
    );
  exception when others then
    -- Swallow: signup must not fail if email delivery hiccups.
    null;
  end;

  return new;
end;
$$;
