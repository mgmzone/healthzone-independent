-- Time-of-day dose scheduling for medications, mirroring the paper med sheet's
-- AM / NOON / PM / BED / PRN grid. Before this, a med only had times_per_day (an
-- integer), so "3 of 4 taken" couldn't tell the AM dose from the bedtime dose.
--
-- A scheduled med lists the slots it's due in (subset of am/noon/pm/bed). A PRN
-- ("as needed") med sets is_prn and, optionally, safety limits the app can enforce
-- that paper can't: max_per_day (e.g. Tylenol max 10/24h) and min_hours_between.

alter table public.medications
  add column if not exists slots text[] not null default '{}',
  add column if not exists is_prn boolean not null default false,
  add column if not exists max_per_day integer,
  add column if not exists min_hours_between numeric;

-- Which slot a logged dose satisfied (am/noon/pm/bed, or prn for as-needed).
alter table public.medication_logs
  add column if not exists slot text;

comment on column public.medications.slots is 'Scheduled time-of-day slots: subset of {am,noon,pm,bed}.';
comment on column public.medications.is_prn is 'As-needed medication (taken on demand rather than on a schedule).';
comment on column public.medications.max_per_day is 'PRN safety cap: max doses in a rolling 24h (null = no cap).';
comment on column public.medications.min_hours_between is 'PRN safety spacing: minimum hours between doses (null = none).';
comment on column public.medication_logs.slot is 'Slot this dose satisfied: am/noon/pm/bed/prn.';
