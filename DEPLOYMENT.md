# HealthZone Deployment Guide

## Overview
This guide covers deploying the HealthZone application from Lovable to your own infrastructure.

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
Set these in your Supabase project settings:

```bash
# Supabase Service Role (for edge functions)
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email Service
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=HealthZone <noreply@yourdomain.com>

# Security
ALLOWED_ORIGIN=https://yourdomain.com  # Restricts CORS
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
   ```bash
   supabase functions deploy send-email
   supabase functions deploy send-weekly-summary
   ```

4. **Set Environment Variables**
   ```bash
   supabase secrets set RESEND_API_KEY=your_key
   supabase secrets set FROM_EMAIL=your_email
   supabase secrets set ALLOWED_ORIGIN=https://yourdomain.com
   ```

## Security Checklist

- [ ] Environment variables are properly set and not exposed
- [ ] CORS is configured to only allow your domain
- [ ] Supabase RLS policies are properly configured
- [ ] Email sender domain is verified in Resend
- [ ] SSL/TLS certificate is configured for your domain
- [ ] Dependencies are updated and vulnerabilities fixed

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