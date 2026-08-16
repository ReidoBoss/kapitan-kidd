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
