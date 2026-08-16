-- Sample users for the mock-auth role filter and member switcher.

insert into public.users (user_role_id, name)
select role_ids.id, sample.user_name
from (
  values
    ('Admin',   'Alice Santos'),
    ('Captain', 'Captain Magellan'),
    ('Captain', 'Captain Lapu-Lapu'),
    ('Crew',    'Juan Dela Cruz'),
    ('Crew',    'Maria Clara'),
    ('Crew',    'Andres Bonifacio'),
    ('Crew',    'Gabriela Silang')
) as sample (role_name, user_name)
join (select id, name from public.user_roles) as role_ids
  on role_ids.name = sample.role_name;
