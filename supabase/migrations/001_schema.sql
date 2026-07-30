-- 001_schema.sql
-- PJT SKYBLUE — Window Cleaner MVP

create table if not exists scope_templates (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references auth.users on delete cascade,
  name text not null,
  items jsonb default '[]'::jsonb,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists rounds (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references auth.users on delete cascade,
  name text not null,
  day_of_week int default 1,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  round_id uuid references rounds on delete cascade,
  profile_id uuid references auth.users on delete cascade,
  scope_template_id uuid references scope_templates on delete set null,
  address_line1 text,
  address_line2 text,
  postcode text,
  lat float,
  lng float,
  customer_name text,
  customer_phone text,
  price numeric,
  sort_order int default 0,
  status text default 'pending',
  scope_done jsonb default '[]'::jsonb,
  photo_before text,
  photo_after text,
  created_at timestamptz default now(),
  done_at timestamptz
);

-- RLS: profile_id = auth.uid()
alter table scope_templates enable row level security;
alter table rounds enable row level security;
alter table jobs enable row level security;

create policy "own scope_templates" on scope_templates for all using (profile_id = auth.uid());
create policy "own rounds" on rounds for all using (profile_id = auth.uid());
create policy "own jobs" on jobs for all using (profile_id = auth.uid());

-- Storage bucket
insert into storage.buckets (id, name) values ('job-photos', 'job-photos') on conflict do nothing;

create policy "own photos" on storage.objects for all using (
  bucket_id = 'job-photos' and auth.uid()::text = (storage.foldername(name))[1]
);

-- Seed: default scope template (inserted per-user on first use)
-- Actual seeding done in app via supabase function or first-run migration
