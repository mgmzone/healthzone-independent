-- Migration: Add journal / diary entries
-- Date: 2026-05-01
--
-- Free-form narrative journal. Intentionally minimal structured fields so the
-- feature doesn't lock users into any particular logging schema — users can
-- track recovery, workouts, nutrition, goals, side effects, etc. as narrative
-- with freeform tags. Optional pain_level / mood for users who want them.

create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  entry_date date not null,
  entry_time time,
  title text,
  body text not null,
  tags text[] not null default '{}',
  pain_level smallint check (pain_level is null or (pain_level between 1 and 10)),
  mood smallint check (mood is null or (mood between 1 and 5)),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.journal_entries enable row level security;

create policy "Users can view own journal entries"
  on public.journal_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own journal entries"
  on public.journal_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own journal entries"
  on public.journal_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete own journal entries"
  on public.journal_entries for delete
  using (auth.uid() = user_id);

-- Listing newest-first by date is the primary access pattern
create index idx_journal_entries_user_date
  on public.journal_entries(user_id, entry_date desc, created_at desc);

-- Tag filter uses GIN for array containment (tags && ARRAY[...])
create index idx_journal_entries_tags
  on public.journal_entries using gin (tags);

-- Full-text search over title + body. English config is fine for now;
-- mixed-language entries still match on stem/literal tokens.
create index idx_journal_entries_fts
  on public.journal_entries
  using gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, '')));

-- Keep updated_at fresh on any row update
create or replace function public.journal_entries_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger journal_entries_updated_at
  before update on public.journal_entries
  for each row execute function public.journal_entries_touch_updated_at();
