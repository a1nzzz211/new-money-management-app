-- ============================================================================
-- Money Tracker - P0.5 hardening for projects where 0001_init.sql was already
-- applied. Safe to run more than once.
--
-- Run via: supabase db push   (or paste into the Supabase SQL editor)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. budgets.month must be the first day of a month.
--    Replaces any older `day(month)`-style check with the valid PostgreSQL
--    expression `extract(day from month) = 1`.
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
begin
  if to_regclass('public.budgets') is null then
    raise notice 'public.budgets not found; skipping month check hardening';
    return;
  end if;

  for r in
    select conname
    from pg_constraint
    where conrelid = 'public.budgets'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%month%'
      and pg_get_constraintdef(oid) ilike '%day%'
  loop
    execute format('alter table public.budgets drop constraint %I', r.conname);
  end loop;

  alter table public.budgets
    add constraint budgets_month_first_day_check
    check (extract(day from month) = 1);
exception
  when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Case-insensitive uniqueness for category names per user and kind.
--    PostgreSQL cannot express `lower(name)` in a table-level UNIQUE
--    constraint, so use a unique index instead.
-- ---------------------------------------------------------------------------
do $$
declare
  dup record;
begin
  if to_regclass('public.categories') is null then
    raise notice 'public.categories not found; skipping category unique index';
    return;
  end if;

  select user_id, kind, lower(name) as normalized_name, count(*) as total
  into dup
  from public.categories
  group by user_id, kind, lower(name)
  having count(*) > 1
  limit 1;

  if found then
    raise exception
      'Tidak dapat membuat indeks unik kategori: nama duplikat ditemukan (user_id=%, kind=%, name=%, jumlah=%). Rapikan data terlebih dahulu.',
      dup.user_id, dup.kind, dup.normalized_name, dup.total;
  end if;
end $$;

create unique index if not exists categories_user_kind_name_key
  on public.categories (user_id, kind, lower(name));

-- ---------------------------------------------------------------------------
-- 3. monthly_summary must run with the caller's permissions so RLS on
--    public.transactions is enforced. Views cannot have RLS policies directly.
-- ---------------------------------------------------------------------------
create or replace view public.monthly_summary
with (security_invoker = true) as
select
  t.user_id,
  date_trunc('month', t.occurred_on)::date as month,
  t.type,
  sum(t.amount) as total,
  count(*) as count
from public.transactions t
group by t.user_id, date_trunc('month', t.occurred_on)::date, t.type;

-- ---------------------------------------------------------------------------
-- 4. Idempotent RLS policies.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.savings_goals enable row level security;
alter table public.goal_contributions enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "categories_select_own" on public.categories;
drop policy if exists "categories_insert_own" on public.categories;
drop policy if exists "categories_update_own" on public.categories;
drop policy if exists "categories_delete_own" on public.categories;
drop policy if exists "transactions_select_own" on public.transactions;
drop policy if exists "transactions_insert_own" on public.transactions;
drop policy if exists "transactions_update_own" on public.transactions;
drop policy if exists "transactions_delete_own" on public.transactions;
drop policy if exists "budgets_select_own" on public.budgets;
drop policy if exists "budgets_insert_own" on public.budgets;
drop policy if exists "budgets_update_own" on public.budgets;
drop policy if exists "budgets_delete_own" on public.budgets;
drop policy if exists "goals_select_own" on public.savings_goals;
drop policy if exists "goals_insert_own" on public.savings_goals;
drop policy if exists "goals_update_own" on public.savings_goals;
drop policy if exists "goals_delete_own" on public.savings_goals;
drop policy if exists "contribs_select_own" on public.goal_contributions;
drop policy if exists "contribs_insert_own" on public.goal_contributions;
drop policy if exists "contribs_update_own" on public.goal_contributions;
drop policy if exists "contribs_delete_own" on public.goal_contributions;

create policy "profiles_select_own" on public.profiles
  for select using ((select auth.uid()) = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles
  for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "categories_select_own" on public.categories
  for select using ((select auth.uid()) = user_id);
create policy "categories_insert_own" on public.categories
  for insert with check ((select auth.uid()) = user_id);
create policy "categories_update_own" on public.categories
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "categories_delete_own" on public.categories
  for delete using ((select auth.uid()) = user_id);

create policy "transactions_select_own" on public.transactions
  for select using ((select auth.uid()) = user_id);
create policy "transactions_insert_own" on public.transactions
  for insert with check ((select auth.uid()) = user_id);
create policy "transactions_update_own" on public.transactions
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "transactions_delete_own" on public.transactions
  for delete using ((select auth.uid()) = user_id);

create policy "budgets_select_own" on public.budgets
  for select using ((select auth.uid()) = user_id);
create policy "budgets_insert_own" on public.budgets
  for insert with check ((select auth.uid()) = user_id);
create policy "budgets_update_own" on public.budgets
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "budgets_delete_own" on public.budgets
  for delete using ((select auth.uid()) = user_id);

create policy "goals_select_own" on public.savings_goals
  for select using ((select auth.uid()) = user_id);
create policy "goals_insert_own" on public.savings_goals
  for insert with check ((select auth.uid()) = user_id);
create policy "goals_update_own" on public.savings_goals
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "goals_delete_own" on public.savings_goals
  for delete using ((select auth.uid()) = user_id);

create policy "contribs_select_own" on public.goal_contributions
  for select using ((select auth.uid()) = user_id);
create policy "contribs_insert_own" on public.goal_contributions
  for insert with check ((select auth.uid()) = user_id);
create policy "contribs_update_own" on public.goal_contributions
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "contribs_delete_own" on public.goal_contributions
  for delete using ((select auth.uid()) = user_id);
