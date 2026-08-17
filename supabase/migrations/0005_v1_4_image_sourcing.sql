-- ============================================================
-- v1.4: Unsplash-sourced photography for recipes/exercises,
-- cached on first fetch so we don't re-call the API on every
-- page load. image_url already existed (v1.0); this adds the
-- attribution fields required by Unsplash's API guidelines and
-- a fetch marker so failed/no-result lookups aren't retried
-- on every request.
-- ============================================================

alter table public.recipes
  add column if not exists image_attribution_name text,
  add column if not exists image_attribution_url text,
  add column if not exists image_fetched_at timestamptz;

alter table public.exercises
  add column if not exists image_attribution_name text,
  add column if not exists image_attribution_url text,
  add column if not exists image_fetched_at timestamptz;

-- ============================================================
-- workout templates (workouts/templates gallery) are static
-- content defined in code, not a DB table, so their resolved
-- images are cached here instead, keyed by the template id.
-- ============================================================
create table public.template_images (
  template_id text primary key,
  image_url text,
  attribution_name text,
  attribution_url text,
  fetched_at timestamptz not null default now()
);

alter table public.template_images enable row level security;
create policy "template_images_select_all" on public.template_images for select using (true);
