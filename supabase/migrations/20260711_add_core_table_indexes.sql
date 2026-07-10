-- Add the (user_id, date) composite indexes that the newer tables (meal_logs,
-- daily_goal_entries, journal_entries) already have but the original core tables
-- were missing. Every app query filters user_id + a date range, and every RLS
-- check evaluates auth.uid() = user_id, so these back both the query and the
-- policy. Impact is small today (tiny tables) but the pattern is established and
-- it is free insurance as data grows.

create index if not exists idx_weigh_ins_user_date
  on public.weigh_ins (user_id, date desc);

create index if not exists idx_exercise_logs_user_date
  on public.exercise_logs (user_id, date desc);

create index if not exists idx_fasting_logs_user_start
  on public.fasting_logs (user_id, start_time desc);

create index if not exists idx_periods_user_start
  on public.periods (user_id, start_date desc);
