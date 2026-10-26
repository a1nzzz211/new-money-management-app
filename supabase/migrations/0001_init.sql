-- ============================================================================
-- Money Tracker - initial schema
-- Apply via: supabase db push   (or paste into the Supabase SQL editor)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. profiles - mirrors auth.users, created by trigger on signup
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  currency text not null default 'IDR',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. categories - per-user transaction labels
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 50),
  kind text not null check (kind in ('income', 'expense', 'savings')),
  color text not null default '#3b82f6',
  icon text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists categories_user_idx on public.categories (user_id);
-- Case-insensitive uniqueness per user and kind.
-- A table-level UNIQUE constraint cannot contain an expression such as lower(name),
-- so this must be a unique index instead.
create unique index if not exists categories_user_kind_name_key
  on public.categories (user_id, kind, lower(name));

-- ---------------------------------------------------------------------------
-- 3. transactions - the ledger
--    amount is ALWAYS positive; `type` gives the direction.
-- ---------------------------------------------------------------------------
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  type text not null check (type in ('income', 'expense', 'savings')),
  amount numeric(14, 2) not null check (amount > 0),
  description text check (description is null or char_length(description) <= 200),
  occurred_on date not null default (current_date),
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_date_idx
  on public.transactions (user_id, occurred_on desc);
create index if not exists transactions_user_category_idx
  on public.transactions (user_id, category_id);
create index if not exists transactions_user_type_idx
  on public.transactions (user_id, type);

-- ---------------------------------------------------------------------------
-- 4. budgets - monthly spending limit per category
-- ---------------------------------------------------------------------------
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  month date not null check (extract(day from month) = 1),
  limit_amount numeric(14, 2) not null check (limit_amount > 0),
  created_at timestamptz not null default now(),
  unique (user_id, category_id, month)
);

create index if not exists budgets_user_month_idx on public.budgets (user_id, month);

-- ---------------------------------------------------------------------------
-- 5. savings_goals
-- ---------------------------------------------------------------------------
create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  target_amount numeric(14, 2) not null check (target_amount > 0),
  deadline date,
  status text not null default 'active'
    check (status in ('active', 'achieved', 'archived')),
  created_at timestamptz not null default now()
);

create index if not exists savings_goals_user_idx on public.savings_goals (user_id, status);

-- ---------------------------------------------------------------------------
-- 6. goal_contributions - money put toward a goal
-- ---------------------------------------------------------------------------
create table if not exists public.goal_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  goal_id uuid not null references public.savings_goals (id) on delete cascade,
  transaction_id uuid references public.transactions (id) on delete set null,
  amount numeric(14, 2) not null check (amount > 0),
  contributed_on date not null default (current_date),
  created_at timestamptz not null default now()
);

create index if not exists goal_contributions_goal_idx
  on public.goal_contributions (goal_id);
create index if not exists goal_contributions_user_idx
  on public.goal_contributions (user_id);

-- ---------------------------------------------------------------------------
-- 7. Row Level Security - every table is private to its owner
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.savings_goals enable row level security;
alter table public.goal_contributions enable row level security;

-- Make this migration safe to re-run: drop existing policies before creating them.
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

-- profiles: read/insert own row; update own row
create policy "profiles_select_own" on public.profiles
  for select using ((select auth.uid()) = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles
  for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- all other tables: user_id must equal auth.uid()
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

-- ---------------------------------------------------------------------------
-- 8. Trigger: create profile + seed default categories on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := new.id;
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    v_uid,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name',
             new.raw_user_meta_data ->> 'name',
             split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  );

  -- Default Indonesian categories (expense)
  insert into public.categories (user_id, name, kind, color, is_default) values
    (v_uid, 'Makanan & Minuman', 'expense', '#ef4444', true),
    (v_uid, 'Transportasi',      'expense', '#f97316', true),
    (v_uid, 'Belanja',           'expense', '#eab308', true),
    (v_uid, 'Tagihan',           'expense', '#3b82f6', true),
    (v_uid, 'Hiburan',           'expense', '#8b5cf6', true),
    (v_uid, 'Kesehatan',         'expense', '#22c55e', true),
    (v_uid, 'Lain-lain',         'expense', '#6b7280', true);

  -- Default income categories
  insert into public.categories (user_id, name, kind, color, is_default) values
    (v_uid, 'Gaji',      'income', '#14b8a6', true),
    (v_uid, 'Bonus',     'income', '#0d9488', true),
    (v_uid, 'Investasi', 'income', '#0891b2', true),
    (v_uid, 'Lainnya',   'income', '#6b7280', true);

  -- Default savings categories
  insert into public.categories (user_id, name, kind, color, is_default) values
    (v_uid, 'Tabungan', 'savings', '#3b82f6', true),
    (v_uid, 'Dana Darurat', 'savings', '#8b5cf6', true);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 9. RPC: atomic "contribute to goal"
--    Creates a savings transaction + a contribution row in one call.
--    security invoker => RLS on the user's own rows still applies.
-- ---------------------------------------------------------------------------
create or replace function public.contribute_to_goal(
  p_goal_id uuid,
  p_amount numeric,
  p_contributed_on date
)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_uid uuid := auth.uid();
  v_goal public.savings_goals%rowtype;
  v_category uuid;
  v_transaction uuid;
begin
  if v_uid is null then
    raise exception 'Tidak terautentikasi';
  end if;

  select * into v_goal
  from public.savings_goals
  where id = p_goal_id and user_id = v_uid;

  if not found then
    raise exception 'Target tabungan tidak ditemukan';
  end if;

  if p_amount <= 0 then
    raise exception 'Nominal harus lebih dari 0';
  end if;

  -- Use the user's default savings category if present, else create one on the fly.
  select id into v_category
  from public.categories
  where user_id = v_uid and kind = 'savings'
  order by is_default desc, created_at asc
  limit 1;

  if v_category is null then
    insert into public.categories (user_id, name, kind, color)
    values (v_uid, 'Tabungan', 'savings', '#3b82f6')
    returning id into v_category;
  end if;

  insert into public.transactions (user_id, category_id, type, amount, description, occurred_on)
  values (v_uid, v_category, 'savings', p_amount,
          'Setoran ke ' || v_goal.name, p_contributed_on)
  returning id into v_transaction;

  insert into public.goal_contributions (user_id, goal_id, transaction_id, amount, contributed_on)
  values (v_uid, p_goal_id, v_transaction, p_amount, p_contributed_on);

  -- Auto-mark achieved when target reached.
  update public.savings_goals
  set status = 'achieved'
  where id = p_goal_id
    and status = 'active'
    and (
      select coalesce(sum(amount), 0)
      from public.goal_contributions
      where goal_id = p_goal_id
    ) >= target_amount;

  return v_transaction;
end;
$$;

-- ---------------------------------------------------------------------------
-- 10. View: monthly summary (used by dashboard + analytics)
-- ---------------------------------------------------------------------------
-- Views cannot have RLS policies applied directly. With security_invoker, the
-- view runs with the caller's permissions, so RLS on public.transactions applies.
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
