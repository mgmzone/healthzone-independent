-- Migration: RPCs for the daily reminder + admin digest crons
-- Date: 2026-05-03
--
-- profiles_due_for_daily_reminder(target_hour) — hourly cron picks users
-- whose opt-in flag is on AND whose *local* hour right now equals the
-- target. SQL-side filter keeps the edge function from doing this math
-- per-row.
--
-- daily_active_users(target_date) — admin digest: users who logged any of
-- the tracked surfaces (weight / meal / exercise / fasting / journal /
-- goal entry) on their local `target_date`. For simplicity the caller
-- passes the date already computed in the admin's timezone.
--
-- daily_ai_cost_by_user(target_date) — admin digest: dollar cost of Claude
-- API calls per user for the target UTC date. Keyed by UTC date to match
-- how ai_usage_logs stores created_at; not per-user-tz to keep this fast
-- and to treat "cost" as a global accounting concern.

create or replace function public.profiles_due_for_daily_reminder(target_hour int)
returns table (
  id uuid,
  first_name text,
  last_name text,
  time_zone text,
  target_meals_per_day smallint,
  protein_target_min numeric,
  protein_target_max numeric,
  email_unsubscribe_token uuid
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.first_name,
    p.last_name,
    p.time_zone,
    p.target_meals_per_day,
    p.protein_target_min,
    p.protein_target_max,
    p.email_unsubscribe_token
  from public.profiles p
  where p.daily_reminder_enabled = true
    and extract(hour from (now() at time zone p.time_zone))::int = target_hour;
$$;

revoke all on function public.profiles_due_for_daily_reminder(int) from public;
grant execute on function public.profiles_due_for_daily_reminder(int) to service_role;


create or replace function public.daily_active_users(target_date date)
returns table (
  user_id uuid,
  first_name text,
  last_name text,
  time_zone text,
  logged_weight boolean,
  logged_meal boolean,
  logged_exercise boolean,
  logged_fasting boolean,
  logged_journal boolean,
  logged_goal boolean
)
language sql
stable
security definer
set search_path = public
as $$
  with user_days as (
    -- Build each user's "today in their tz" up-front so the joins below
    -- can compare to the right date per-user.
    select
      p.id as user_id,
      p.first_name,
      p.last_name,
      p.time_zone,
      (now() at time zone p.time_zone)::date as local_today
    from public.profiles p
  )
  select
    u.user_id,
    u.first_name,
    u.last_name,
    u.time_zone,
    exists (select 1 from weigh_ins w where w.user_id = u.user_id and w.date = u.local_today) as logged_weight,
    exists (select 1 from meal_logs m where m.user_id = u.user_id and m.date = u.local_today) as logged_meal,
    exists (select 1 from exercise_logs e where e.user_id = u.user_id and e.date = u.local_today) as logged_exercise,
    exists (select 1 from fasting_logs f where f.user_id = u.user_id
            and (f.start_time at time zone u.time_zone)::date = u.local_today) as logged_fasting,
    exists (select 1 from journal_entries j where j.user_id = u.user_id and j.entry_date = u.local_today) as logged_journal,
    exists (select 1 from daily_goal_entries g where g.user_id = u.user_id and g.date = u.local_today and g.met = true) as logged_goal
  from user_days u
  where target_date is not null -- keep the signature consistent; target_date accepted for future tz-of-admin use but we already compute per-user local today above
    and exists (
      select 1 from weigh_ins w where w.user_id = u.user_id and w.date = u.local_today
      union all
      select 1 from meal_logs m where m.user_id = u.user_id and m.date = u.local_today
      union all
      select 1 from exercise_logs e where e.user_id = u.user_id and e.date = u.local_today
      union all
      select 1 from fasting_logs f where f.user_id = u.user_id
             and (f.start_time at time zone u.time_zone)::date = u.local_today
      union all
      select 1 from journal_entries j where j.user_id = u.user_id and j.entry_date = u.local_today
      union all
      select 1 from daily_goal_entries g where g.user_id = u.user_id and g.date = u.local_today and g.met = true
    );
$$;

revoke all on function public.daily_active_users(date) from public;
grant execute on function public.daily_active_users(date) to service_role;


create or replace function public.daily_ai_cost_by_user(target_date date)
returns table (
  user_id uuid,
  first_name text,
  last_name text,
  own_key_usd numeric,
  fallback_usd numeric,
  total_usd numeric,
  call_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    l.user_id,
    p.first_name,
    p.last_name,
    coalesce(sum(case when l.used_fallback_key = false then l.cost_usd else 0 end), 0)::numeric as own_key_usd,
    coalesce(sum(case when l.used_fallback_key = true  then l.cost_usd else 0 end), 0)::numeric as fallback_usd,
    coalesce(sum(l.cost_usd), 0)::numeric as total_usd,
    count(*) as call_count
  from ai_usage_logs l
  left join profiles p on p.id = l.user_id
  where l.created_at >= target_date::timestamp
    and l.created_at <  (target_date + interval '1 day')::timestamp
    and l.status = 'success'
  group by l.user_id, p.first_name, p.last_name
  order by total_usd desc;
$$;

revoke all on function public.daily_ai_cost_by_user(date) from public;
grant execute on function public.daily_ai_cost_by_user(date) to service_role;
