-- Migration: Add meal tracking and daily goals compliance system
-- Date: 2026-04-03

-- ============================================================
-- Table: meal_logs
-- Per-meal tracking: protein, irritant violations, anti-inflammatory
-- ============================================================
create table public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  meal_slot text not null check (meal_slot in ('noon', 'afternoon', 'evening')),
  protein_grams numeric(5,1),
  protein_source text,
  irritant_violation boolean default false,
  irritant_notes text,
  anti_inflammatory boolean default false,
  notes text,
  created_at timestamptz default now(),

  unique(user_id, date, meal_slot)
);

alter table public.meal_logs enable row level security;

create policy "Users can view own meal logs"
  on public.meal_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own meal logs"
  on public.meal_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own meal logs"
  on public.meal_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete own meal logs"
  on public.meal_logs for delete
  using (auth.uid() = user_id);

create index idx_meal_logs_user_date on public.meal_logs(user_id, date);

-- ============================================================
-- Table: protein_sources
-- User's common protein foods with preset gram values
-- ============================================================
create table public.protein_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  typical_protein_grams numeric(5,1),
  is_anti_inflammatory boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now(),

  unique(user_id, name)
);

alter table public.protein_sources enable row level security;

create policy "Users can view own protein sources"
  on public.protein_sources for select
  using (auth.uid() = user_id);

create policy "Users can insert own protein sources"
  on public.protein_sources for insert
  with check (auth.uid() = user_id);

create policy "Users can update own protein sources"
  on public.protein_sources for update
  using (auth.uid() = user_id);

create policy "Users can delete own protein sources"
  on public.protein_sources for delete
  using (auth.uid() = user_id);

-- ============================================================
-- Table: daily_goals
-- User-defined daily compliance goals (configurable per user)
-- ============================================================
create table public.daily_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  category text default 'dietary' check (category in ('dietary', 'hydration', 'supplement', 'lifestyle')),
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),

  unique(user_id, name)
);

alter table public.daily_goals enable row level security;

create policy "Users can view own daily goals"
  on public.daily_goals for select
  using (auth.uid() = user_id);

create policy "Users can insert own daily goals"
  on public.daily_goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own daily goals"
  on public.daily_goals for update
  using (auth.uid() = user_id);

create policy "Users can delete own daily goals"
  on public.daily_goals for delete
  using (auth.uid() = user_id);

-- ============================================================
-- Table: daily_goal_entries
-- Daily check-in: one entry per goal per day
-- ============================================================
create table public.daily_goal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  goal_id uuid references public.daily_goals(id) on delete cascade not null,
  date date not null,
  met boolean default false,
  notes text,
  created_at timestamptz default now(),

  unique(user_id, goal_id, date)
);

alter table public.daily_goal_entries enable row level security;

create policy "Users can view own goal entries"
  on public.daily_goal_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own goal entries"
  on public.daily_goal_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own goal entries"
  on public.daily_goal_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete own goal entries"
  on public.daily_goal_entries for delete
  using (auth.uid() = user_id);

create index idx_daily_goal_entries_user_date on public.daily_goal_entries(user_id, date);
create index idx_daily_goal_entries_goal_date on public.daily_goal_entries(goal_id, date);

-- The unique constraints on protein_sources(user_id, name) and daily_goals(user_id, name)
-- provide implicit indexes. Add explicit single-column indexes for user_id filtering.
create index idx_protein_sources_user on public.protein_sources(user_id);
create index idx_daily_goals_user on public.daily_goals(user_id);
