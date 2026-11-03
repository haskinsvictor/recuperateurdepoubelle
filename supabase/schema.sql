-- À exécuter une fois dans Supabase > SQL Editor

create table public.places (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  description text check (char_length(description) <= 1000),
  lat double precision not null,
  lng double precision not null,
  created_at timestamptz not null default now()
);

alter table public.places enable row level security;

-- Tout le monde peut lire et ajouter (aucune régulation pour l'instant)
create policy "lecture publique" on public.places for select using (true);
create policy "ajout public" on public.places for insert with check (true);

-- Diffusion en temps réel des nouveaux lieux
alter publication supabase_realtime add table public.places;
