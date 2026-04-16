-- Migration: Admin analytics RPCs for the Analytics tab
-- Date: 2026-04-16

create or replace function public.get_admin_signups_by_day(days_back int default 30)
returns table (day date, signups bigint)
language plpgsql security definer as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and is_admin = true) then
    raise exception 'Access denied';
  end if;
  return query
  with days as (
    select (current_date - (g * interval '1 day'))::date as day
    from generate_series(0, days_back - 1) g
  )
  select d.day, coalesce(count(au.id), 0) as signups
  from days d
  left join auth.users au on au.created_at::date = d.day
  group by d.day
  order by d.day;
end; $$;

create or replace function public.get_admin_ai_usage_by_day(days_back int default 30)
returns table (day date, function_name text, calls bigint, cost_usd numeric, fallback_calls bigint, fallback_cost_usd numeric)
language plpgsql security definer as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and is_admin = true) then
    raise exception 'Access denied';
  end if;
  return query
  select
    l.created_at::date as day,
    l.function_name,
    count(*)::bigint as calls,
    coalesce(sum(l.cost_usd), 0)::numeric as cost_usd,
    count(*) filter (where l.used_fallback_key)::bigint as fallback_calls,
    coalesce(sum(l.cost_usd) filter (where l.used_fallback_key), 0)::numeric as fallback_cost_usd
  from ai_usage_logs l
  where l.created_at >= current_date - (days_back - 1) * interval '1 day'
  group by l.created_at::date, l.function_name
  order by day;
end; $$;

create or replace function public.get_admin_feature_adoption()
returns table (
  total_users bigint,
  profile_complete bigint,
  has_active_period bigint,
  has_own_claude_key bigint,
  has_strava_connected bigint,
  has_custom_protein_target bigint,
  has_ai_context bigint,
  has_macro_data bigint,
  wau_this bigint,
  wau_prior bigint
)
language plpgsql security definer as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and is_admin = true) then
    raise exception 'Access denied';
  end if;
  return query
  select
    (select count(*) from profiles)::bigint as total_users,
    (select count(*) from profiles p where p.birth_date is not null and p.gender is not null and p.height is not null and p.target_weight is not null and p.measurement_unit is not null)::bigint,
    (select count(distinct per.user_id) from periods per where per.start_date <= current_date and (per.end_date is null or per.end_date >= current_date))::bigint,
    (select count(*) from profiles p where p.claude_api_key is not null and length(trim(p.claude_api_key)) > 0)::bigint,
    (select count(*) from profiles p where p.strava_client_id is not null and p.strava_client_secret is not null and p.strava_refresh_token is not null)::bigint,
    (select count(*) from profiles p where p.protein_target_min is not null or p.protein_target_max is not null)::bigint,
    (select count(*) from profiles p where p.ai_prompt is not null and length(trim(p.ai_prompt)) > 0)::bigint,
    (select count(distinct m.user_id) from meal_logs m where m.carbs_grams is not null or m.fat_grams is not null or m.calories is not null)::bigint,
    (select count(distinct u) from (
      select user_id as u from weigh_ins where date >= current_date - interval '7 days'
      union
      select user_id from meal_logs where date >= current_date - interval '7 days'
      union
      select user_id from exercise_logs where created_at >= current_date - interval '7 days'
    ) t)::bigint,
    (select count(distinct u) from (
      select user_id as u from weigh_ins where date >= current_date - interval '14 days' and date < current_date - interval '7 days'
      union
      select user_id from meal_logs where date >= current_date - interval '14 days' and date < current_date - interval '7 days'
      union
      select user_id from exercise_logs where created_at >= current_date - interval '14 days' and created_at < current_date - interval '7 days'
    ) t)::bigint;
end; $$;

create or replace function public.get_admin_activity_volume_by_day(days_back int default 14)
returns table (day date, meals bigint, weigh_ins bigint, exercises bigint, fasting bigint)
language plpgsql security definer as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and is_admin = true) then
    raise exception 'Access denied';
  end if;
  return query
  with days as (
    select (current_date - (g * interval '1 day'))::date as day
    from generate_series(0, days_back - 1) g
  )
  select
    d.day,
    coalesce((select count(*) from meal_logs m where m.date = d.day), 0)::bigint as meals,
    coalesce((select count(*) from weigh_ins w where w.date::date = d.day), 0)::bigint as weigh_ins,
    coalesce((select count(*) from exercise_logs e where e.created_at::date = d.day), 0)::bigint as exercises,
    coalesce((select count(*) from fasting_logs f where f.start_time::date = d.day), 0)::bigint as fasting
  from days d
  order by d.day;
end; $$;

grant execute on function public.get_admin_signups_by_day(int) to authenticated;
grant execute on function public.get_admin_ai_usage_by_day(int) to authenticated;
grant execute on function public.get_admin_feature_adoption() to authenticated;
grant execute on function public.get_admin_activity_volume_by_day(int) to authenticated;
