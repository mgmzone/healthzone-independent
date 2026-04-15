-- Strava integration: per-user tokens + activity dedup key.
alter table public.profiles
  add column if not exists strava_client_id text,
  add column if not exists strava_client_secret text,
  add column if not exists strava_refresh_token text,
  add column if not exists strava_last_sync_at timestamptz;

alter table public.exercise_logs
  add column if not exists strava_activity_id bigint;

-- Unique per user so the same activity can't be imported twice.
create unique index if not exists exercise_logs_user_strava_activity_uidx
  on public.exercise_logs (user_id, strava_activity_id)
  where strava_activity_id is not null;

comment on column public.profiles.strava_client_id is 'Per-user Strava API app client ID.';
comment on column public.profiles.strava_client_secret is 'Per-user Strava API app client secret.';
comment on column public.profiles.strava_refresh_token is 'Long-lived Strava refresh token; access tokens are short-lived and fetched on demand.';
comment on column public.exercise_logs.strava_activity_id is 'Strava activity id for dedup when syncing from Strava.';
