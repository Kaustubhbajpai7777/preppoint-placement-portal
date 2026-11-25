
-- PrepPoint Phase 1: Security hardening
-- Run AFTER 001_initial_schema.sql

-- 1. Security-definer helper avoids recursive profile RLS checks.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role in ('examiner', 'management')
  );
$$;

revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to authenticated;

-- 2. Prevent users from promoting themselves to staff.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'You are not allowed to change your account role';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_role_trigger
on public.profiles;

create trigger protect_profile_role_trigger
before update on public.profiles
for each row
execute function public.protect_profile_role();

-- 3. Replace recursive profile policies.
drop policy if exists profiles_select_own_or_admin
on public.profiles;

create policy profiles_select_own_or_admin
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or (select public.is_staff())
);

drop policy if exists profiles_update_own
on public.profiles;

create policy profiles_update_own
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- 4. Replace staff checks with the secure helper.
drop policy if exists resources_read_published_or_staff
on public.learning_resources;

create policy resources_read_published_or_staff
on public.learning_resources
for select
using (
  is_published or (select public.is_staff())
);

drop policy if exists resources_staff_insert
on public.learning_resources;

create policy resources_staff_insert
on public.learning_resources
for insert
to authenticated
with check ((select public.is_staff()));

drop policy if exists resources_staff_update
on public.learning_resources;

create policy resources_staff_update
on public.learning_resources
for update
to authenticated
using ((select public.is_staff()))
with check ((select public.is_staff()));

drop policy if exists opportunities_read_published_or_staff
on public.opportunities;

create policy opportunities_read_published_or_staff
on public.opportunities
for select
using (
  is_published or (select public.is_staff())
);

drop policy if exists opportunities_staff_insert
on public.opportunities;

create policy opportunities_staff_insert
on public.opportunities
for insert
to authenticated
with check ((select public.is_staff()));

drop policy if exists opportunities_staff_update
on public.opportunities;

create policy opportunities_staff_update
on public.opportunities
for update
to authenticated
using ((select public.is_staff()))
with check ((select public.is_staff()));

-- End of Phase 1 security migration.
