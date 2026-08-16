-- HealthyLife v1.1: swapping/favorites, grocery list, photo progress, measurements

-- ============================================================
-- favorites
-- ============================================================
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_type text not null check (item_type in ('recipe', 'exercise')),
  item_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, item_type, item_id)
);

alter table public.favorites enable row level security;
create policy "favorites_select_own" on public.favorites for select using (auth.uid() = user_id);
create policy "favorites_insert_own" on public.favorites for insert with check (auth.uid() = user_id);
create policy "favorites_delete_own" on public.favorites for delete using (auth.uid() = user_id);

create index idx_favorites_user on public.favorites (user_id, item_type);

-- ============================================================
-- grocery_list_items — persists checked state per normalized
-- ingredient name for a given user + week. The aggregated list
-- itself is computed on the fly from that week's meal_plans.
-- ============================================================
create table public.grocery_list_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_start date not null,
  ingredient_key text not null,
  checked boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, week_start, ingredient_key)
);

alter table public.grocery_list_items enable row level security;
create policy "grocery_list_items_select_own" on public.grocery_list_items for select using (auth.uid() = user_id);
create policy "grocery_list_items_insert_own" on public.grocery_list_items for insert with check (auth.uid() = user_id);
create policy "grocery_list_items_update_own" on public.grocery_list_items for update using (auth.uid() = user_id);
create policy "grocery_list_items_delete_own" on public.grocery_list_items for delete using (auth.uid() = user_id);

create index idx_grocery_list_items_user_week on public.grocery_list_items (user_id, week_start);

-- ============================================================
-- progress_logs: optional private progress photo
-- ============================================================
alter table public.progress_logs add column photo_path text;

-- ============================================================
-- measurements
-- ============================================================
create table public.measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  waist_cm numeric(5,2),
  chest_cm numeric(5,2),
  hips_cm numeric(5,2),
  arms_cm numeric(5,2),
  thighs_cm numeric(5,2),
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.measurements enable row level security;
create policy "measurements_select_own" on public.measurements for select using (auth.uid() = user_id);
create policy "measurements_insert_own" on public.measurements for insert with check (auth.uid() = user_id);
create policy "measurements_update_own" on public.measurements for update using (auth.uid() = user_id);
create policy "measurements_delete_own" on public.measurements for delete using (auth.uid() = user_id);

create index idx_measurements_user_date on public.measurements (user_id, date desc);

-- ============================================================
-- private storage bucket for progress photos
-- ============================================================
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

-- Users may only read/write objects inside a folder named after their own
-- user id, e.g. progress-photos/<user_id>/<filename>.
create policy "progress_photos_select_own" on storage.objects
  for select using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "progress_photos_insert_own" on storage.objects
  for insert with check (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "progress_photos_update_own" on storage.objects
  for update using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "progress_photos_delete_own" on storage.objects
  for delete using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- restructure recipes.ingredients from a flat string array into
-- {name, quantity, unit, category}[] so the grocery list feature
-- can aggregate and group by category.
-- ============================================================
update public.recipes set ingredients = '[
  {"name":"apple","quantity":1,"unit":"pcs","category":"produce"},
  {"name":"sunflower seed butter","quantity":30,"unit":"g","category":"pantry"}
]'::jsonb where name = 'Apple with Sunflower Seed Butter';

update public.recipes set ingredients = '[
  {"name":"salmon fillet","quantity":180,"unit":"g","category":"seafood"},
  {"name":"sweet potato","quantity":200,"unit":"g","category":"produce"},
  {"name":"olive oil","quantity":15,"unit":"ml","category":"pantry"},
  {"name":"spinach","quantity":60,"unit":"g","category":"produce"},
  {"name":"garlic","quantity":2,"unit":"cloves","category":"produce"}
]'::jsonb where name = 'Baked Salmon with Sweet Potato';

update public.recipes set ingredients = '[
  {"name":"chicken thighs","quantity":300,"unit":"g","category":"meat"},
  {"name":"onion","quantity":1,"unit":"pcs","category":"produce"},
  {"name":"flour","quantity":20,"unit":"g","category":"pantry"},
  {"name":"eggs","quantity":2,"unit":"pcs","category":"dairy"},
  {"name":"lemon juice","quantity":30,"unit":"ml","category":"produce"},
  {"name":"cilantro","quantity":10,"unit":"g","category":"produce"},
  {"name":"salt","quantity":1,"unit":"tsp","category":"spices"}
]'::jsonb where name = 'Chikhirtma (Georgian Chicken Soup)';

update public.recipes set ingredients = '[
  {"name":"cottage cheese","quantity":150,"unit":"g","category":"dairy"},
  {"name":"cucumber","quantity":1,"unit":"pcs","category":"produce"},
  {"name":"olive oil","quantity":10,"unit":"ml","category":"pantry"},
  {"name":"dill","quantity":5,"unit":"g","category":"produce"}
]'::jsonb where name = 'Cottage Cheese & Cucumber Plate';

update public.recipes set ingredients = '[
  {"name":"edamame","quantity":150,"unit":"g","category":"produce"},
  {"name":"sea salt","quantity":1,"unit":"tsp","category":"spices"}
]'::jsonb where name = 'Edamame with Sea Salt';

update public.recipes set ingredients = '[
  {"name":"eggplant","quantity":1,"unit":"pcs","category":"produce"},
  {"name":"bell pepper","quantity":2,"unit":"pcs","category":"produce"},
  {"name":"tomato","quantity":2,"unit":"pcs","category":"produce"},
  {"name":"onion","quantity":1,"unit":"pcs","category":"produce"},
  {"name":"garlic","quantity":2,"unit":"cloves","category":"produce"},
  {"name":"cilantro","quantity":10,"unit":"g","category":"produce"}
]'::jsonb where name = 'Georgian Vegetable Ajapsandali';

update public.recipes set ingredients = '[
  {"name":"greek yogurt","quantity":200,"unit":"g","category":"dairy"},
  {"name":"walnuts","quantity":20,"unit":"g","category":"pantry"},
  {"name":"honey","quantity":15,"unit":"ml","category":"pantry"},
  {"name":"berries","quantity":80,"unit":"g","category":"produce"}
]'::jsonb where name = 'Greek Yogurt Bowl with Walnuts & Honey';

update public.recipes set ingredients = '[
  {"name":"chicken breast","quantity":200,"unit":"g","category":"meat"},
  {"name":"quinoa","quantity":80,"unit":"g","category":"pantry"},
  {"name":"broccoli","quantity":100,"unit":"g","category":"produce"},
  {"name":"olive oil","quantity":15,"unit":"ml","category":"pantry"},
  {"name":"lemon","quantity":0.5,"unit":"pcs","category":"produce"}
]'::jsonb where name = 'Grilled Chicken & Quinoa Bowl';

update public.recipes set ingredients = '[
  {"name":"chickpeas","quantity":150,"unit":"g","category":"pantry"},
  {"name":"tahini","quantity":20,"unit":"g","category":"pantry"},
  {"name":"lemon","quantity":0.5,"unit":"pcs","category":"produce"},
  {"name":"carrot","quantity":1,"unit":"pcs","category":"produce"},
  {"name":"celery","quantity":2,"unit":"stalks","category":"produce"}
]'::jsonb where name = 'Hummus & Veggie Sticks';

update public.recipes set ingredients = '[
  {"name":"whole grain bread","quantity":2,"unit":"slices","category":"pantry"},
  {"name":"sulguni cheese","quantity":60,"unit":"g","category":"dairy"},
  {"name":"egg","quantity":1,"unit":"pcs","category":"dairy"},
  {"name":"butter","quantity":10,"unit":"g","category":"dairy"}
]'::jsonb where name = 'Khachapuri-style Egg & Cheese Toast (lighter)';

update public.recipes set ingredients = '[
  {"name":"ground beef and pork","quantity":300,"unit":"g","category":"meat"},
  {"name":"flour","quantity":250,"unit":"g","category":"pantry"},
  {"name":"onion","quantity":1,"unit":"pcs","category":"produce"},
  {"name":"black pepper","quantity":1,"unit":"tsp","category":"spices"},
  {"name":"water","quantity":150,"unit":"ml","category":"pantry"}
]'::jsonb where name = 'Khinkali (Steamed Dumplings, light portion)';

update public.recipes set ingredients = '[
  {"name":"red lentils","quantity":150,"unit":"g","category":"pantry"},
  {"name":"onion","quantity":1,"unit":"pcs","category":"produce"},
  {"name":"carrot","quantity":1,"unit":"pcs","category":"produce"},
  {"name":"cumin","quantity":1,"unit":"tsp","category":"spices"},
  {"name":"lemon","quantity":0.5,"unit":"pcs","category":"produce"}
]'::jsonb where name = 'Lentil Soup (Mercimek)';

update public.recipes set ingredients = '[
  {"name":"kidney beans","quantity":250,"unit":"g","category":"pantry"},
  {"name":"onion","quantity":1,"unit":"pcs","category":"produce"},
  {"name":"walnuts","quantity":40,"unit":"g","category":"pantry"},
  {"name":"cilantro","quantity":10,"unit":"g","category":"produce"},
  {"name":"garlic","quantity":2,"unit":"cloves","category":"produce"},
  {"name":"blue fenugreek","quantity":1,"unit":"tsp","category":"spices"},
  {"name":"chili","quantity":1,"unit":"pcs","category":"produce"}
]'::jsonb where name = 'Lobio (Georgian Bean Stew)';

update public.recipes set ingredients = '[
  {"name":"cornmeal","quantity":150,"unit":"g","category":"pantry"},
  {"name":"water","quantity":150,"unit":"ml","category":"pantry"},
  {"name":"salt","quantity":1,"unit":"tsp","category":"spices"},
  {"name":"sulguni cheese","quantity":80,"unit":"g","category":"dairy"}
]'::jsonb where name = 'Mchadi with Sulguni';

update public.recipes set ingredients = '[
  {"name":"mixed greens","quantity":100,"unit":"g","category":"produce"},
  {"name":"halloumi","quantity":100,"unit":"g","category":"dairy"},
  {"name":"cherry tomato","quantity":100,"unit":"g","category":"produce"},
  {"name":"olive oil","quantity":15,"unit":"ml","category":"pantry"},
  {"name":"balsamic","quantity":10,"unit":"ml","category":"pantry"}
]'::jsonb where name = 'Mixed Greens Salad with Grilled Halloumi';

update public.recipes set ingredients = '[
  {"name":"rolled oats","quantity":60,"unit":"g","category":"pantry"},
  {"name":"milk","quantity":200,"unit":"ml","category":"dairy"},
  {"name":"banana","quantity":1,"unit":"pcs","category":"produce"},
  {"name":"peanut butter","quantity":20,"unit":"g","category":"pantry"},
  {"name":"chia seeds","quantity":10,"unit":"g","category":"pantry"}
]'::jsonb where name = 'Overnight Oats with Banana & Peanut Butter';

update public.recipes set ingredients = '[
  {"name":"protein powder","quantity":30,"unit":"g","category":"pantry"},
  {"name":"milk","quantity":250,"unit":"ml","category":"dairy"},
  {"name":"banana","quantity":1,"unit":"pcs","category":"produce"},
  {"name":"ice","quantity":100,"unit":"g","category":"other"}
]'::jsonb where name = 'Protein Smoothie';

update public.recipes set ingredients = '[
  {"name":"chickpeas","quantity":200,"unit":"g","category":"pantry"},
  {"name":"olive oil","quantity":15,"unit":"ml","category":"pantry"},
  {"name":"paprika","quantity":1,"unit":"tsp","category":"spices"},
  {"name":"salt","quantity":1,"unit":"tsp","category":"spices"}
]'::jsonb where name = 'Roasted Chickpeas';

update public.recipes set ingredients = '[
  {"name":"turkey slices","quantity":120,"unit":"g","category":"meat"},
  {"name":"cucumber","quantity":1,"unit":"pcs","category":"produce"},
  {"name":"mustard","quantity":10,"unit":"g","category":"pantry"}
]'::jsonb where name = 'Turkey & Cucumber Roll-ups';

update public.recipes set ingredients = '[
  {"name":"ground turkey","quantity":250,"unit":"g","category":"meat"},
  {"name":"bell pepper","quantity":1,"unit":"pcs","category":"produce"},
  {"name":"broccoli","quantity":100,"unit":"g","category":"produce"},
  {"name":"soy sauce","quantity":20,"unit":"ml","category":"pantry"},
  {"name":"garlic","quantity":2,"unit":"cloves","category":"produce"},
  {"name":"ginger","quantity":5,"unit":"g","category":"produce"},
  {"name":"rice","quantity":150,"unit":"g","category":"pantry"}
]'::jsonb where name = 'Turkey & Vegetable Stir-fry';
