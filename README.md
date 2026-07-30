# Skyblue — Window Cleaner SaaS (MVP)

Mobile-first app for solo window cleaners. Three modules:
1. **Round Planner** — organize jobs by day, optimize driving route on map
2. **Job Logger** — standardized checklists + before/after photos + auto SMS to customer
3. **Auto Presence** — prep Google Business Profile posts from completed jobs

Stack: React (Vite) + Supabase + Tailwind CSS + Twilio

## Quick Start

```bash
npm install
cp .env.example .env
# Edit .env with your Supabase URL and anon key
npm run dev
```

## Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Run migration in SQL Editor: `supabase/migrations/001_schema.sql`
3. Copy URL and anon key to `.env`
4. Enable Auth → Email (disable confirmations for MVP)

### SMS (Twilio)

Deploy the Edge Function:
```bash
supabase functions deploy send-sms --project-ref <your-ref>
supabase secrets set TWILIO_ACCOUNT_SID=... TWILIO_AUTH_TOKEN=... TWILIO_PHONE_NUMBER=+44...
```

### Storage

Create bucket `job-photos` (public) in Supabase Dashboard → Storage.

## Deploy

```bash
npm run build
npx vercel --prod
```

Or connect the repo to [Vercel](https://vercel.com) for auto-deploy on push.

Set env vars in Vercel dashboard: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

## Extension Points

The schema includes unused columns for future features:
- `jobs.price` → revenue analytics
- `jobs.customer_email` → customer portal + reminders
- `profiles` → Stripe account

## Plan

See `~/.hermes/plans/pjt-skyblue-mvp.md` for full spec.
