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

create index if not exists idx_waitlist_users_created_at on public.waitlist_users (created_at desc);
create index if not exists idx_waitlist_users_email on public.waitlist_users (email);
create index if not exists idx_waitlist_users_phone on public.waitlist_users (phone_number);
