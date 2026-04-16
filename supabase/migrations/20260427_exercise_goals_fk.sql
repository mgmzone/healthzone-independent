-- Migration: Add missing CASCADE FK on exercise_goals.user_id so user deletion
-- cleans up fitness goals alongside everything else.
-- Date: 2026-04-16

alter table public.exercise_goals
  add constraint exercise_goals_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;
