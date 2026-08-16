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
