-- 0006_pinterest.sql  (idempotent: safe to re-run)
-- Adds utm_content / utm_term columns to events and Pinterest campaign analytics RPCs.

alter table public.events
  add column if not exists content text,
  add column if not exists term text;

drop function if exists public.analytics_campaigns(int, text);
drop function if exists public.analytics_campaign_countries(text, int, text);

create function public.analytics_campaigns(
  days int default 7,
  tz text default 'Asia/Kolkata'
)
returns table (
  campaign text,
  content text,
  views bigint,
  clicks bigint,
  click_rate numeric,
  top_country text
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
    raise exception 'forbidden' using errcode = '42501';
  end if;

  v_since := public.analytics_window_start(days, tz);

  return query
  with ev as (
    select
      nullif(trim(e.campaign), '') as camp,
      nullif(trim(e.content), '') as cont,
      e.type as etype,
      upper(nullif(trim(e.visitor_country), '')) as cc
    from public.events e
    where e.created_at >= v_since
      and nullif(trim(e.campaign), '') is not null
  ),
  agg as (
    select
      ev.camp,
      ev.cont,
      (count(*) filter (where ev.etype = 'product_view'))::bigint as v,
      (count(*) filter (where ev.etype = 'click'))::bigint as c
    from ev
    group by ev.camp, ev.cont
  )
  select
    a.camp as campaign,
    a.cont as content,
    a.v as views,
    a.c as clicks,
    case
      when a.v > 0 then round((a.c::numeric * 100.0) / a.v::numeric, 1)
      else 0::numeric
    end as click_rate,
    tc.cc as top_country
  from agg a
  left join lateral (
    select ev.cc
    from ev
    where ev.camp = a.camp
      and ev.cont is not distinct from a.cont
      and ev.cc is not null
    group by ev.cc
    order by count(*) filter (where ev.etype = 'click') desc, count(*) desc, ev.cc asc
    limit 1
  ) tc on true
  order by a.c desc, a.v desc, a.camp asc, a.cont asc nulls last;
end;
$$;

create function public.analytics_campaign_countries(
  p_campaign text,
  days int default 7,
  tz text default 'Asia/Kolkata'
)
returns table (
  country text,
  views bigint,
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
    raise exception 'forbidden' using errcode = '42501';
  end if;

  v_since := public.analytics_window_start(days, tz);

  return query
  select
    coalesce(nullif(upper(trim(e.visitor_country)), ''), '??') as country,
    (count(*) filter (where e.type = 'product_view'))::bigint as views,
    (count(*) filter (where e.type = 'click'))::bigint as clicks
  from public.events e
  where e.created_at >= v_since
    and nullif(trim(e.campaign), '') = nullif(trim(p_campaign), '')
  group by 1
  order by clicks desc, views desc, country asc;
end;
$$;

revoke all on function public.analytics_campaigns(int, text) from public, anon;
revoke all on function public.analytics_campaign_countries(text, int, text) from public, anon;

grant execute on function public.analytics_campaigns(int, text) to authenticated;
grant execute on function public.analytics_campaign_countries(text, int, text) to authenticated;

notify pgrst, 'reload schema';
