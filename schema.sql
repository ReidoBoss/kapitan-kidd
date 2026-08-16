-- schema.sql
-- Complete database schema for Kapitan Kidd (Marine Work Order Management System).
-- Consolidated from supabase/migrations/ in order; kept in sync with those files.
-- Includes tables, columns, types, primary keys, foreign keys, indexes, and RLS policies.

-- ============================================================
-- 20260816012720_create_user_roles.sql
-- ============================================================

-- User roles lookup (Admin, Captain, Crew). Rows are managed by seeds only.

create table public.user_roles (
  id smallint generated always as identity primary key,
  name varchar(50) not null unique
);

alter table public.user_roles enable row level security;

create policy "anon can read user_roles"
  on public.user_roles for select to anon using (true);

-- ============================================================
-- 20260816012721_create_users.sql
-- ============================================================

create table public.users (
  id uuid primary key default gen_random_uuid(),
  user_role_id smallint not null references public.user_roles (id),
  name varchar(100) not null unique
);

create index users_user_role_id_idx on public.users (user_role_id);

alter table public.users enable row level security;

create policy "anon can read users"
  on public.users for select to anon using (true);
create policy "anon can insert users"
  on public.users for insert to anon with check (true);
create policy "anon can update users"
  on public.users for update to anon using (true);

-- ============================================================
-- 20260816012722_create_permissions.sql
-- ============================================================

-- RBAC permission model ("CRUDdy by Design"): every capability is a CRUD
-- action on a permission resource. Resources are conceptual nouns (e.g.
-- role_assignments, work_order_assignments), not necessarily tables.
-- Rows are managed by seeds only.
-- to understand more about CRUDDy by design. please refer to this link:
-- https://laraveldaily.com/post/cruddy-by-design-adam-wathan-summary-examples-opinions

create type public.permission_action as enum ('create', 'read', 'update', 'delete');

create table public.permission_resources (
  id smallint generated always as identity primary key,
  name varchar(50) not null unique
);

create table public.user_role_permissions (
  id smallint generated always as identity primary key,
  user_role_id smallint not null references public.user_roles (id) on delete cascade,
  permission_resource_id smallint not null references public.permission_resources (id) on delete cascade,
  action public.permission_action not null,
  unique (user_role_id, permission_resource_id, action)
);

create index user_role_permissions_user_role_id_idx
  on public.user_role_permissions (user_role_id);

alter table public.permission_resources enable row level security;
alter table public.user_role_permissions enable row level security;

create policy "anon can read permission_resources"
  on public.permission_resources for select to anon using (true);

create policy "anon can read user_role_permissions"
  on public.user_role_permissions for select to anon using (true);

-- ============================================================
-- 20260816012723_create_vessels.sql
-- ============================================================

create table public.vessels (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null,
  created_at timestamptz not null default now()
);

alter table public.vessels enable row level security;

create policy "anon can read vessels"
  on public.vessels for select to anon using (true);
create policy "anon can insert vessels"
  on public.vessels for insert to anon with check (true);

-- ============================================================
-- 20260816012724_create_vessel_crews.sql
-- ============================================================

-- vessel membership: links captains and crew to the vessel they serve on.
-- Managed by Admin (the "vessel_assignments" permission resource).

create table public.vessel_crews (
  id uuid primary key default gen_random_uuid(),
  crew_user_id uuid not null references public.users (id) on delete cascade,
  vessel_id uuid not null references public.vessels (id) on delete cascade,
  created_at timestamptz not null default now(),
  assigned_at timestamptz not null default now(),
  unique (crew_user_id, vessel_id)
);

create index vessel_crews_vessel_id_idx on public.vessel_crews (vessel_id);
create index vessel_crews_crew_user_id_idx on public.vessel_crews (crew_user_id);

alter table public.vessel_crews enable row level security;

create policy "anon can read vessel_crews"
  on public.vessel_crews for select to anon using (true);
create policy "anon can insert vessel_crews"
  on public.vessel_crews for insert to anon with check (true);
create policy "anon can delete vessel_crews"
  on public.vessel_crews for delete to anon using (true);

-- ============================================================
-- 20260816012725_create_work_orders.sql
-- ============================================================

-- Work orders and their lifecycle:
--   Open -> In Progress -> Done -> attested (attested_at set) or rejected
--   (rejection_reason set, status returned to the assigned crew).

create type public.work_order_status as enum ('Open', 'In Progress', 'Done');

create table public.work_orders (
  id uuid primary key default gen_random_uuid(),
  creator_user_id uuid not null references public.users (id),
  assigned_crew_user_id uuid not null references public.users (id),
  vessel_id uuid not null references public.vessels (id),
  title varchar(200) not null,
  issue varchar not null,
  solution varchar,
  status public.work_order_status not null default 'Open',
  rejection_reason varchar,
  attested_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index work_orders_creator_user_id_idx on public.work_orders (creator_user_id);
create index work_orders_assigned_crew_user_id_idx on public.work_orders (assigned_crew_user_id);
create index work_orders_vessel_id_idx on public.work_orders (vessel_id);
create index work_orders_status_idx on public.work_orders (status);
create index work_orders_created_at_idx on public.work_orders (created_at desc);

-- Keep updated_at server-managed instead of trusting the client.
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger work_orders_set_updated_at
  before update on public.work_orders
  for each row
  execute function public.set_updated_at();

alter table public.work_orders enable row level security;

create policy "anon can read work_orders"
  on public.work_orders for select to anon using (true);
create policy "anon can insert work_orders"
  on public.work_orders for insert to anon with check (true);
create policy "anon can update work_orders"
  on public.work_orders for update to anon using (true);
