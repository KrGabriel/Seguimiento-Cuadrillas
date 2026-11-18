-- =============================================================================
-- CUADRILLAS OS · Usuarios y roles
-- Ejecutar en el SQL Editor de Supabase.
-- Crea la tabla perfiles, el trigger de alta automática y deja a los usuarios
-- existentes como Administrador. Los nuevos usuarios entran como Supervisor.
-- =============================================================================

do $$ begin
  create type rol_usuario as enum ('Administrador', 'Supervisor');
exception when duplicate_object then null; end $$;

create table if not exists public.perfiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  nombre     text,
  rol        rol_usuario not null default 'Supervisor',
  activo     boolean not null default true,
  created_at timestamptz not null default now()
);

-- Usuarios creados antes de este script: Administrador para no perder acceso.
insert into public.perfiles (id, email, nombre, rol, activo, created_at)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data ->> 'full_name', split_part(coalesce(u.email, ''), '@', 1)),
  'Administrador',
  true,
  u.created_at
from auth.users u
on conflict (id) do nothing;

create or replace function public.fn_nuevo_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rol rol_usuario;
begin
  select case when count(*) = 0 then 'Administrador'::rol_usuario else 'Supervisor'::rol_usuario end
    into v_rol
    from public.perfiles;

  insert into public.perfiles (id, email, nombre, rol, activo, created_at)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, ''), '@', 1)),
    v_rol,
    true,
    coalesce(new.created_at, now())
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists trg_nuevo_perfil on auth.users;
create trigger trg_nuevo_perfil
  after insert on auth.users
  for each row execute function public.fn_nuevo_perfil();

alter table public.perfiles enable row level security;

drop policy if exists "perfiles_lectura" on public.perfiles;
create policy "perfiles_lectura" on public.perfiles
  for select to authenticated using (true);

grant select on public.perfiles to authenticated;
revoke insert, update, delete on public.perfiles from authenticated;
revoke all on public.perfiles from anon;

notify pgrst, 'reload schema';

select 'Perfiles habilitados' as estado, count(*) as usuarios from public.perfiles;
