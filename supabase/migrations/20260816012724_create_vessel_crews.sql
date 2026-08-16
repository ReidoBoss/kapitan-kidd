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
