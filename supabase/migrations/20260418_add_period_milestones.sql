-- Migration: Replace profiles.surgery_date with per-period milestones
-- Date: 2026-04-16

-- ============================================================
-- Table: period_milestones
-- Each period can have multiple milestones; at most one is_priority.
-- ============================================================
create table public.period_milestones (
  id uuid primary key default gen_random_uuid(),
  period_id uuid references public.periods(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  date date not null,
  is_priority boolean default false not null,
  notes text,
  sort_order integer default 0 not null,
  created_at timestamptz default now() not null
);

alter table public.period_milestones enable row level security;

create policy "Users can view own milestones"
  on public.period_milestones for select
  using (auth.uid() = user_id);

create policy "Users can insert own milestones"
  on public.period_milestones for insert
  with check (auth.uid() = user_id);

create policy "Users can update own milestones"
  on public.period_milestones for update
  using (auth.uid() = user_id);

create policy "Users can delete own milestones"
  on public.period_milestones for delete
  using (auth.uid() = user_id);

-- At most one priority milestone per period
create unique index idx_one_priority_per_period
  on public.period_milestones(period_id) where is_priority;

create index idx_period_milestones_user_period on public.period_milestones(user_id, period_id);
create index idx_period_milestones_date on public.period_milestones(date);

-- ============================================================
-- Backfill: convert existing profiles.surgery_date into a priority milestone
-- under the user's most recent active period (start_date <= today and
-- (end_date is null or end_date >= today)). Users without an active period
-- are skipped — they can re-add the milestone after creating a period.
-- ============================================================
insert into public.period_milestones (period_id, user_id, name, date, is_priority)
select distinct on (p.id)
  per.id as period_id,
  p.id as user_id,
  'Surgery' as name,
  p.surgery_date as date,
  true as is_priority
from public.profiles p
join public.periods per on per.user_id = p.id
where p.surgery_date is not null
  and per.start_date <= current_date
  and (per.end_date is null or per.end_date >= current_date)
order by p.id, per.start_date desc;

-- Drop the now-redundant column
alter table public.profiles drop column if exists surgery_date;
