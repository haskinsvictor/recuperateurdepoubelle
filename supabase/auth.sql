-- À exécuter une fois dans Supabase > SQL Editor (après schema.sql).
-- Effet : le public ne peut que LIRE les lieux ; seuls les éditeurs
-- (comptes créés avec une clé d'invitation valide) peuvent ajouter / modifier.

-- 1. Les éditeurs --------------------------------------------------------
create table if not exists public.editors (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.editors enable row level security;

drop policy if exists "lire sa propre ligne" on public.editors;
create policy "lire sa propre ligne" on public.editors
  for select using (user_id = (select auth.uid()));

-- 2. Les clés d'invitation (aucune policy = inaccessibles depuis le site) -
create table if not exists public.invites (
  token uuid primary key default gen_random_uuid(),
  note text,                                              -- pour qui est cette clé
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  used_at timestamptz,
  used_by uuid references auth.users(id) on delete set null
);
alter table public.invites enable row level security;

-- 3. Qui est éditeur ? ----------------------------------------------------
create or replace function public.is_editor()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.editors where user_id = (select auth.uid()));
$$;

-- 4. Droits sur les lieux ------------------------------------------------
drop policy if exists "ajout public" on public.places;
drop policy if exists "ajout par les editeurs" on public.places;
drop policy if exists "modification par les editeurs" on public.places;

create policy "ajout par les editeurs" on public.places
  for insert with check (public.is_editor());

create policy "modification par les editeurs" on public.places
  for update using (public.is_editor()) with check (public.is_editor());

-- 5. Création de compte : refusée sans clé valide ------------------------
create or replace function public.handle_invited_signup()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_token uuid;
begin
  begin
    v_token := (new.raw_user_meta_data ->> 'invite_token')::uuid;
  exception when others then
    raise exception 'Clé d''invitation invalide';
  end;

  -- Consomme la clé de façon atomique (une seule personne peut l'utiliser)
  update public.invites
     set used_at = now(), used_by = new.id
   where token = v_token
     and used_at is null
     and expires_at > now();

  if not found then
    raise exception 'Clé d''invitation invalide, expirée ou déjà utilisée';
  end if;

  insert into public.editors (user_id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_invite on auth.users;
create trigger on_auth_user_created_invite
  after insert on auth.users
  for each row execute function public.handle_invited_signup();

-- 6. Créer une invitation (à relancer pour chaque personne) ---------------
-- insert into public.invites (note) values ('Marie') returning token;
-- Lien à envoyer :  https://TON-SITE/?cle=<token>
