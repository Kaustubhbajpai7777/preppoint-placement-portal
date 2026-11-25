-- Placement Preparation Portal initial schema.
-- Run in Supabase SQL Editor. Review policies with your institutional security owner.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  role text not null default 'student' check (role in ('student','examiner','management')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.performance_history (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  prep_point_attempt_id text unique,
  assessment_name text not null,
  score integer not null check (score >= 0),
  total_marks integer not null check (total_marks > 0 and score <= total_marks),
  difficulty text,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
-- Intentionally no percentage column and no topic-level performance table.

create table if not exists public.learning_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  description text,
  difficulty text,
  resource_url text,
  is_published boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  role_title text not null,
  location text,
  opportunity_type text,
  eligibility text,
  deadline date,
  application_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.roadmap_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  stage_key text not null,
  progress integer not null default 0 check (progress between 0 and 100),
  updated_at timestamptz not null default now(),
  unique(student_id, stage_key)
);

alter table public.profiles enable row level security;
alter table public.performance_history enable row level security;
alter table public.learning_resources enable row level security;
alter table public.opportunities enable row level security;
alter table public.roadmap_progress enable row level security;

create policy "profiles_select_own_or_admin" on public.profiles for select
using (auth.uid() = id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role in ('examiner','management')
));
create policy "profiles_update_own" on public.profiles for update
using (auth.uid() = id) with check (auth.uid() = id);

create policy "performance_select_own_or_admin" on public.performance_history for select
using (auth.uid() = student_id or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role in ('examiner','management')
));
-- Assessment writes should be performed by the trusted PrepPoint server using service credentials,
-- never by an untrusted browser client.

create policy "resources_read_published_or_staff" on public.learning_resources for select
using (is_published or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role in ('examiner','management')
));
create policy "resources_staff_insert" on public.learning_resources for insert
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('examiner','management')));
create policy "resources_staff_update" on public.learning_resources for update
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('examiner','management')))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('examiner','management')));

create policy "opportunities_read_published_or_staff" on public.opportunities for select
using (is_published or exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role in ('examiner','management')
));
create policy "opportunities_staff_insert" on public.opportunities for insert
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('examiner','management')));
create policy "opportunities_staff_update" on public.opportunities for update
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('examiner','management')))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('examiner','management')));

create policy "roadmap_select_own" on public.roadmap_progress for select using (auth.uid() = student_id);
create policy "roadmap_insert_own" on public.roadmap_progress for insert with check (auth.uid() = student_id);
create policy "roadmap_update_own" on public.roadmap_progress for update using (auth.uid() = student_id) with check (auth.uid() = student_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();
