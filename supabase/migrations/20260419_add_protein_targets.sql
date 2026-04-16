-- Migration: Per-user protein targets
-- Date: 2026-04-16

alter table public.profiles
  add column if not exists protein_target_min integer,
  add column if not exists protein_target_max integer;

comment on column public.profiles.protein_target_min is 'Daily minimum protein in grams. NULL = fall back to app default (130).';
comment on column public.profiles.protein_target_max is 'Daily maximum protein in grams. NULL = fall back to app default (150).';
