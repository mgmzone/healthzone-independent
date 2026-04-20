# HealthZone Deployment Guide

## Overview
This guide covers deploying the HealthZone application to your own infrastructure — Vercel, Netlify, a static host, or a Docker-based homelab.

## Prerequisites

### Required Services
1. **Supabase Project** - Database and authentication
2. **Resend Account** - Email service
3. **Web Hosting** - Static hosting (Vercel, Netlify, or your own server)

### Local Development Requirements
- Node.js 18+ 
- npm or yarn
- Git

## Environment Variables

### Frontend Environment Variables
Create a `.env.local` file (for local development) or set these in your hosting platform:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
VITE_APP_URL=https://yourdomain.com  # or http://localhost:8080 for local dev
```

### Backend Environment Variables (Supabase Edge Functions)
Set these via `supabase secrets set KEY=value`. `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_ANON_KEY` are provided automatically by the Supabase runtime — don't set them manually.

```bash
# Security — REQUIRED. CORS helper fails closed if unset, so all browser
# calls to edge functions will be rejected without this.
ALLOWED_ORIGIN=https://yourdomain.com   # comma-separate for multi-origin

# App URL — used for unsubscribe links and email content
APP_URL=https://yourdomain.com

# Email — required for any email-sending function
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=HealthZone <noreply@yourdomain.com>

# Cron authentication — required for send-weekly-summary and send-system-emails
CRON_SECRET=a_long_random_string

# Claude AI — only needed if you want AI features to work for users who
# haven't added their own API key. Set a per-user daily dollar cap to
# limit cost exposure.
CLAUDE_API_KEY_FALLBACK=sk-ant-...
CLAUDE_FALLBACK_DAILY_CAP_USD=0.25      # optional; defaults to 0.25
```

## Local Development Setup

1. **Clone and Install**
   ```bash
   git clone <your-repo>
   cd healthzone
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   # App will be available at http://localhost:8080
   ```

4. **Build for Production**
   ```bash
   npm run build
   # Outputs to ./dist directory
   ```

## Deployment Options

### Option 1: Vercel (Recommended)
1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Option 2: Netlify
1. Connect your GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set environment variables in Netlify dashboard

### Option 3: Static Hosting (Nginx, Apache, etc.)
1. Build the project: `npm run build`
2. Upload contents of `dist/` folder to your web server
3. Configure your web server to serve the SPA correctly (handle client-side routing)

## Supabase Edge Functions Deployment

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   supabase login
   ```

2. **Link to Your Project**
   ```bash
   supabase link --project-ref your-project-id
   ```

3. **Deploy Functions**
   All functions deploy with `--no-verify-jwt` because each function handles auth internally; the `--no-verify-jwt` flag disables the Supabase gateway's JWT check so browser CORS preflight requests aren't rejected.
   ```bash
   # AI (Claude-powered)
   supabase functions deploy evaluate-meal --no-verify-jwt
   supabase functions deploy analyze-exercise --no-verify-jwt
   supabase functions deploy ai-dashboard-feedback --no-verify-jwt
   supabase functions deploy ai-journal-insights --no-verify-jwt
   supabase functions deploy generate-doctor-report --no-verify-jwt

   # Email
   supabase functions deploy send-email --no-verify-jwt
   supabase functions deploy send-weekly-summary --no-verify-jwt
   supabase functions deploy send-welcome-email --no-verify-jwt
   supabase functions deploy send-system-emails --no-verify-jwt
   supabase functions deploy send-daily-reminders --no-verify-jwt
   supabase functions deploy send-admin-daily-digest --no-verify-jwt
   supabase functions deploy unsubscribe-email --no-verify-jwt

   # Admin (require is_admin server-side)
   supabase functions deploy admin-delete-user --no-verify-jwt
   supabase functions deploy admin-set-user-ban --no-verify-jwt

   # Strava integration
   supabase functions deploy strava-oauth-exchange --no-verify-jwt
   supabase functions deploy strava-sync --no-verify-jwt
   ```

4. **Set Secrets** — see the Backend Environment Variables section above for the full list and which are required vs. optional.

## Security Checklist

- [ ] `ALLOWED_ORIGIN` set to your production origin(s). Without it, `_shared/cors.ts` fails closed and browser calls get blocked.
- [ ] `CLAUDE_FALLBACK_DAILY_CAP_USD` set to a comfortable limit (default $0.25/day/user). The fallback key lets users without their own Claude key burn your credits; cap is enforced via `checkFallbackDailyCap()` in `_shared/aiUsage.ts`.
- [ ] `CRON_SECRET` is a long random string and rotated periodically. Used by `send-weekly-summary` and `send-system-emails`; compared via constant-time equality.
- [ ] Supabase RLS is enabled on every table in `public` schema with `auth.uid() = user_id` policies (or `auth.uid() = id` for `profiles`). Verify in the Supabase dashboard → Authentication → Policies.
- [ ] Admin functions (`admin-delete-user`, `admin-set-user-ban`) verify `is_admin` server-side before any privileged operation.
- [ ] Resend sending domain(s) are verified in Resend dashboard, and `FROM_EMAIL` matches a verified domain.
- [ ] SSL/TLS is active on the production origin (automatic if using Cloudflare/Vercel/Netlify).
- [ ] No service-role key or other secret is exposed to the client bundle (only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are; both are safe by design).

## Performance Optimization

- Bundle is automatically split for better loading
- Images are optimized and compressed
- Consider implementing CDN for static assets
- Monitor bundle size warnings during build

## Monitoring & Maintenance

1. **Error Tracking** - Consider adding Sentry or similar
2. **Analytics** - Add Google Analytics or privacy-friendly alternative
3. **Uptime Monitoring** - Monitor your domain and API endpoints
4. **Regular Updates** - Keep dependencies updated monthly

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure variables start with `VITE_` for client-side access
   - Check that `.env.local` is in the root directory
   - Restart the development server after changes

2. **Supabase Connection Issues**
   - Verify URL and keys are correct
   - Check if your domain is added to Supabase allowed origins

3. **Email Function Errors**
   - Ensure Resend API key is set in Supabase secrets
   - Verify FROM_EMAIL domain is verified in Resend
   - Check function logs in Supabase dashboard

4. **Build Failures**
   - Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
   - Check for TypeScript errors: `npm run build`

## Support

For issues specific to this deployment:
1. Check the troubleshooting section above
2. Review Supabase and Resend documentation
3. Check the browser console for client-side errors
4. Review Supabase function logs for backend errors