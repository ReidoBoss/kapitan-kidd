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
