-- Migration: Extend get_admin_user_extras with is_banned for suspend UI.
-- Date: 2026-04-16

drop function if exists public.get_admin_user_extras();

create or replace function public.get_admin_user_extras()
returns table (
  user_id uuid,
  signup_at timestamptz,
  is_banned boolean,
  has_strava_connected boolean,
  has_custom_protein_target boolean,
  has_ai_context boolean,
  has_own_claude_key boolean,
  ai_calls_7d bigint,
  ai_cost_7d numeric,
  ai_calls_30d bigint,
  ai_cost_30d numeric,
  ai_fallback_7d bigint
)
language plpgsql
security definer
as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and is_admin = true) then
    raise exception 'Access denied: User is not an admin';
  end if;

  return query
  select
    au.id as user_id,
    au.created_at as signup_at,
    (au.banned_until is not null and au.banned_until > now()) as is_banned,
    coalesce(p.strava_client_id is not null and p.strava_client_secret is not null and p.strava_refresh_token is not null, false) as has_strava_connected,
    coalesce(p.protein_target_min is not null or p.protein_target_max is not null, false) as has_custom_protein_target,
    coalesce(p.ai_prompt is not null and length(trim(p.ai_prompt)) > 0, false) as has_ai_context,
    coalesce(p.claude_api_key is not null and length(trim(p.claude_api_key)) > 0, false) as has_own_claude_key,
    coalesce((select count(*) from ai_usage_logs l where l.user_id = au.id and l.created_at >= now() - interval '7 days'), 0) as ai_calls_7d,
    coalesce((select sum(cost_usd) from ai_usage_logs l where l.user_id = au.id and l.created_at >= now() - interval '7 days'), 0)::numeric as ai_cost_7d,
    coalesce((select count(*) from ai_usage_logs l where l.user_id = au.id and l.created_at >= now() - interval '30 days'), 0) as ai_calls_30d,
    coalesce((select sum(cost_usd) from ai_usage_logs l where l.user_id = au.id and l.created_at >= now() - interval '30 days'), 0)::numeric as ai_cost_30d,
    coalesce((select count(*) from ai_usage_logs l where l.user_id = au.id and l.used_fallback_key = true and l.created_at >= now() - interval '7 days'), 0) as ai_fallback_7d
  from auth.users au
  left join profiles p on p.id = au.id;
end;
$$;

grant execute on function public.get_admin_user_extras() to authenticated;
