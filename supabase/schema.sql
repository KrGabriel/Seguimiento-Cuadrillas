-- =============================================================================
-- CUADRILLAS OS · Esquema Supabase (PostgreSQL)
-- Ejecutar completo en el SQL Editor de Supabase.
-- Un solo rol de aplicación: Administrador (usuarios autenticados).
-- Regla de negocio clave: cada registro histórico guarda tecnico_id + cuadrilla_id
-- para preservar la trazabilidad aunque el técnico cambie de cuadrilla.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Tipos enumerados
-- -----------------------------------------------------------------------------
do $$ begin
  create type estado_vehiculo as enum ('Operativo', 'Mantenimiento', 'Limpieza', 'Herramientas');
exception when duplicate_object then null; end $$;

do $$ begin
  create type gravedad_incumplimiento as enum ('Leve', 'Moderada', 'Grave');
exception when duplicate_object then null; end $$;

do $$ begin
  create type estado_recepcion as enum ('Operativo', 'Dañado', 'Para revisión');
exception when duplicate_object then null; end $$;

do $$ begin
  create type destino_equipo as enum ('Stock disponible', 'Laboratorio/Reparación', 'Baja definitiva');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tipo_incumplimiento as enum (
    'Errores al descontar materiales en iClass',
    'Falta de optimización de materiales',
    'Tareas sin finalizar',
    'Incumplimiento de procedimientos',
    'Falta de uniforme',
    'Falta de candado de seguridad en escaleras',
    'Portones abiertos'
  );
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- 1. cuadrillas
-- -----------------------------------------------------------------------------
create table if not exists public.cuadrillas (
  id                uuid primary key default gen_random_uuid(),
  nombre            text not null unique,
  vehiculo_asignado text,
  estado_vehiculo   estado_vehiculo not null default 'Operativo',
  activa            boolean not null default true,
  created_at        timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 2. tecnicos
-- -----------------------------------------------------------------------------
create table if not exists public.tecnicos (
  id                  uuid primary key default gen_random_uuid(),
  nombre_completo     text not null,
  legajo              text not null unique,
  cuadrilla_actual_id uuid references public.cuadrillas(id) on delete set null,
  activo              boolean not null default true,
  fecha_ingreso       date not null default current_date,
  created_at          timestamptz not null default now()
);

create index if not exists idx_tecnicos_cuadrilla on public.tecnicos(cuadrilla_actual_id);

-- -----------------------------------------------------------------------------
-- 3. registros_diarios_tecnicos
-- -----------------------------------------------------------------------------
create table if not exists public.registros_diarios_tecnicos (
  id                       uuid primary key default gen_random_uuid(),
  fecha                    date not null default current_date,
  tecnico_id               uuid not null references public.tecnicos(id) on delete restrict,
  cuadrilla_id             uuid not null references public.cuadrillas(id) on delete restrict,

  -- Rendimiento técnico
  instalaciones_realizadas integer not null default 0 check (instalaciones_realizadas >= 0),
  reparaciones_realizadas  integer not null default 0 check (reparaciones_realizadas >= 0),
  bajas_efectuadas         integer not null default 0 check (bajas_efectuadas >= 0),
  cambios_domicilio        integer not null default 0 check (cambios_domicilio >= 0),
  trabajos_pendientes      integer not null default 0 check (trabajos_pendientes >= 0),

  -- Evaluación / actitud diaria (1 a 5)
  puntualidad              smallint not null default 3 check (puntualidad between 1 and 5),
  uniforme                 smallint not null default 3 check (uniforme between 1 and 5),
  responsabilidad          smallint not null default 3 check (responsabilidad between 1 and 5),
  cumplimiento_tareas      smallint not null default 3 check (cumplimiento_tareas between 1 and 5),
  companerismo             smallint not null default 3 check (companerismo between 1 and 5),
  comunicacion_supervision smallint not null default 3 check (comunicacion_supervision between 1 and 5),

  notas_observacion        text,
  created_at               timestamptz not null default now(),

  constraint uq_registro_diario unique (fecha, tecnico_id)
);

create index if not exists idx_registros_fecha on public.registros_diarios_tecnicos(fecha desc);
create index if not exists idx_registros_tecnico on public.registros_diarios_tecnicos(tecnico_id);
create index if not exists idx_registros_cuadrilla on public.registros_diarios_tecnicos(cuadrilla_id);

-- -----------------------------------------------------------------------------
-- 4. incumplimientos
-- -----------------------------------------------------------------------------
create table if not exists public.incumplimientos (
  id                 uuid primary key default gen_random_uuid(),
  fecha              date not null default current_date,
  tecnico_id         uuid not null references public.tecnicos(id) on delete restrict,
  cuadrilla_id       uuid not null references public.cuadrillas(id) on delete restrict,
  tipo_incumplimiento tipo_incumplimiento not null,
  gravedad           gravedad_incumplimiento not null default 'Leve',
  descripcion        text,
  created_at         timestamptz not null default now()
);

create index if not exists idx_incumplimientos_fecha on public.incumplimientos(fecha desc);
create index if not exists idx_incumplimientos_tecnico on public.incumplimientos(tecnico_id);
create index if not exists idx_incumplimientos_cuadrilla on public.incumplimientos(cuadrilla_id);

-- -----------------------------------------------------------------------------
-- 5. metricas_cuadrilla_diaria
-- -----------------------------------------------------------------------------
create table if not exists public.metricas_cuadrilla_diaria (
  id                     uuid primary key default gen_random_uuid(),
  fecha                  date not null default current_date,
  cuadrilla_id           uuid not null references public.cuadrillas(id) on delete cascade,
  ordenes_asignadas      integer not null default 0 check (ordenes_asignadas >= 0),
  ordenes_finalizadas    integer not null default 0 check (ordenes_finalizadas >= 0),
  ordenes_pendientes     integer not null default 0 check (ordenes_pendientes >= 0),
  trabajos_con_reclamos  integer not null default 0 check (trabajos_con_reclamos >= 0),
  materiales_utilizados  integer not null default 0 check (materiales_utilizados >= 0),
  materiales_recuperados integer not null default 0 check (materiales_recuperados >= 0),
  observaciones_seguridad text,
  estado_vehiculo_check  estado_vehiculo,
  created_at             timestamptz not null default now(),

  constraint uq_metrica_cuadrilla_dia unique (fecha, cuadrilla_id)
);

create index if not exists idx_metricas_fecha on public.metricas_cuadrilla_diaria(fecha desc);
create index if not exists idx_metricas_cuadrilla on public.metricas_cuadrilla_diaria(cuadrilla_id);

-- -----------------------------------------------------------------------------
-- 6. movimientos_equipos
-- -----------------------------------------------------------------------------
create table if not exists public.movimientos_equipos (
  id                uuid primary key default gen_random_uuid(),
  fecha_recuperacion date not null default current_date,
  cuadrilla_id      uuid not null references public.cuadrillas(id) on delete restrict,
  tecnico_id        uuid not null references public.tecnicos(id) on delete restrict,
  cliente_abonado   text not null,
  tipo_equipo       text not null,
  marca_modelo      text,
  numero_serie      text not null unique,
  estado_recepcion  estado_recepcion not null default 'Operativo',
  destino_equipo    destino_equipo not null default 'Stock disponible',
  created_at        timestamptz not null default now()
);

create index if not exists idx_equipos_fecha on public.movimientos_equipos(fecha_recuperacion desc);
create index if not exists idx_equipos_serie on public.movimientos_equipos(numero_serie);
create index if not exists idx_equipos_cliente on public.movimientos_equipos(cliente_abonado);
create index if not exists idx_equipos_cuadrilla on public.movimientos_equipos(cuadrilla_id);

-- -----------------------------------------------------------------------------
-- Vista de apoyo: resumen diario por cuadrilla (opcional, útil para reportería)
-- -----------------------------------------------------------------------------
create or replace view public.v_resumen_cuadrilla_diario as
select
  c.id                as cuadrilla_id,
  c.nombre            as cuadrilla,
  c.estado_vehiculo,
  m.fecha,
  m.ordenes_asignadas,
  m.ordenes_finalizadas,
  m.ordenes_pendientes,
  m.trabajos_con_reclamos,
  m.materiales_utilizados,
  m.materiales_recuperados,
  case when m.ordenes_asignadas > 0
       then round((m.ordenes_finalizadas::numeric / m.ordenes_asignadas) * 100, 1)
       else 0 end as pct_cumplimiento,
  coalesce(r.total_registros, 0)       as partes_tecnicos,
  coalesce(r.total_instalaciones, 0)   as instalaciones,
  coalesce(r.total_reparaciones, 0)    as reparaciones,
  coalesce(i.total_incumplimientos, 0) as incumplimientos,
  coalesce(e.total_equipos, 0)         as equipos_recuperados
from public.cuadrillas c
left join public.metricas_cuadrilla_diaria m on m.cuadrilla_id = c.id
left join (
  select cuadrilla_id, fecha, count(*) as total_registros,
         sum(instalaciones_realizadas) as total_instalaciones,
         sum(reparaciones_realizadas)  as total_reparaciones
  from public.registros_diarios_tecnicos
  group by cuadrilla_id, fecha
) r on r.cuadrilla_id = c.id and r.fecha = m.fecha
left join (
  select cuadrilla_id, fecha, count(*) as total_incumplimientos
  from public.incumplimientos group by cuadrilla_id, fecha
) i on i.cuadrilla_id = c.id and i.fecha = m.fecha
left join (
  select cuadrilla_id, fecha_recuperacion, count(*) as total_equipos
  from public.movimientos_equipos group by cuadrilla_id, fecha_recuperacion
) e on e.cuadrilla_id = c.id and e.fecha_recuperacion = m.fecha;

-- -----------------------------------------------------------------------------
-- Privilegios de tabla para el rol authenticated
-- Supabase normalmente los aplica por defecto; se declaran explícitamente para
-- evitar "permission denied for table" en proyectos con default privileges
-- modificados. El rol anon no recibe permisos: toda lectura requiere sesión.
-- -----------------------------------------------------------------------------
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant execute on all functions in schema public to authenticated;
grant select on public.v_resumen_cuadrilla_diario to authenticated;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant usage, select on sequences to authenticated;

-- -----------------------------------------------------------------------------
-- Row Level Security · solo usuarios autenticados (Administrador)
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- Datos iniciales de ejemplo (opcional, borrar si no se desea)
-- -----------------------------------------------------------------------------
insert into public.cuadrillas (nombre, vehiculo_asignado, estado_vehiculo, activa)
values
  ('Cuadrilla Norte',  'AB123CD', 'Operativo', true),
  ('Cuadrilla Sur',    'EF456GH', 'Operativo', true),
  ('Cuadrilla Centro', 'IJ789KL', 'Mantenimiento', true)
on conflict (nombre) do nothing;

insert into public.tecnicos (nombre_completo, legajo, cuadrilla_actual_id, activo)
select 'Técnico de Prueba', 'LEG-0001', c.id, true
from public.cuadrillas c
where c.nombre = 'Cuadrilla Norte'
on conflict (legajo) do nothing;

-- NOTA: crea el usuario administrador desde Authentication > Users en el panel de
-- Supabase (email + contraseña). No se requiere tabla de roles: todo usuario
-- autenticado opera como Administrador.
