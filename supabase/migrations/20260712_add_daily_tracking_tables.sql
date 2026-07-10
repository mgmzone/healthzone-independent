-- Migration: Post-surgical daily-tracking foundation
-- Date: 2026-07-12
--
-- Adds the data model for ongoing post-cystectomy daily diligence: high-frequency
-- tally events (water, ostomy empties, bag changes, bowel movements), vital signs,
-- and medications. Deliberately period-FREE (keyed by user + timestamp, following
-- the journal_entries pattern) because post-surgical life is open-ended and has no
-- weight-loss "period" to scope to.
--
-- Design: a generic event_types (config) + tracked_events (log) pair models any
-- user-defined "+1" tracker without a new 9-file feature stack per tracker, while
-- vitals and medications get purpose-built tables where typed columns and the
-- "3 of 4 taken today" / charted-reading UX don't compress into generic events.

-- Shared updated_at trigger for the tables below.
create or replace function public.tracking_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- event_types: per-user configurable definitions of a tally tracker
-- ---------------------------------------------------------------------------
create table public.event_types (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  key text not null,                       -- stable slug, e.g. 'water', 'ostomy_empty'
  label text not null,                     -- display name, e.g. 'Water'
  icon text,                               -- lucide icon name or emoji
  unit text,                               -- 'oz','ml','glass'... null = plain count
  default_quantity numeric not null default 1,
  daily_target numeric,                    -- e.g. 64 (oz) or 8 (glasses); null = no target
  color text,                              -- optional accent for the UI tile
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, key)
);

alter table public.event_types enable row level security;

create policy "Users can view own event types"
  on public.event_types for select using (auth.uid() = user_id);
create policy "Users can insert own event types"
  on public.event_types for insert with check (auth.uid() = user_id);
create policy "Users can update own event types"
  on public.event_types for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own event types"
  on public.event_types for delete using (auth.uid() = user_id);

create index idx_event_types_user on public.event_types(user_id, sort_order);

create trigger event_types_updated_at
  before update on public.event_types
  for each row execute function public.tracking_touch_updated_at();

-- ---------------------------------------------------------------------------
-- tracked_events: individual tap/tally events
-- ---------------------------------------------------------------------------
create table public.tracked_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  -- Keep history if the type is deleted: null the FK but retain the denormalized key.
  event_type_id uuid references public.event_types(id) on delete set null,
  event_key text not null,                 -- denormalized so history survives type deletion
  occurred_at timestamptz not null default now(),
  quantity numeric not null default 1,
  unit text,
  notes text,
  created_at timestamptz default now()
);

alter table public.tracked_events enable row level security;

create policy "Users can view own tracked events"
  on public.tracked_events for select using (auth.uid() = user_id);
create policy "Users can insert own tracked events"
  on public.tracked_events for insert with check (auth.uid() = user_id);
create policy "Users can update own tracked events"
  on public.tracked_events for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own tracked events"
  on public.tracked_events for delete using (auth.uid() = user_id);

-- Primary access pattern: a user's events for a day/range, newest first, by key.
create index idx_tracked_events_user_time on public.tracked_events(user_id, occurred_at desc);
create index idx_tracked_events_user_key_time on public.tracked_events(user_id, event_key, occurred_at desc);

-- ---------------------------------------------------------------------------
-- vitals: point-in-time vital sign readings (multiple per day expected)
-- ---------------------------------------------------------------------------
-- Weight is intentionally NOT here — it stays in weigh_ins (single source of truth
-- with body-composition + charts). A vitals entry UI can write weight to weigh_ins.
create table public.vitals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  measured_at timestamptz not null default now(),
  systolic int check (systolic is null or systolic between 40 and 300),
  diastolic int check (diastolic is null or diastolic between 20 and 200),
  pulse int check (pulse is null or pulse between 20 and 300),
  oxygen_saturation int check (oxygen_saturation is null or oxygen_saturation between 50 and 100),
  temperature numeric,
  temperature_unit text not null default 'F' check (temperature_unit in ('F','C')),
  respiratory_rate int check (respiratory_rate is null or respiratory_rate between 4 and 80),
  blood_glucose numeric,
  notes text,
  created_at timestamptz default now()
);

alter table public.vitals enable row level security;

create policy "Users can view own vitals"
  on public.vitals for select using (auth.uid() = user_id);
create policy "Users can insert own vitals"
  on public.vitals for insert with check (auth.uid() = user_id);
create policy "Users can update own vitals"
  on public.vitals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own vitals"
  on public.vitals for delete using (auth.uid() = user_id);

create index idx_vitals_user_time on public.vitals(user_id, measured_at desc);

-- ---------------------------------------------------------------------------
-- medications + medication_logs
-- ---------------------------------------------------------------------------
create table public.medications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  dose text,                               -- '500 mg', '2 tablets'
  schedule text,                           -- freeform 'twice daily', 'as needed'
  times_per_day int,                       -- powers "n of m taken today"; null = PRN/as-needed
  notes text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.medications enable row level security;

create policy "Users can view own medications"
  on public.medications for select using (auth.uid() = user_id);
create policy "Users can insert own medications"
  on public.medications for insert with check (auth.uid() = user_id);
create policy "Users can update own medications"
  on public.medications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own medications"
  on public.medications for delete using (auth.uid() = user_id);

create index idx_medications_user on public.medications(user_id, sort_order);

create trigger medications_updated_at
  before update on public.medications
  for each row execute function public.tracking_touch_updated_at();

create table public.medication_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  medication_id uuid references public.medications(id) on delete set null,
  medication_name text,                    -- denormalized snapshot; survives med deletion
  taken_at timestamptz not null default now(),
  status text not null default 'taken' check (status in ('taken','skipped')),
  notes text,
  created_at timestamptz default now()
);

alter table public.medication_logs enable row level security;

create policy "Users can view own medication logs"
  on public.medication_logs for select using (auth.uid() = user_id);
create policy "Users can insert own medication logs"
  on public.medication_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own medication logs"
  on public.medication_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own medication logs"
  on public.medication_logs for delete using (auth.uid() = user_id);

create index idx_medication_logs_user_time on public.medication_logs(user_id, taken_at desc);
create index idx_medication_logs_med_time on public.medication_logs(medication_id, taken_at desc);

-- ---------------------------------------------------------------------------
-- Seed a starter set of tracker types for every existing profile so the feature
-- is usable immediately. ON CONFLICT keeps this safe to re-run and non-destructive.
-- ---------------------------------------------------------------------------
insert into public.event_types (user_id, key, label, icon, unit, default_quantity, daily_target, sort_order)
select p.id, s.key, s.label, s.icon, s.unit, s.default_quantity, s.daily_target, s.sort_order
from public.profiles p
cross join (values
  ('water',          'Water',        'GlassWater',  'oz',    8, 64, 0),
  ('ostomy_empty',   'Emptied bag',  'Droplets',    null::text, 1, 6,  1),
  ('bag_change',     'Bag change',   'RefreshCw',   null::text, 1, null::numeric, 2),
  ('bowel_movement', 'Bowel movement','Activity',   null::text, 1, null::numeric, 3)
) as s(key, label, icon, unit, default_quantity, daily_target, sort_order)
on conflict (user_id, key) do nothing;
