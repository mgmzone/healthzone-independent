-- Migration: Per-user unsubscribe token for one-click email unsubscribe
-- Date: 2026-04-16
-- Token is used in outgoing email links. Edge function resolves to user id
-- and toggles the matching *_emails preference to false.

alter table public.profiles
  add column if not exists email_unsubscribe_token uuid unique default gen_random_uuid();

update public.profiles set email_unsubscribe_token = gen_random_uuid() where email_unsubscribe_token is null;

alter table public.profiles alter column email_unsubscribe_token set not null;

create index if not exists idx_profiles_unsubscribe_token on public.profiles(email_unsubscribe_token);

comment on column public.profiles.email_unsubscribe_token is 'Opaque token used in email unsubscribe links. Do not expose to other users; RLS limits profile SELECT to auth.uid() = id.';
