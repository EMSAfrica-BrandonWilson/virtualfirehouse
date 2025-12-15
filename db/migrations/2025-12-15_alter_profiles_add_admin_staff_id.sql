alter table if exists public.profiles
  add column if not exists staff_id text,
  add column if not exists is_admin boolean default false;
