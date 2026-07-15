-- ============================================================
-- Table: saved_meals
-- Reusable meal presets ("favorites") — a named description plus
-- typical macros that prefill the meal log form in one tap.
-- ============================================================
create table public.saved_meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  meal_slot text,
  protein_grams numeric(5,1),
  carbs_grams numeric(6,1),
  fat_grams numeric(6,1),
  sodium_mg numeric(7,1),
  calories numeric(6,1),
  anti_inflammatory boolean default false,
  times_used integer default 0,
  last_used_at timestamptz,
  created_at timestamptz default now(),

  unique(user_id, name)
);

alter table public.saved_meals enable row level security;

create policy "Users can view own saved meals"
  on public.saved_meals for select
  using (auth.uid() = user_id);

create policy "Users can insert own saved meals"
  on public.saved_meals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own saved meals"
  on public.saved_meals for update
  using (auth.uid() = user_id);

create policy "Users can delete own saved meals"
  on public.saved_meals for delete
  using (auth.uid() = user_id);

create index idx_saved_meals_user on public.saved_meals(user_id);
