create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  pain_score integer not null check (pain_score between 0 and 10),
  energy_score integer not null check (energy_score between 0 and 10),
  mood text not null,
  sleep_quality text not null,
  stress_level text not null,
  symptoms text[] not null default '{}',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create table if not exists public.reminder_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  daily_check_in boolean not null default true,
  daily_check_in_time text not null default '20:00',
  medication boolean not null default false,
  medication_time text not null default '08:00',
  appointment_prep boolean not null default true,
  crisis_care boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.doctor_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  report_text text not null,
  generated_at timestamptz not null default now()
);

create index if not exists doctor_reports_user_id_idx on public.doctor_reports (user_id);

alter table public.profiles enable row level security;
alter table public.daily_entries enable row level security;
alter table public.reminder_settings enable row level security;
alter table public.doctor_reports enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.daily_entries to authenticated;
grant select, insert, update on public.reminder_settings to authenticated;
grant select, insert on public.doctor_reports to authenticated;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "daily_entries_select_own" on public.daily_entries;
drop policy if exists "daily_entries_insert_own" on public.daily_entries;
drop policy if exists "daily_entries_update_own" on public.daily_entries;
drop policy if exists "daily_entries_delete_own" on public.daily_entries;
drop policy if exists "reminders_select_own" on public.reminder_settings;
drop policy if exists "reminders_insert_own" on public.reminder_settings;
drop policy if exists "reminders_update_own" on public.reminder_settings;
drop policy if exists "reports_select_own" on public.doctor_reports;
drop policy if exists "reports_insert_own" on public.doctor_reports;

create policy "profiles_select_own" on public.profiles for select to authenticated using ((select auth.uid()) is not null and user_id = (select auth.uid()));
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check ((select auth.uid()) is not null and user_id = (select auth.uid()));
create policy "profiles_update_own" on public.profiles for update to authenticated using ((select auth.uid()) is not null and user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "daily_entries_select_own" on public.daily_entries for select to authenticated using ((select auth.uid()) is not null and user_id = (select auth.uid()));
create policy "daily_entries_insert_own" on public.daily_entries for insert to authenticated with check ((select auth.uid()) is not null and user_id = (select auth.uid()));
create policy "daily_entries_update_own" on public.daily_entries for update to authenticated using ((select auth.uid()) is not null and user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "daily_entries_delete_own" on public.daily_entries for delete to authenticated using ((select auth.uid()) is not null and user_id = (select auth.uid()));

create policy "reminders_select_own" on public.reminder_settings for select to authenticated using ((select auth.uid()) is not null and user_id = (select auth.uid()));
create policy "reminders_insert_own" on public.reminder_settings for insert to authenticated with check ((select auth.uid()) is not null and user_id = (select auth.uid()));
create policy "reminders_update_own" on public.reminder_settings for update to authenticated using ((select auth.uid()) is not null and user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "reports_select_own" on public.doctor_reports for select to authenticated using ((select auth.uid()) is not null and user_id = (select auth.uid()));
create policy "reports_insert_own" on public.doctor_reports for insert to authenticated with check ((select auth.uid()) is not null and user_id = (select auth.uid()));

create schema if not exists private;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1), 'Usuaria')
  )
  on conflict (user_id) do update
    set name = excluded.name,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_raiz on auth.users;

create trigger on_auth_user_created_raiz
after insert on auth.users
for each row execute function private.handle_new_user();
