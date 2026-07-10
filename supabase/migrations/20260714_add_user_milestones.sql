-- Migration: user-level, typed milestones (decoupled from weight-loss periods)
-- Date: 2026-07-14
--
-- period_milestones ties every milestone to a weight-loss period (period_id NOT
-- NULL, cascade delete, one-priority-per-period). That doesn't fit open-ended
-- post-surgical life: a surgery, a follow-up scan, or a stoma-nurse visit isn't
-- "inside" a weight-loss period. This table is user-level and adds a `type` so a
-- surgery is just one milestone type among many (procedure, appointment, etc.),
-- which also feeds the timeline / calendar views.
--
-- period_milestones is left in place (unused) rather than dropped, for safe rollback.

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text not null default 'other',       -- surgery | procedure | appointment | follow_up | medication | personal | other | custom
  milestone_date date not null,
  is_priority boolean not null default false,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.milestones enable row level security;

create policy "Users can view own milestones (v2)"
  on public.milestones for select using (auth.uid() = user_id);
create policy "Users can insert own milestones (v2)"
  on public.milestones for insert with check (auth.uid() = user_id);
create policy "Users can update own milestones (v2)"
  on public.milestones for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own milestones (v2)"
  on public.milestones for delete using (auth.uid() = user_id);

-- At most one priority milestone per USER (was per-period before).
create unique index idx_one_priority_per_user
  on public.milestones(user_id) where is_priority;

create index idx_milestones_user_date on public.milestones(user_id, milestone_date);

create trigger milestones_updated_at
  before update on public.milestones
  for each row execute function public.tracking_touch_updated_at();

-- Migrate existing period_milestones. Infer type from the name (surgery-named
-- rows -> 'surgery', everything else -> 'personal'). A user could have had a
-- priority milestone in more than one period, but the new index allows only one
-- priority per user, so keep priority ONLY for that user's single most-recent
-- originally-priority milestone.
insert into public.milestones (user_id, name, type, milestone_date, is_priority, notes, sort_order, created_at)
select
  pm.user_id,
  pm.name,
  case when pm.name ilike '%surgery%' then 'surgery' else 'personal' end,
  pm.date,
  (pm.is_priority and pm.id = (
     select pm2.id from public.period_milestones pm2
     where pm2.user_id = pm.user_id and pm2.is_priority
     order by pm2.date desc, pm2.created_at desc
     limit 1
  )),
  pm.notes,
  pm.sort_order,
  pm.created_at
from public.period_milestones pm;
