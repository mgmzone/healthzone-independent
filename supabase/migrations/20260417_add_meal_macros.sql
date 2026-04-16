-- Migration: Add optional macro and sodium tracking to meal_logs
-- Date: 2026-04-16

alter table public.meal_logs
  add column if not exists carbs_grams numeric(6,1),
  add column if not exists fat_grams numeric(6,1),
  add column if not exists sodium_mg numeric(7,1),
  add column if not exists calories numeric(6,1);
