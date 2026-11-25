create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text check (description is null or char_length(description) <= 400),
  category_id uuid references public.categories(id) on delete set null,
  image_url text,
  gallery_urls text[] not null default '{}',
  is_published boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated before update on public.products
  for each row execute function public.set_updated_at();

create table if not exists public.product_links (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  country_code text not null check (country_code in ('US','IN','BR','MX','ID')),
  url text not null check (url ~* '^https://'),
  price numeric(12,2) check (price is null or price >= 0),
  currency text not null,
  in_stock boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (product_id, country_code),
  constraint product_links_currency_ok check (
    (country_code in ('US','ID') and currency = 'USD') or
    (country_code = 'IN' and currency = 'INR') or
    (country_code = 'BR' and currency = 'BRL') or
    (country_code = 'MX' and currency = 'MXN'))
);
drop trigger if exists trg_links_updated on public.product_links;
create trigger trg_links_updated before update on public.product_links
  for each row execute function public.set_updated_at();

create table if not exists public.store_settings (
  country_code text primary key check (country_code in ('US','IN','BR','MX')),
  affiliate_tag text check (affiliate_tag is null or affiliate_tag ~ '^[A-Za-z0-9_-]{3,40}$'),
  updated_at timestamptz not null default now()
);
insert into public.store_settings (country_code) values ('US'),('IN'),('BR'),('MX')
  on conflict (country_code) do nothing;

create table if not exists public.events (
  id bigint generated always as identity primary key,
  type text not null check (type in ('product_view','click')),
  product_id uuid not null references public.products(id) on delete cascade,
  visitor_country text not null default 'XX' check (visitor_country ~ '^[A-Z]{2}$'),
  store_country text check (store_country is null or store_country in ('US','IN','BR','MX','ID')),
  source text,
  campaign text,
  device text check (device is null or device in ('mobile','desktop')),
  session_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_listing on public.products (is_published, is_featured desc, created_at desc);
create index if not exists idx_products_category on public.products (category_id);
create index if not exists idx_products_name_trgm on public.products using gin (name gin_trgm_ops);
create index if not exists idx_links_product on public.product_links (product_id);
create index if not exists idx_events_created on public.events (created_at desc);
create index if not exists idx_events_product on public.events (product_id, created_at desc);
create index if not exists idx_events_country on public.events (visitor_country, created_at desc);
create index if not exists idx_events_session on public.events (session_id, product_id, type, created_at desc);

-- RLS
alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_links enable row level security;
alter table public.store_settings enable row level security;
alter table public.events enable row level security;

drop policy if exists admins_self_read on public.admins;
create policy admins_self_read on public.admins for select to authenticated using (user_id = auth.uid());

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories for select to anon, authenticated using (true);
drop policy if exists categories_admin_all on public.categories;
create policy categories_admin_all on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products for select to anon, authenticated using (is_published);
drop policy if exists products_admin_all on public.products;
create policy products_admin_all on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists links_public_read on public.product_links;
create policy links_public_read on public.product_links for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_links.product_id and p.is_published));
drop policy if exists links_admin_all on public.product_links;
create policy links_admin_all on public.product_links for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists settings_public_read on public.store_settings;
create policy settings_public_read on public.store_settings for select to anon, authenticated using (true);
drop policy if exists settings_admin_all on public.store_settings;
create policy settings_admin_all on public.store_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists events_admin_read on public.events;
create policy events_admin_read on public.events for select to authenticated using (public.is_admin());

-- Grants
revoke all on public.events from anon, authenticated;
grant select on public.events to authenticated;
revoke all on public.admins from anon;
revoke insert, update, delete on public.admins from authenticated;
revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "product images public read" on storage.objects;
create policy "product images public read" on storage.objects for select to anon, authenticated using (bucket_id = 'product-images');
drop policy if exists "product images admin insert" on storage.objects;
create policy "product images admin insert" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product images admin update" on storage.objects;
create policy "product images admin update" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product images admin delete" on storage.objects;
create policy "product images admin delete" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());
