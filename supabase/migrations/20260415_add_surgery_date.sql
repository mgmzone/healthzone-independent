-- Add surgery_date to profiles for the pre-surgery countdown banner.
alter table public.profiles
  add column if not exists surgery_date date;

comment on column public.profiles.surgery_date is 'Scheduled surgery date (used for pre-surgery countdown display).';
