-- 0003_admin_products.sql  (idempotent: safe to re-run)
-- Needs 0002_analytics.sql first: that migration owns the
-- product_click_counts view (clicks, views, last_click_at) which the admin list reads.

-- One row per product for the admin list: product + clicks + stock per country.
create or replace view public.admin_product_list
with (security_invoker = true) as
select
  p.id as product_id,
  p.name,
  p.slug,
  p.image_url,
  p.is_published,
  p.is_featured,
  p.created_at,
  p.updated_at,
  coalesce(c.clicks, 0) as clicks,
  count(l.id)::int as link_count,
  (count(l.id) filter (where not l.in_stock))::int as out_count,
  coalesce(array_agg(l.country_code order by l.country_code) filter (where l.in_stock), '{}'::text[]) as in_countries,
  coalesce(array_agg(l.country_code order by l.country_code) filter (where not l.in_stock), '{}'::text[]) as out_countries
from public.products p
left join public.product_click_counts c on c.product_id = p.id
left join public.product_links l on l.product_id = p.id
group by p.id, c.clicks;

revoke all on public.admin_product_list from anon;
grant select on public.admin_product_list to authenticated;

-- Saves a product and all its links in ONE transaction (a function call is atomic).
create or replace function public.save_product(p jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  pid uuid := (p->>'id')::uuid;
  links jsonb := coalesce(p->'links', '[]'::jsonb);
  codes text[];
begin
  if not public.is_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  insert into public.products
    (id, name, slug, description, category_id, image_url, gallery_urls, is_published, is_featured)
  values (
    pid,
    p->>'name',
    p->>'slug',
    nullif(p->>'description', ''),
    nullif(p->>'category_id', '')::uuid,
    nullif(p->>'image_url', ''),
    array(select jsonb_array_elements_text(coalesce(p->'gallery_urls', '[]'::jsonb))),
    coalesce((p->>'is_published')::boolean, true),
    coalesce((p->>'is_featured')::boolean, false)
  )
  on conflict (id) do update set
    name = excluded.name,
    slug = excluded.slug,
    description = excluded.description,
    category_id = excluded.category_id,
    image_url = excluded.image_url,
    gallery_urls = excluded.gallery_urls,
    is_published = excluded.is_published,
    is_featured = excluded.is_featured;

  codes := array(select l->>'country_code' from jsonb_array_elements(links) l);

  -- links that were cleared in the form are removed
  delete from public.product_links
  where product_id = pid and not (country_code = any(codes));

  insert into public.product_links (product_id, country_code, url, price, currency, in_stock)
  select pid, l->>'country_code', l->>'url', nullif(l->>'price', '')::numeric, l->>'currency',
         coalesce((l->>'in_stock')::boolean, true)
  from jsonb_array_elements(links) l
  on conflict (product_id, country_code) do update set
    url = excluded.url,
    price = excluded.price,
    currency = excluded.currency,
    in_stock = excluded.in_stock;

  return pid;
end;
$$;

revoke all on function public.save_product(jsonb) from public, anon;
grant execute on function public.save_product(jsonb) to authenticated;
