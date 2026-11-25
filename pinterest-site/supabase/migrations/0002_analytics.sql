-- 0002_analytics.sql
-- Admin analytics functions. Safe to re-run (functions are dropped and recreated).
--
-- Every function is SECURITY DEFINER and raises an error unless is_admin() is true,
-- so a signed-out visitor or a normal user gets a 42501 error, never data.
--
-- All range functions share one window: the last N local days INCLUDING today, where a
-- "day" starts at midnight in the timezone passed as `tz` (the app passes ANALYTICS_TZ from
-- lib/config.ts, default 'Asia/Kolkata'). This keeps totals and the daily chart consistent.
--
-- Optional `p_product` narrows a function to one product (Analytics page product dropdown).

-- Remove the earlier versions (different signatures) and any previous run of this file.
drop function if exists public.analytics_summary(int);
drop function if exists public.analytics_summary(int, text);
drop function if exists public.analytics_summary(int, text, uuid);
drop function if exists public.clicks_over_time(int);
drop function if exists public.clicks_over_time(int, text);
drop function if exists public.clicks_over_time(int, text, uuid);
drop function if exists public.clicks_by_country(int);
drop function if exists public.clicks_by_country(int, text);
drop function if exists public.clicks_by_country(int, text, uuid);
drop function if exists public.top_products(int);
drop function if exists public.top_products(int, int, text);
drop function if exists public.analytics_sources(int);
drop function if exists public.analytics_sources(int, text);
drop function if exists public.analytics_sources(int, text, uuid);
drop function if exists public.analytics_devices(int);
drop function if exists public.analytics_devices(int, text);
drop function if exists public.analytics_devices(int, text, uuid);
drop function if exists public.product_analytics(uuid, int);
drop function if exists public.product_analytics(uuid, int, text);
drop function if exists public.analytics_total_overview(int);
drop function if exists public.analytics_total_overview(int, text);

-- admin_product_list (0003_admin_products.sql) depends on product_click_counts
drop view if exists public.admin_product_list;
drop view if exists public.product_click_counts;

create view public.product_click_counts
with (security_invoker = true) as
select
  e.product_id,
  (count(*) filter (where e.type = 'click'))::bigint as clicks,
  (count(*) filter (where e.type = 'product_view'))::bigint as views,
  max(e.created_at) filter (where e.type = 'click') as last_click_at
from public.events e
group by e.product_id;

-- Start of the window: local midnight (N-1) days ago, as timestamptz. N is clamped to 1..365.
create or replace function public.analytics_window_start(days int, tz text default 'Asia/Kolkata')
returns timestamptz
language sql
stable
as $$
  select (
    date_trunc('day', now() at time zone tz)
    - make_interval(days => greatest(1, least(coalesce(days, 7), 365)) - 1)
  ) at time zone tz;
$$;

-- ---------------------------------------------------------------------------
-- analytics_summary: totals, top country (by clicks), products with an out-of-stock link
-- ---------------------------------------------------------------------------
create function public.analytics_summary(
  days int default 7,
  tz text default 'Asia/Kolkata',
  p_product uuid default null
)
returns table (
  total_clicks bigint,
  total_views bigint,
  top_country text,
  out_of_stock_products bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_since timestamptz;
begin
  if not coalesce(public.is_admin(), false) then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  v_since := public.analytics_window_start(days, tz);

  return query
  select
    (count(*) filter (where e.type = 'click'))::bigint,
    (count(*) filter (where e.type = 'product_view'))::bigint,
    (
      select upper(e2.visitor_country)
      from public.events e2
      where e2.type = 'click'
        and e2.created_at >= v_since
        and (p_product is null or e2.product_id = p_product)
        and nullif(e2.visitor_country, '') is not null
      group by upper(e2.visitor_country)
      order by count(*) desc, upper(e2.visitor_country)
      limit 1
    ),
    (
      select count(*)
      from public.products p
      where p.is_published
        and exists (
          select 1 from public.product_links l
          where l.product_id = p.id and l.in_stock = false
        )
    )::bigint
  from public.events e
  where e.created_at >= v_since
    and (p_product is null or e.product_id = p_product);
end;
$$;

-- ---------------------------------------------------------------------------
-- clicks_over_time: one row per local day in the range, zero days included
-- ---------------------------------------------------------------------------
create function public.clicks_over_time(
  days int default 7,
  tz text default 'Asia/Kolkata',
  p_product uuid default null
)
returns table (
  day date,
  clicks bigint,
  views bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_since timestamptz;
  v_first date;
  v_last date;
begin
  if not coalesce(public.is_admin(), false) then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  v_since := public.analytics_window_start(days, tz);
  v_first := (v_since at time zone tz)::date;
  v_last := (now() at time zone tz)::date;

  return query
  select
    (v_first + g.n)::date,
    coalesce(c.clicks, 0)::bigint,
    coalesce(c.views, 0)::bigint
  from generate_series(0, v_last - v_first) as g(n)
  left join (
    select
      (e.created_at at time zone tz)::date as d,
      count(*) filter (where e.type = 'click') as clicks,
      count(*) filter (where e.type = 'product_view') as views
    from public.events e
    where e.created_at >= v_since
      and (p_product is null or e.product_id = p_product)
    group by 1
  ) c on c.d = v_first + g.n
  order by 1;
end;
$$;

-- ---------------------------------------------------------------------------
-- clicks_by_country: clicks per visitor country ('??' when the country is unknown)
-- ---------------------------------------------------------------------------
create function public.clicks_by_country(
  days int default 7,
  tz text default 'Asia/Kolkata',
  p_product uuid default null
)
returns table (
  visitor_country text,
  clicks bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_since timestamptz;
begin
  if not coalesce(public.is_admin(), false) then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  v_since := public.analytics_window_start(days, tz);

  return query
  select
    coalesce(nullif(upper(e.visitor_country), ''), '??'),
    count(*)::bigint
  from public.events e
  where e.type = 'click'
    and e.created_at >= v_since
    and (p_product is null or e.product_id = p_product)
  group by 1
  order by 2 desc, 1;
end;
$$;

-- ---------------------------------------------------------------------------
-- top_products: products with activity in the range, best clicks first.
-- top_country = visitor country with the most clicks (falls back to most views).
-- stock_status = in_stock | partly | out_of_stock | no_links (across all of its links).
-- ---------------------------------------------------------------------------
create function public.top_products(
  days int default 7,
  lim int default 10,
  tz text default 'Asia/Kolkata'
)
returns table (
  product_id uuid,
  name text,
  views bigint,
  clicks bigint,
  top_country text,
  stock_status text
)
language plpgsql
stable
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_since timestamptz;
  v_lim int;
begin
  if not coalesce(public.is_admin(), false) then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  v_since := public.analytics_window_start(days, tz);
  v_lim := greatest(1, least(coalesce(lim, 10), 500));

  return query
  with ev as (
    select e.product_id, e.type, upper(nullif(e.visitor_country, '')) as country
    from public.events e
    where e.created_at >= v_since
  ),
  agg as (
    select
      ev.product_id,
      count(*) filter (where ev.type = 'click') as clicks,
      count(*) filter (where ev.type = 'product_view') as views
    from ev
    group by ev.product_id
  )
  select
    p.id,
    p.name,
    a.views,
    a.clicks,
    tc.country,
    st.status
  from agg a
  join public.products p on p.id = a.product_id
  left join lateral (
    select ev.country
    from ev
    where ev.product_id = p.id and ev.country is not null
    group by ev.country
    order by count(*) filter (where ev.type = 'click') desc, count(*) desc, ev.country
    limit 1
  ) tc on true
  cross join lateral (
    select case
      when count(*) = 0 then 'no_links'
      when count(*) filter (where l.in_stock) = count(*) then 'in_stock'
      when count(*) filter (where l.in_stock) = 0 then 'out_of_stock'
      else 'partly'
    end as status
    from public.product_links l
    where l.product_id = p.id
  ) st
  order by a.clicks desc, a.views desc, p.name
  limit v_lim;
end;
$$;

-- ---------------------------------------------------------------------------
-- analytics_sources: clicks and views per source label (always 3 rows)
-- `source` holds the utm_source or the referrer host. Pinterest is detected from either.
-- ---------------------------------------------------------------------------
create function public.analytics_sources(
  days int default 7,
  tz text default 'Asia/Kolkata',
  p_product uuid default null
)
returns table (
  source_label text,
  clicks bigint,
  views bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_since timestamptz;
begin
  if not coalesce(public.is_admin(), false) then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  v_since := public.analytics_window_start(days, tz);

  return query
  with labelled as (
    select
      case
        when lower(coalesce(e.source, '')) ~ 'pinterest|(^|\.)pin\.it' then 'Pinterest'
        when lower(trim(coalesce(e.source, ''))) in ('', 'direct', '(direct)', 'none', '(none)') then 'Direct'
        else 'Other'
      end as label,
      e.type as etype
    from public.events e
    where e.created_at >= v_since
      and (p_product is null or e.product_id = p_product)
  )
  select
    v.label::text,
    (count(*) filter (where x.etype = 'click'))::bigint,
    (count(*) filter (where x.etype = 'product_view'))::bigint
  from (values ('Pinterest', 1), ('Direct', 2), ('Other', 3)) as v(label, ord)
  left join labelled x on x.label = v.label
  group by v.label, v.ord
  order by v.ord;
end;
$$;

-- ---------------------------------------------------------------------------
-- analytics_devices: mobile vs desktop (always 2 rows)
-- ---------------------------------------------------------------------------
create function public.analytics_devices(
  days int default 7,
  tz text default 'Asia/Kolkata',
  p_product uuid default null
)
returns table (
  device text,
  clicks bigint,
  views bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_since timestamptz;
begin
  if not coalesce(public.is_admin(), false) then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  v_since := public.analytics_window_start(days, tz);

  return query
  with labelled as (
    select
      case when lower(coalesce(e.device, '')) = 'mobile' then 'mobile' else 'desktop' end as label,
      e.type as etype
    from public.events e
    where e.created_at >= v_since
      and (p_product is null or e.product_id = p_product)
  )
  select
    v.label::text,
    (count(*) filter (where x.etype = 'click'))::bigint,
    (count(*) filter (where x.etype = 'product_view'))::bigint
  from (values ('mobile', 1), ('desktop', 2)) as v(label, ord)
  left join labelled x on x.label = v.label
  group by v.label, v.ord
  order by v.ord;
end;
$$;

-- ---------------------------------------------------------------------------
-- product_analytics: one product, per visitor country (US, IN, BR, MX, ID, plus OTHER
-- only when it has traffic). link_store is the store whose link that visitor would be sent
-- to: the visitor's own store; Indonesia uses its ID link or falls back to US; any other
-- country uses US. has_link / in_stock describe that link.
-- ---------------------------------------------------------------------------
create function public.product_analytics(
  product_id uuid,
  days int default 7,
  tz text default 'Asia/Kolkata'
)
returns table (
  visitor_country text,
  views bigint,
  clicks bigint,
  link_store text,
  has_link boolean,
  in_stock boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_product uuid := product_id;
  v_since timestamptz;
begin
  if not coalesce(public.is_admin(), false) then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  v_since := public.analytics_window_start(days, tz);

  return query
  with ev as (
    select
      case
        when upper(e.visitor_country) in ('US', 'IN', 'BR', 'MX', 'ID') then upper(e.visitor_country)
        else 'OTHER'
      end as code,
      e.type as etype
    from public.events e
    where e.product_id = v_product
      and e.created_at >= v_since
  )
  select
    v.code::text,
    (count(*) filter (where ev.etype = 'product_view'))::bigint,
    (count(*) filter (where ev.etype = 'click'))::bigint,
    l.store::text,
    (l.store is not null),
    l.in_stock
  from (values ('US', 1), ('IN', 2), ('BR', 3), ('MX', 4), ('ID', 5), ('OTHER', 6)) as v(code, ord)
  left join ev on ev.code = v.code
  left join lateral (
    select pl.country_code as store, pl.in_stock
    from public.product_links pl
    where pl.product_id = v_product
      and pl.country_code = case
        when v.code = 'ID' and exists (
          select 1 from public.product_links x
          where x.product_id = v_product and x.country_code = 'ID'
        ) then 'ID'
        when v.code in ('ID', 'OTHER') then 'US'
        else v.code
      end
  ) l on true
  group by v.code, v.ord, l.store, l.in_stock
  having v.code <> 'OTHER' or count(ev.etype) > 0
  order by v.ord;
end;
$$;

-- ---------------------------------------------------------------------------
-- Permissions: signed-in users only (and the function body then requires admin).
-- ---------------------------------------------------------------------------
revoke all on function public.analytics_summary(int, text, uuid) from public, anon;
revoke all on function public.clicks_over_time(int, text, uuid) from public, anon;
revoke all on function public.clicks_by_country(int, text, uuid) from public, anon;
revoke all on function public.top_products(int, int, text) from public, anon;
revoke all on function public.analytics_sources(int, text, uuid) from public, anon;
revoke all on function public.analytics_devices(int, text, uuid) from public, anon;
revoke all on function public.product_analytics(uuid, int, text) from public, anon;
revoke all on public.product_click_counts from public, anon;

grant execute on function public.analytics_summary(int, text, uuid) to authenticated;
grant execute on function public.clicks_over_time(int, text, uuid) to authenticated;
grant execute on function public.clicks_by_country(int, text, uuid) to authenticated;
grant execute on function public.top_products(int, int, text) to authenticated;
grant execute on function public.analytics_sources(int, text, uuid) to authenticated;
grant execute on function public.analytics_devices(int, text, uuid) to authenticated;
grant execute on function public.product_analytics(uuid, int, text) to authenticated;
grant select on public.product_click_counts to authenticated;

-- Ask PostgREST to pick up the new functions immediately.
notify pgrst, 'reload schema';
