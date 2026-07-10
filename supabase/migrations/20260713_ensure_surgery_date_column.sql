-- The 20260415 migration that should have added profiles.surgery_date is recorded
-- as applied, but the column is absent from the production database (migration
-- history / schema drift). Re-add it idempotently so the post-op day counter and
-- the profile surgery-date field have a real column to read/write.
alter table public.profiles
  add column if not exists surgery_date date;

comment on column public.profiles.surgery_date is 'Surgery date — pre-surgery countdown and post-op day counter.';
