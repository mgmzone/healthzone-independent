# HealthZone

A weight-loss tracking app built around hitting a specific target by a specific date. Combines weight, meal, fasting, and exercise logging with smart forecasts (regression + exponential decay, not straight-line), an AI coach powered by Claude, a daily-compliance goal system, a personal journal, and period-based milestone planning.

**Live:** [https://healthzone.mgm.zone](https://healthzone.mgm.zone) · **Built for:** pre-surgical weight optimization, serious intermittent fasters, medically-guided eaters, and anyone who wants health numbers that tell the truth.

## Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Charts:** Recharts
- **State:** TanStack React Query + local component state
- **Backend:** Supabase (PostgreSQL + Auth + Edge Functions + Storage)
- **AI:** Anthropic Claude (Sonnet 4.6 for coaching / nutrition reasoning, Haiku 4.5 for exercise parsing) via direct HTTP from edge functions
- **Email:** Resend
- **Deploy:** Docker container behind nginx, exposed via Cloudflare Tunnel on a homelab

## Local development

Requirements: Node.js 18+, npm, a Supabase project (free tier works).

```sh
git clone git@github.com:mgmzone/healthzone-independent.git
cd healthzone-independent
npm install
cp .env.example .env.local    # then edit with your Supabase URL + anon key
npm run dev                   # http://localhost:8080
```

Useful scripts:

```sh
npm run dev         # dev server with HMR
npm run build       # production build → dist/
npm run lint        # eslint
npx tsc --noEmit    # type check without emitting
```

## Database + edge functions

Database schema and RLS policies live in `supabase/migrations/`. Push with:

```sh
supabase link --project-ref <your-project-ref>
supabase db push
```

Edge functions live in `supabase/functions/`. Deploy with:

```sh
supabase functions deploy <function-name> --no-verify-jwt
```

Functions include `evaluate-meal`, `analyze-exercise`, `ai-dashboard-feedback`, `send-weekly-summary`, `send-email`, and admin/Strava helpers. Each verifies the caller's JWT internally and reads from shared helpers under `supabase/functions/_shared/` for CORS, model IDs, and usage/cost tracking.

## Production deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for environment-variable requirements and generic deploy targets (Vercel, Netlify, static host), or [`HOMELAB-SETUP.md`](./HOMELAB-SETUP.md) for the Docker + Cloudflare Tunnel setup this project actually runs on.

## Project docs

- [`CLAUDE.md`](./CLAUDE.md) — architecture conventions, the 9-step "add a new feature" playbook, key gotchas (timezone handling, model routing, etc.)
- [`DEPLOYMENT.md`](./DEPLOYMENT.md) — production deployment and env vars
- [`HOMELAB-SETUP.md`](./HOMELAB-SETUP.md) — homelab-specific setup guide
