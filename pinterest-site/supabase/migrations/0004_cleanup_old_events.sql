-- Used only by /api/cron/cleanup (service role). Deletes at most p_batch old
-- events per call so one run never holds a long lock. ctid avoids assuming a
-- primary-key column name. Assumes public.events has a created_at column.

create index if not exists events_created_at_idx on public.events (created_at);

create or replace function public.cleanup_old_events(p_cutoff timestamptz, p_batch integer default 5000)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_deleted integer;
begin
  if p_batch < 1 or p_batch > 50000 then
    raise exception 'invalid batch size';
  end if;

  with doomed as (
    select ctid from public.events where created_at < p_cutoff limit p_batch
  )
  delete from public.events e using doomed d where e.ctid = d.ctid;

  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke all on function public.cleanup_old_events(timestamptz, integer) from public, anon, authenticated;
grant execute on function public.cleanup_old_events(timestamptz, integer) to service_role;
