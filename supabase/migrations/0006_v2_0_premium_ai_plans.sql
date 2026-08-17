-- ============================================================
-- v2.0: premium tier, AI-generated plans, progress projection.
-- ============================================================

alter table public.profiles
  add column if not exists subscription_status text not null default 'none'
    check (subscription_status in ('none', 'active', 'expired')),
  add column if not exists subscription_started_at timestamptz,
  add column if not exists subscription_expires_at timestamptz;

-- ============================================================
-- ai_plans: one row per user holding their current AI-generated
-- plan (meal + workout, same shapes as meal_plans.plan_data /
-- workout_plans.plan_data so existing display components work
-- unchanged), the profile snapshot it was generated from (to
-- detect when regeneration is warranted), and the progress
-- projection shown on /progress. Regenerated only when the
-- user's profile has drifted meaningfully from source_profile —
-- never on every visit.
-- ============================================================
create table public.ai_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  generated_at timestamptz not null default now(),
  source_profile jsonb not null,
  meal_plan_data jsonb not null,
  workout_plan_data jsonb not null,
  workout_setting text not null,
  calorie_target int not null,
  macro_targets jsonb not null,
  projection jsonb,
  model_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ai_plans enable row level security;
create policy "ai_plans_select_own" on public.ai_plans for select using (auth.uid() = user_id);
create policy "ai_plans_insert_own" on public.ai_plans for insert with check (auth.uid() = user_id);
create policy "ai_plans_update_own" on public.ai_plans for update using (auth.uid() = user_id);
