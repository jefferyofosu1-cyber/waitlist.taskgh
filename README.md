# TaskGH Waitlist

Landing page and waitlist system for pre-launch signups.

## Stack

- Next.js (App Router), React, Tailwind CSS
- Supabase (storage/admin queries)
- Brevo API (email confirmation)
- FlashSMS Africa API (SMS confirmation)
- Vercel-ready deployment

## Setup

1. Copy `.env.example` to `.env.local`
2. Fill all required environment values
3. Run schema in Supabase SQL editor:
   - `supabase/schema.sql`
4. Install and run:

```bash
npm install
npm run dev
```

## Features

- Premium mobile-first landing page
- Waitlist signup API with:
  - server-side validation
  - Ghana phone normalization and validation
  - duplicate prevention (email/phone)
  - in-memory rate limiting
  - honeypot anti-bot
- Instant confirmation:
  - Email via Brevo
  - SMS via FlashSMS Africa
- Success page with referral code support
- Protected admin dashboard:
  - total signups
  - today signups
  - search by email/phone
  - CSV export
  - delete spam entries
  - notification event logs (queued/sent/failed/delivered)
- Notification webhook endpoint:
  - `/api/webhooks/notifications`
  - updates delivery statuses by `external_message_id`

## Admin protection

Session-based admin login protects dashboard and admin APIs:

- `/admin/login`
- `/admin`
- `/api/admin/*`

Use:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `NOTIFICATION_WEBHOOK_SECRET`
- `EMAIL_LOGO_URL` (optional branded email logo)

## Deploy on Vercel

- Import project in Vercel
- Set all environment variables from `.env.example`
- Deploy
