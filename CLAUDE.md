# HealthZone — Claude Code Project Instructions

## What This Is
A health tracking web app for pre-surgical weight loss and optimization. Tracks exercise, weight, fasting, meals, and daily compliance goals. Deployed at https://healthzone.mgm.zone.

## Stack
- **Frontend:** React 18 + TypeScript + Vite
- **UI:** Tailwind CSS + shadcn/ui components
- **Charts:** Recharts
- **State:** TanStack React Query + local state (no Redux/Zustand)
- **Backend:** Supabase (PostgreSQL + Auth + Edge Functions + Storage)
- **Deployment:** Docker container + nginx + Cloudflare Tunnel on homelab

## Architecture Patterns

### Data Flow
```
Page → Custom Hook → Service Layer → Supabase Client → Database
```

### Adding a New Feature (follow existing patterns exactly)
1. **SQL migration** in `supabase/migrations/` — tables + RLS policies + indexes
2. **Supabase types** in `src/integrations/supabase/types.ts` — Row/Insert/Update types
3. **Frontend types** in `src/lib/types.ts` — camelCase interfaces
4. **Service layer** in `src/lib/services/` — async CRUD functions, snake_case ↔ camelCase transforms
5. **React hook** in `src/hooks/` — useState + useEffect + toast notifications
6. **Components** in `src/components/<feature>/` — shadcn/ui based. For page sub-nav inside the feature page, use `<TabsList variant="underline">` so it matches the top-bar nav treatment.
7. **Page** in `src/pages/` — Layout wrapper + Tabs pattern
8. **Route** in `src/App.tsx` — inside ProtectedRoute
9. **Nav link** in `src/components/Header.tsx` — add to `primaryLinks` for daily-use features (Dashboard/Nutrition/Exercise/Fasting/Weight/Journal); add to the account menu dropdown for low-frequency/admin features (Profile/Periods/Admin)

### Key Conventions
- Database fields: `snake_case`. Frontend types: `camelCase`. Services transform between them.
- All data queries filter by active period via `getCurrentPeriodRange()`
- Auth check at top of every service function: `supabase.auth.getSession()`
- Toast notifications for all user-facing success/error feedback
- Use `toLocalDateString()` from `src/lib/utils/dateUtils.ts` for date-to-string — never `toISOString().split('T')[0]` (timezone bug)
- When converting date-only DB strings (e.g. `"2026-04-03"`) to Date objects, append `T12:00:00` — `new Date("2026-04-03")` parses as UTC midnight which shifts to the previous day in US timezones
- Protein targets are centralized as `PROTEIN_TARGET_MIN` / `PROTEIN_TARGET_MAX` in `src/lib/types.ts`
- Meal slots are freeform text (not a fixed enum) — users name their own meals
- `target_meals_per_day` is on the `profiles` table, configurable in Profile > Health

## Supabase
- Project ref: `kvmvekesxdzwodnfabdr`
- CLI linked via `supabase link`
- Push migrations: `supabase db push` — migration filenames must match `<timestamp>_name.sql` pattern
- Query remote: `supabase db query --linked "SQL"`
- Supabase CLI auth expires periodically — run `supabase login` if push/query fails with SASL errors

### Tables
Core: `profiles`, `periods`, `period_milestones`, `weigh_ins`, `exercise_logs`, `exercise_goals`, `fasting_logs`, `health_stats`
Nutrition: `meal_logs`, `protein_sources`, `daily_goals`, `daily_goal_entries`
Journal: `journal_entries` (free-form diary; not period-scoped — filter by date range / tags in the UI)
System: `email_templates`, `ai_usage_logs` (every Claude API call logged with tokens/cost/fallback-key flag)

### Edge Functions
All edge functions use `verify_jwt: false` at the gateway level (configured in `supabase/functions.json`) but perform auth internally so CORS preflight requests work. Deploy with: `supabase functions deploy <name> --no-verify-jwt`. CORS headers come from `_shared/cors.ts` which fails closed when `ALLOWED_ORIGIN` is unset or the request origin isn't on the allowlist.

| Function | Auth | Purpose |
|----------|------|---------|
| `evaluate-meal` | JWT (user session) | Claude-powered meal macro/protein estimation + assessment. Uses `MODEL_COACH` |
| `analyze-exercise` | JWT (user session) | Claude-powered free-text exercise parsing (category/minutes/intensity/calories). Uses `MODEL_BASIC` |
| `ai-dashboard-feedback` | JWT (user session) | Claude-powered weekly progress insights for dashboard card. Uses `MODEL_COACH` |
| `send-email` | JWT (user session) | Sends templated emails via Resend |
| `send-weekly-summary` | `CRON_SECRET` Bearer token | Weekly activity + AI summary emails; pg_cron driven |
| `send-welcome-email` | JWT / trigger | New-user welcome email |
| `send-system-emails` | `CRON_SECRET` Bearer token | Milestone / inactivity reminders; pg_cron driven |
| `unsubscribe-email` | Token param | One-click unsubscribe via per-user token |
| `admin-delete-user` | JWT + server-side `is_admin` check | Hard-delete a user and cascade all their data |
| `admin-set-user-ban` | JWT + server-side `is_admin` check | Ban/unban a user in `auth.users` |
| `strava-oauth-exchange` | JWT (user session) | OAuth code → token exchange for Strava integration |
| `strava-sync` | JWT (user session) | Pull recent activities from Strava into `exercise_logs` |

Fallback Claude key (`CLAUDE_API_KEY_FALLBACK`) is capped per-user per-day via `checkFallbackDailyCap()` in `_shared/aiUsage.ts`. Default cap is $0.25/day, override with `CLAUDE_FALLBACK_DAILY_CAP_USD` secret. Interactive functions return 429 when capped; `send-weekly-summary` skips the AI section and still sends the email.

### Email & Scheduling
- Email provider: Resend (API key in `RESEND_API_KEY` secret)
- Verified sending domains: `updates.healthapp.zone`, `mgm.zone`
- From address: `HealthZone <healthzone@mgm.zone>` (in `FROM_EMAIL` secret)
- Weekly summary cron: `pg_cron` job `weekly-summary-email` runs `0 13 * * 1` (Monday 8am EST)
- Weekly summary includes AI Coach Insights section when user has Claude API key configured
- To trigger manually: `curl` the function URL with `Authorization: Bearer $CRON_SECRET`

### AI Integration
- Users store their personal Claude API key in `profiles.claude_api_key` (Profile > Health > AI Settings)
- Users can write custom AI context in `profiles.ai_prompt` — sent with every AI evaluation
- AI edge functions verify JWT from Authorization header, extract user ID from token (no userId in request body)
- `meal_logs` has `ai_assessment` (text) and `ai_protein_estimate` (numeric) columns for storing AI responses
- Claude models are centralized in `supabase/functions/_shared/models.ts`: `MODEL_BASIC` (`claude-haiku-4-5`) for parsing tasks (`evaluate-meal`, `analyze-exercise`), `MODEL_COACH` (`claude-sonnet-4-6`) for coaching (`ai-dashboard-feedback`, `send-weekly-summary`). Called via direct HTTP to `api.anthropic.com/v1/messages`.
- Claude often wraps JSON in markdown code fences — edge functions strip ``` before parsing
- CORS: production domain must be in `ALLOWED_ORIGIN` Supabase secret
- Frontend service: `src/lib/services/aiService.ts` — `evaluateMeal()` and `getDashboardFeedback()`
- Dashboard card: `src/components/dashboard/cards/AIFeedbackCard.tsx` — caches in sessionStorage for 30 min

## Weight Forecast Algorithm
Forecast generator lives in `src/components/charts/weight-forecast/utils/forecast/forecastGenerator.ts`. Uses OLS regression over the last 21 days of weigh-ins to estimate the user's actual daily rate, then fits an exponential-decay curve `weight(t) = target + (anchor − target) · exp(−k · t)` anchored at the user's real last weigh-in. Curve naturally flattens approaching target. Same generator drives the chart AND the DB-stored `projected_end_date` (via `src/hooks/weight/services/projectedEndDateService.ts`), so every consumer of that field agrees. Do NOT revert to linear/weighted-blend — both prior approaches were explicitly rejected by the user; see `feedback_forecast_algorithm.md` memory for context.

## Git & Deployment
- Remote uses SSH: `git@github.com-mgmzone:mgmzone/healthzone-independent.git`
- SSH host alias `github.com-mgmzone` uses `~/.ssh/id_ed25519_mgmzone`
- Deploy: SSH to Docker server → `cd /opt/healthzone-independent && git pull && ./scripts/docker-update.sh`
- Container runs on port 3001 behind Cloudflare Tunnel

## Build & Verify
```bash
npx tsc --noEmit    # type check
npm run build       # production build
npm run dev         # dev server on :8080
```
