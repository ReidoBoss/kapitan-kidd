-- Sample vessels and vessel assignments (captains and crew).

insert into public.vessels (name) values
  ('MV Kapitan Kidd'),
  ('SS Bohol Star');

with
  assignments (user_name, vessel_name) as (
    values
      ('Captain Magellan',  'MV Kapitan Kidd'),
      ('Juan Dela Cruz',    'MV Kapitan Kidd'),
      ('Maria Clara',       'MV Kapitan Kidd'),
      ('Captain Lapu-Lapu', 'SS Bohol Star'),
      ('Andres Bonifacio',  'SS Bohol Star'),
      ('Gabriela Silang',   'SS Bohol Star')
  )
insert into public.vessel_crews (crew_user_id, vessel_id)
select users.id, vessels.id
from assignments
join public.users on users.name = assignments.user_name
join public.vessels on vessels.name = assignments.vessel_name;
