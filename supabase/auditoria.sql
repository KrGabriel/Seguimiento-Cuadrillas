-- =============================================================================
-- CUADRILLAS OS · Auditoría de cambios
-- Ejecutar en el SQL Editor de Supabase.
-- Registra INSERT/UPDATE/DELETE de las tablas operativas con el usuario que
-- ejecutó el cambio. La lectura queda disponible para usuarios autenticados.
-- =============================================================================

create table if not exists public.auditoria (
  id            bigint generated always as identity primary key,
  tabla         text not null,
  operacion     text not null check (operacion in ('INSERT', 'UPDATE', 'DELETE')),
  registro_id   text,
  usuario_id    uuid,
  usuario_email text,
  datos         jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists idx_auditoria_fecha on public.auditoria(created_at desc);
create index if not exists idx_auditoria_tabla on public.auditoria(tabla, created_at desc);

alter table public.auditoria enable row level security;

drop policy if exists "auditoria_lectura" on public.auditoria;
create policy "auditoria_lectura" on public.auditoria
  for select to authenticated using (true);

grant select on public.auditoria to authenticated;
revoke insert, update, delete on public.auditoria from authenticated;
revoke all on public.auditoria from anon;

create or replace function public.fn_auditoria()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_anterior jsonb;
  v_nuevo    jsonb;
  v_id       text;
begin
  if tg_op = 'DELETE' then
    v_anterior := to_jsonb(old);
    v_id := old.id::text;
  elsif tg_op = 'UPDATE' then
    v_anterior := to_jsonb(old);
    v_nuevo := to_jsonb(new);
    v_id := new.id::text;
  else
    v_nuevo := to_jsonb(new);
    v_id := new.id::text;
  end if;

  insert into public.auditoria (tabla, operacion, registro_id, usuario_id, usuario_email, datos)
  values (
    tg_table_name,
    tg_op,
    v_id,
    auth.uid(),
    coalesce(auth.jwt() ->> 'email', 'sistema'),
    jsonb_build_object('anterior', v_anterior, 'nuevo', v_nuevo)
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'cuadrillas',
    'tecnicos',
    'registros_diarios_tecnicos',
    'incumplimientos',
    'metricas_cuadrilla_diaria',
    'movimientos_equipos',
    'perfiles'
  ]
  loop
    if to_regclass('public.' || t) is not null then
      execute format('drop trigger if exists trg_auditoria_%I on public.%I', t, t);
      execute format(
        'create trigger trg_auditoria_%I after insert or update or delete on public.%I for each row execute function public.fn_auditoria()',
        t, t
      );
    end if;
  end loop;
end $$;

select 'Auditoría instalada' as estado, count(*) as eventos from public.auditoria;
