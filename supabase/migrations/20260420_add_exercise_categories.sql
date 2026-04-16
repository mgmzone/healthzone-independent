-- Migration: Move exercise_logs to a category + activity_name model
-- Date: 2026-04-16
-- Replaces the rigid walk/run/bike/elliptical/other enum with broader
-- categories and a freeform activity name. Adds calories_burned for AI.

alter table public.exercise_logs
  add column if not exists activity_name text,
  add column if not exists calories_burned integer;

-- The old CHECK constraint limits type to walk/run/bike/elliptical/other. Drop
-- it so we can remap values, then re-add with the new category vocabulary.
alter table public.exercise_logs drop constraint if exists exercise_logs_type_check;

comment on column public.exercise_logs.activity_name is 'Freeform activity name (e.g. "Jiu Jitsu", "Deadlift session"). Falls back to category label for legacy rows.';
comment on column public.exercise_logs.calories_burned is 'Estimated calories burned. AI-filled but user-editable.';

-- Backfill activity_name from the old type values before remapping them
update public.exercise_logs set activity_name = 'Walking'    where type = 'walk'       and activity_name is null;
update public.exercise_logs set activity_name = 'Running'    where type = 'run'        and activity_name is null;
update public.exercise_logs set activity_name = 'Cycling'    where type = 'bike'       and activity_name is null;
update public.exercise_logs set activity_name = 'Elliptical' where type = 'elliptical' and activity_name is null;

-- Remap type values to categories. 'other' stays as-is.
update public.exercise_logs set type = 'cardio' where type in ('walk','run','bike','elliptical');

-- Sanity: anything unexpected becomes 'other' so the enum invariant holds.
update public.exercise_logs
  set type = 'other'
  where type not in ('cardio','resistance','sports','flexibility','other');

alter table public.exercise_logs
  add constraint exercise_logs_type_check
  check (type in ('cardio','resistance','sports','flexibility','other'));
