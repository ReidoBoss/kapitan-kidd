-- User roles lookup (Admin, Captain, Crew). Rows are managed by seeds only.

create table public.user_roles (
  id smallint generated always as identity primary key,
  name varchar(50) not null unique
);

alter table public.user_roles enable row level security;

create policy "anon can read user_roles"
  on public.user_roles for select to anon using (true);
