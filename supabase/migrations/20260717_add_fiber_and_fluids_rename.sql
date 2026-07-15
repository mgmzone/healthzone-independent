-- Fiber tracking on meals and saved-meal presets
alter table public.meal_logs add column if not exists fiber_grams numeric(6,1);
alter table public.saved_meals add column if not exists fiber_grams numeric(6,1);

-- Rename the starter "Water" tally tracker to "Fluids" — all liquids count
-- toward urostomy output, not just water. Only touches rows still carrying
-- the default label so user customizations are preserved. The key stays
-- 'water' because tracked_events history references it.
update public.event_types set label = 'Fluids' where key = 'water' and label = 'Water';
