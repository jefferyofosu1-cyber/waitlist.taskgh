create extension if not exists "pgcrypto";

create table if not exists public.waitlist_users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone_number text not null unique,
  email text not null unique,
  source text default 'direct',
  created_at timestamptz not null default now(),
  ip_address text,
  referral_code text unique
);

create table if not exists public.notification_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.waitlist_users (id) on delete cascade,
  channel text not null check (channel in ('email', 'sms')),
  provider text not null check (provider in ('brevo', 'flashsms')),
  status text not null check (status in ('queued', 'sent', 'failed', 'delivered')),
  external_message_id text,
  error_message text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_waitlist_users_created_at on public.waitlist_users (created_at desc);
create index if not exists idx_waitlist_users_email on public.waitlist_users (email);
create index if not exists idx_waitlist_users_phone on public.waitlist_users (phone_number);
create index if not exists idx_notification_events_user on public.notification_events (user_id);
create index if not exists idx_notification_events_external on public.notification_events (provider, external_message_id);

-- --------------------------------------------------------
-- Referral tracking
-- --------------------------------------------------------
alter table public.waitlist_users
  add column if not exists referred_by_code text;

create index if not exists idx_waitlist_users_referred_by on public.waitlist_users (referred_by_code);

-- --------------------------------------------------------
-- Persistent rate limiting (survives restarts & scales horizontally)
-- --------------------------------------------------------
create table if not exists public.rate_limits (
  key text primary key,
  count int not null default 1,
  window_start timestamptz not null default now()
);

-- Purge stale rate-limit rows older than 2 minutes (run periodically via pg_cron or manual)
-- delete from public.rate_limits where window_start < now() - interval '2 minutes';
