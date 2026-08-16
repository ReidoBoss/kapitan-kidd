-- Roles, permission resources, and role permissions (rbac-pseudo-code.md).

insert into public.user_roles (name) values
  ('Admin'),
  ('Captain'),
  ('Crew');

insert into public.permission_resources (name) values
  ('users'),
  ('vessels'),
  ('role_assignments'),
  ('work_orders'),
  ('vessel_assignments'),
  ('work_order_assignments');

with
  role_ids as (select id, name from public.user_roles),
  resource_ids as (select id, name from public.permission_resources),
  grants (role_name, resource_name, action) as (
    values
      -- Admin (rbac-pseudo-code.md)
      ('Admin', 'vessels',                'create'),
      ('Admin', 'users',                  'create'),
      ('Admin', 'role_assignments',       'update'),
      ('Admin', 'vessel_assignments',     'update'),
      -- Admin reads needed to render the management dashboard
      ('Admin', 'users',                  'read'),
      ('Admin', 'vessels',                'read'),
      ('Admin', 'vessel_assignments',     'read'),
      -- Captain (rbac-pseudo-code.md)
      ('Captain', 'work_orders',            'create'),
      ('Captain', 'work_order_assignments', 'update'),
      ('Captain', 'work_orders',            'read'),
      ('Captain', 'work_orders',            'update'),
      -- Crew (rbac-pseudo-code.md)
      ('Crew', 'work_order_assignments', 'read'),
      ('Crew', 'work_order_assignments', 'update')
  )
insert into public.user_role_permissions (user_role_id, permission_resource_id, action)
select role_ids.id, resource_ids.id, grants.action::public.permission_action
from grants
join role_ids on role_ids.name = grants.role_name
join resource_ids on resource_ids.name = grants.resource_name;
