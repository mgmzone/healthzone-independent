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
6. **Components** in `src/components/<feature>/` — shadcn/ui based
7. **Page** in `src/pages/` — Layout wrapper + Tabs pattern
8. **Route** in `src/App.tsx` — inside ProtectedRoute
9. **Nav link** in `src/components/Header.tsx` — with Lucide icon

### Key Conventions
- Database fields: `snake_case`. Frontend types: `camelCase`. Services transform between them.
- All data queries filter by active period via `getCurrentPeriodRange()`
- Auth check at top of every service function: `supabase.auth.getSession()`
- Toast notifications for all user-facing success/error feedback
- Use `toLocalDateString()` from `src/lib/utils/dateUtils.ts` for date-to-string — never `toISOString().split('T')[0]` (timezone bug)

## Supabase
- Project ref: `kvmvekesxdzwodnfabdr`
- CLI linked via `supabase link`
- Push migrations: `supabase db push`
- Query remote: `supabase db query --linked "SQL"`
- Edge functions exist for email (send-email, send-weekly-summary) but are not fully operational

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
