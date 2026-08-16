-- HealthyLife v1 schema
create extension if not exists "pgcrypto";

-- ============================================================
-- profiles (extends auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  locale text not null default 'en' check (locale in ('en', 'ka')),

  age int check (age between 13 and 100),
  weight_kg numeric(5,2) check (weight_kg > 0),
  height_cm numeric(5,2) check (height_cm > 0),
  sex text check (sex in ('male', 'female', 'other')),

  activity_level text check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  goal text check (goal in ('lose_weight', 'gain_weight', 'maintain', 'build_muscle')),

  allergies text[] not null default '{}',
  dietary_restrictions text[] not null default '{}',
  restrictions_notes text,
  medical_conditions text,

  time_available_minutes int check (time_available_minutes >= 0),
  equipment_setting text check (equipment_setting in ('home', 'gym', 'both')),

  disclaimer_accepted_at timestamptz,
  onboarding_completed boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- auto-create profile row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- recipes (curated content, managed via SQL / seed only)
-- ============================================================
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_ka text,
  description text,
  description_ka text,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  cuisine text not null default 'international' check (cuisine in ('georgian', 'international')),

  calories int not null check (calories >= 0),
  protein_g numeric(6,2) not null default 0,
  carbs_g numeric(6,2) not null default 0,
  fat_g numeric(6,2) not null default 0,

  allergens text[] not null default '{}',
  dietary_tags text[] not null default '{}',

  prep_time_minutes int not null default 15,
  image_url text,
  ingredients jsonb not null default '[]',
  instructions text,
  instructions_ka text,

  created_at timestamptz not null default now()
);

alter table public.recipes enable row level security;
create policy "recipes_select_all" on public.recipes for select using (true);

-- ============================================================
-- exercises (curated content, managed via SQL / seed only)
-- ============================================================
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_ka text,
  muscle_group text not null check (
    muscle_group in ('chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'full_body', 'cardio')
  ),
  equipment text[] not null default '{}',
  setting text not null check (setting in ('home', 'gym', 'both')),
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),

  instructions text,
  instructions_ka text,
  image_url text,
  video_url text,

  default_sets int not null default 3,
  default_reps text not null default '10-12',

  created_at timestamptz not null default now()
);

alter table public.exercises enable row level security;
create policy "exercises_select_all" on public.exercises for select using (true);

-- ============================================================
-- meal_plans
-- ============================================================
create table public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_start date not null,
  daily_calorie_target int not null,
  macro_targets jsonb not null default '{}',
  plan_data jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique (user_id, week_start)
);

alter table public.meal_plans enable row level security;
create policy "meal_plans_select_own" on public.meal_plans for select using (auth.uid() = user_id);
create policy "meal_plans_insert_own" on public.meal_plans for insert with check (auth.uid() = user_id);
create policy "meal_plans_update_own" on public.meal_plans for update using (auth.uid() = user_id);
create policy "meal_plans_delete_own" on public.meal_plans for delete using (auth.uid() = user_id);

-- ============================================================
-- workout_plans
-- ============================================================
create table public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_start date not null,
  setting text not null check (setting in ('home', 'gym')),
  plan_data jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique (user_id, week_start)
);

alter table public.workout_plans enable row level security;
create policy "workout_plans_select_own" on public.workout_plans for select using (auth.uid() = user_id);
create policy "workout_plans_insert_own" on public.workout_plans for insert with check (auth.uid() = user_id);
create policy "workout_plans_update_own" on public.workout_plans for update using (auth.uid() = user_id);
create policy "workout_plans_delete_own" on public.workout_plans for delete using (auth.uid() = user_id);

-- ============================================================
-- progress_logs
-- ============================================================
create table public.progress_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  weight_kg numeric(5,2),
  workout_completed boolean,
  workout_notes text,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.progress_logs enable row level security;
create policy "progress_logs_select_own" on public.progress_logs for select using (auth.uid() = user_id);
create policy "progress_logs_insert_own" on public.progress_logs for insert with check (auth.uid() = user_id);
create policy "progress_logs_update_own" on public.progress_logs for update using (auth.uid() = user_id);
create policy "progress_logs_delete_own" on public.progress_logs for delete using (auth.uid() = user_id);

-- ============================================================
-- reminders
-- ============================================================
create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('meal', 'workout')),
  schedule jsonb not null default '{}',
  enabled boolean not null default true,
  last_sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.reminders enable row level security;
create policy "reminders_select_own" on public.reminders for select using (auth.uid() = user_id);
create policy "reminders_insert_own" on public.reminders for insert with check (auth.uid() = user_id);
create policy "reminders_update_own" on public.reminders for update using (auth.uid() = user_id);
create policy "reminders_delete_own" on public.reminders for delete using (auth.uid() = user_id);

-- ============================================================
-- indexes
-- ============================================================
create index idx_meal_plans_user_week on public.meal_plans (user_id, week_start desc);
create index idx_workout_plans_user_week on public.workout_plans (user_id, week_start desc);
create index idx_progress_logs_user_date on public.progress_logs (user_id, date desc);
create index idx_reminders_user on public.reminders (user_id);
create index idx_recipes_meal_type on public.recipes (meal_type);
create index idx_exercises_setting on public.exercises (setting);
