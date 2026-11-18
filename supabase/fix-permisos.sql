-- =============================================================================
-- FIX · "permission denied for table ..."
-- Ejecutar completo en el SQL Editor de Supabase si la app muestra errores de
-- permisos al leer o escribir tablas.
--
-- Causa: el rol `authenticated` no tiene privilegios (GRANT) sobre las tablas,
-- aunque las políticas RLS sí existan. RLS filtra filas; GRANT habilita el
-- acceso a la tabla. Se requieren ambos.
-- =============================================================================

-- 1) Uso del esquema por parte del rol autenticado
grant usage on schema public to authenticated;

-- 2) Privilegios sobre tablas, secuencias y funciones existentes
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant execute on all functions in schema public to authenticated;

-- 3) Vista de apoyo del esquema
grant select on public.v_resumen_cuadrilla_diario to authenticated;

-- 4) Privilegios por defecto para objetos futuros creados en public
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant usage, select on sequences to authenticated;

-- 5) Reafirmar RLS y políticas (idempotente)
alter table public.cuadrillas enable row level security;
alter table public.tecnicos enable row level security;
alter table public.registros_diarios_tecnicos enable row level security;
alter table public.incumplimientos enable row level security;
alter table public.metricas_cuadrilla_diaria enable row level security;
alter table public.movimientos_equipos enable row level security;

drop policy if exists "admin_all_cuadrillas" on public.cuadrillas;
drop policy if exists "admin_all_tecnicos" on public.tecnicos;
drop policy if exists "admin_all_registros" on public.registros_diarios_tecnicos;
drop policy if exists "admin_all_incumplimientos" on public.incumplimientos;
drop policy if exists "admin_all_metricas" on public.metricas_cuadrilla_diaria;
drop policy if exists "admin_all_equipos" on public.movimientos_equipos;

create policy "admin_all_cuadrillas" on public.cuadrillas
  for all to authenticated using (true) with check (true);
create policy "admin_all_tecnicos" on public.tecnicos
  for all to authenticated using (true) with check (true);
create policy "admin_all_registros" on public.registros_diarios_tecnicos
  for all to authenticated using (true) with check (true);
create policy "admin_all_incumplimientos" on public.incumplimientos
  for all to authenticated using (true) with check (true);
create policy "admin_all_metricas" on public.metricas_cuadrilla_diaria
  for all to authenticated using (true) with check (true);
create policy "admin_all_equipos" on public.movimientos_equipos
  for all to authenticated using (true) with check (true);

-- 6) Verificación: debe devolver las 6 tablas con sus políticas y RLS activo.
select
  c.relname                                as tabla,
  c.relrowsecurity                         as rls_activo,
  count(p.policyname)                      as politicas,
  has_table_privilege('authenticated', c.oid, 'SELECT') as authenticated_select,
  has_table_privilege('authenticated', c.oid, 'INSERT') as authenticated_insert
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policies p on p.tablename = c.relname and p.schemaname = 'public'
where n.nspname = 'public'
  and c.relname in (
    'cuadrillas',
    'tecnicos',
    'registros_diarios_tecnicos',
    'incumplimientos',
    'metricas_cuadrilla_diaria',
    'movimientos_equipos'
  )
group by c.relname, c.relrowsecurity, c.oid
order by c.relname;
