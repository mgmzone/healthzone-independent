-- Migration: Extend get_system_stats_for_admin with meals, AI calls, and on-us cost
-- Date: 2026-04-16

drop function if exists public.get_system_stats_for_admin();

create or replace function public.get_system_stats_for_admin()
returns table (
  total_users bigint,
  active_periods bigint,
  total_weigh_ins bigint,
  total_fasts bigint,
  total_exercises bigint,
  total_meals bigint,
  ai_calls_30d bigint,
  ai_fallback_cost_30d numeric
)
language plpgsql security definer as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and is_admin = true) then
    raise exception 'Access denied: User is not an admin';
  end if;
  return query
  select
    (select count(*) from profiles)::bigint,
    (select count(*) from periods where start_date <= current_date and (end_date is null or end_date >= current_date))::bigint,
    (select count(*) from weigh_ins)::bigint,
    (select count(*) from fasting_logs)::bigint,
    (select count(*) from exercise_logs)::bigint,
    (select count(*) from meal_logs)::bigint,
    coalesce((select count(*) from ai_usage_logs where created_at >= current_date - interval '30 days'), 0)::bigint,
    coalesce((select sum(cost_usd) from ai_usage_logs where used_fallback_key = true and created_at >= current_date - interval '30 days'), 0)::numeric;
end;
$$;

grant execute on function public.get_system_stats_for_admin() to authenticated;
