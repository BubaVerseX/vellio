-- Supra mode: a distinct "social meal" logging status (planned feast/social
-- eating occasion), alongside the existing eaten/ate_out statuses.
alter table public.meal_logs drop constraint meal_logs_status_check;
alter table public.meal_logs add constraint meal_logs_status_check check (status in ('eaten', 'ate_out', 'social'));
