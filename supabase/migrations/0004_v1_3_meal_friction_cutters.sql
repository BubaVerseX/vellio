-- HealthyLife v1.3 Phase 3: meal completion/eating-out logging + portion scaling support

-- ============================================================
-- meal_logs — per-slot completion tracking (eaten / ate out),
-- independent of the stored plan so marking a meal never mutates
-- or "breaks" the underlying meal_plans row.
-- ============================================================
create table public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  slot text not null check (slot in ('breakfast', 'lunch', 'dinner')),
  status text not null check (status in ('eaten', 'ate_out')),
  created_at timestamptz not null default now(),
  unique (user_id, date, slot)
);

alter table public.meal_logs enable row level security;
create policy "meal_logs_select_own" on public.meal_logs for select using (auth.uid() = user_id);
create policy "meal_logs_insert_own" on public.meal_logs for insert with check (auth.uid() = user_id);
create policy "meal_logs_update_own" on public.meal_logs for update using (auth.uid() = user_id);
create policy "meal_logs_delete_own" on public.meal_logs for delete using (auth.uid() = user_id);

create index idx_meal_logs_user_date on public.meal_logs (user_id, date);

-- Note: portion scaling is stored inline in meal_plans.plan_data (a `portions`
-- map alongside the existing breakfast/lunch/dinner/snacks ids per day) rather
-- than a new table, since it's plan-shape data, not a log.
