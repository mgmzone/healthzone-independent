-- Migration: Track per-user AI usage for cost analysis and future tiering
-- Date: 2026-04-16

create table public.ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  function_name text not null,
  model text,
  input_tokens integer,
  output_tokens integer,
  cost_usd numeric(8, 6),
  used_fallback_key boolean default false not null,
  status text not null default 'success',
  error text,
  created_at timestamptz default now() not null
);

alter table public.ai_usage_logs enable row level security;

-- Users can see their own usage (for future transparency)
create policy "Users can view own ai usage"
  on public.ai_usage_logs for select
  using (auth.uid() = user_id);

-- Admins can see everything; service role writes.
create policy "Admins can view all ai usage"
  on public.ai_usage_logs for select
  using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true
  ));

create index idx_ai_usage_logs_user_created on public.ai_usage_logs(user_id, created_at desc);
create index idx_ai_usage_logs_created on public.ai_usage_logs(created_at desc);
create index idx_ai_usage_logs_fallback on public.ai_usage_logs(used_fallback_key, created_at desc)
  where used_fallback_key = true;

comment on column public.ai_usage_logs.function_name is 'Edge function that made the call: evaluate-meal, analyze-exercise, ai-dashboard-feedback, send-weekly-summary.';
comment on column public.ai_usage_logs.cost_usd is 'Estimated cost in USD based on input/output tokens and model price at time of call.';
comment on column public.ai_usage_logs.used_fallback_key is 'True if the server-side CLAUDE_API_KEY_FALLBACK was used (we paid); false if user supplied their own key.';
