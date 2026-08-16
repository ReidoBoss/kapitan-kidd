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
