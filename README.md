# HealthZone

A personal health tracking app that covers the full arc of a surgical journey. It began as a pre-surgical weight-loss tracker — weight, meals, fasting, and exercise logging with smart forecasts (regression + exponential decay, not straight-line) and a Claude-powered AI coach — and has grown into a daily post-surgical care companion: a time-of-day medication checklist, one-tap tally trackers (hydration, ostomy care, and anything else you define), vitals logging, typed milestones, and a chronological log of everything. Think of it as a digital replacement for the whiteboard and med sheet on the kitchen counter.

**Live:** [https://healthzone.mgm.zone](https://healthzone.mgm.zone) · **Built for:** anyone managing a health program that rewards daily diligence — surgical prep and recovery, medically-guided eating, serious intermittent fasting — and who wants health numbers that tell the truth.

## What it does

- **Today** — a unified daily checklist: medications grouped by AM / Noon / PM / Bedtime slots (with as-needed meds guarded by max-per-day and minimum-spacing safety rules), tap-to-count tracker tiles, binary daily goals, and a quick vitals row.
- **Log** — a chronological, editable-timestamp feed merging medication doses, tracked events, vitals, and journal entries.
- **Milestones** — typed milestones (surgery, procedure, appointment, follow-up, medication, personal) on a timeline and calendar; the priority milestone shows as a dashboard banner, and post-op day counts derive from the surgery milestone.
- **Weight, Nutrition, Exercise, Fasting** — the original program tracking, including protein-focused meal logging with AI macro estimation, Strava sync for exercise, and a weight forecast that fits an exponential-decay curve to your actual trend.
- **Journal + AI** — free-form journaling with Claude-powered pattern insights and shareable narrative reports (for your surgeon, trainer, or future self).
- **Email** — weekly summaries, optional nightly reminders, and milestone notifications via Resend.

Installs as a PWA on phones for one-tap logging.

## Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (PWA-enabled)
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
npx tsc --noEmit    # type check without emitting (permissive — see CLAUDE.md)
```

(`npm run lint` exists but ESLint is currently broken from a plugin version skew — see CLAUDE.md.)

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

Functions include `evaluate-meal`, `analyze-exercise`, `ai-dashboard-feedback`, `ai-journal-insights`, `generate-journal-report`, `send-weekly-summary`, `send-email`, and admin/Strava helpers. Each verifies the caller's JWT internally and reads from shared helpers under `supabase/functions/_shared/` for CORS, model IDs, and usage/cost tracking.

## Production deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for environment-variable requirements and generic deploy targets (Vercel, Netlify, static host), or [`HOMELAB-SETUP.md`](./HOMELAB-SETUP.md) for the Docker + Cloudflare Tunnel setup this project actually runs on.

## Project docs

- [`CLAUDE.md`](./CLAUDE.md) — architecture conventions, the "add a new feature" playbook, key gotchas (timezone handling, model routing, etc.)
- [`DEPLOYMENT.md`](./DEPLOYMENT.md) — production deployment and env vars
- [`HOMELAB-SETUP.md`](./HOMELAB-SETUP.md) — homelab-specific setup guide
- [`ADMIN-GUIDE.md`](./ADMIN-GUIDE.md) — admin features and operations
