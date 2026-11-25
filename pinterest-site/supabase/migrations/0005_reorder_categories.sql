-- 0005_reorder_categories.sql  (idempotent: safe to re-run)
-- Atomic category reordering in a single UPDATE statement.

create or replace function public.reorder_categories(p_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not coalesce(public.is_admin(), false) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  update public.categories c
  set sort_order = ord.pos - 1
  from unnest(p_ids) with ordinality as ord(id, pos)
  where c.id = ord.id;
end;
$$;

revoke all on function public.reorder_categories(uuid[]) from public, anon;
grant execute on function public.reorder_categories(uuid[]) to authenticated;

notify pgrst, 'reload schema';
