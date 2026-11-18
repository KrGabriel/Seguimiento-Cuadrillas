-- =============================================================================
-- CUADRILLAS OS · Datos de prueba
-- Ejecutar DESPUÉS de supabase/schema.sql, en el SQL Editor de Supabase.
--
-- Este script es re-ejecutable: primero borra los datos de prueba anteriores
-- (identificados por los UUID y prefijos TEST-/PRUEBA) y luego los vuelve a
-- crear. No toca datos reales.
--
-- Para eliminar todo lo de prueba después: ejecutar
-- supabase/limpiar-datos-prueba.sql
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 0. Limpieza de los datos de prueba anteriores
-- -----------------------------------------------------------------------------
delete from public.movimientos_equipos
where numero_serie like 'TEST-%'
   or cuadrilla_id in (
     '11111111-1111-4111-8111-111111111101',
     '11111111-1111-4111-8111-111111111102',
     '11111111-1111-4111-8111-111111111103',
     '11111111-1111-4111-8111-111111111104'
   );

delete from public.incumplimientos
where cuadrilla_id in (
     '11111111-1111-4111-8111-111111111101',
     '11111111-1111-4111-8111-111111111102',
     '11111111-1111-4111-8111-111111111103',
     '11111111-1111-4111-8111-111111111104'
   )
   or tecnico_id in (
     '22222222-2222-4222-8222-222222222201',
     '22222222-2222-4222-8222-222222222202',
     '22222222-2222-4222-8222-222222222203',
     '22222222-2222-4222-8222-222222222204',
     '22222222-2222-4222-8222-222222222205',
     '22222222-2222-4222-8222-222222222206',
     '22222222-2222-4222-8222-222222222207',
     '22222222-2222-4222-8222-222222222208'
   );

delete from public.registros_diarios_tecnicos
where cuadrilla_id in (
     '11111111-1111-4111-8111-111111111101',
     '11111111-1111-4111-8111-111111111102',
     '11111111-1111-4111-8111-111111111103',
     '11111111-1111-4111-8111-111111111104'
   )
   or tecnico_id in (
     '22222222-2222-4222-8222-222222222201',
     '22222222-2222-4222-8222-222222222202',
     '22222222-2222-4222-8222-222222222203',
     '22222222-2222-4222-8222-222222222204',
     '22222222-2222-4222-8222-222222222205',
     '22222222-2222-4222-8222-222222222206',
     '22222222-2222-4222-8222-222222222207',
     '22222222-2222-4222-8222-222222222208'
   );

delete from public.metricas_cuadrilla_diaria
where cuadrilla_id in (
     '11111111-1111-4111-8111-111111111101',
     '11111111-1111-4111-8111-111111111102',
     '11111111-1111-4111-8111-111111111103',
     '11111111-1111-4111-8111-111111111104'
   );

delete from public.tecnicos where legajo like 'TEST-%';
delete from public.cuadrillas where nombre like 'PRUEBA %';

-- -----------------------------------------------------------------------------
-- 1. Cuadrillas (3 activas + 1 inactiva)
-- -----------------------------------------------------------------------------
insert into public.cuadrillas (id, nombre, vehiculo_asignado, estado_vehiculo, activa, created_at)
values
  ('11111111-1111-4111-8111-111111111101', 'PRUEBA Cuadrilla Norte',     'TEST-AB123CD', 'Operativo',     true,  now() - interval '120 days'),
  ('11111111-1111-4111-8111-111111111102', 'PRUEBA Cuadrilla Sur',       'TEST-EF456GH', 'Limpieza',      true,  now() - interval '120 days'),
  ('11111111-1111-4111-8111-111111111103', 'PRUEBA Cuadrilla Centro',    'TEST-IJ789KL', 'Mantenimiento', true,  now() - interval '90 days'),
  ('11111111-1111-4111-8111-111111111104', 'PRUEBA Cuadrilla Occidente', 'TEST-MN321OP', 'Herramientas',  false, now() - interval '90 days')
on conflict (id) do update set
  nombre = excluded.nombre,
  vehiculo_asignado = excluded.vehiculo_asignado,
  estado_vehiculo = excluded.estado_vehiculo,
  activa = excluded.activa;

-- -----------------------------------------------------------------------------
-- 2. Técnicos (7 activos + 1 inactivo)
-- -----------------------------------------------------------------------------
insert into public.tecnicos (id, nombre_completo, legajo, cuadrilla_actual_id, activo, fecha_ingreso)
values
  ('22222222-2222-4222-8222-222222222201', 'Andrés Felipe Rojas',       'TEST-0001', '11111111-1111-4111-8111-111111111101', true,  current_date - interval '400 days'),
  ('22222222-2222-4222-8222-222222222202', 'Carlos Mario Restrepo',     'TEST-0002', '11111111-1111-4111-8111-111111111101', true,  current_date - interval '320 days'),
  ('22222222-2222-4222-8222-222222222203', 'Diana Carolina Pérez',      'TEST-0003', '11111111-1111-4111-8111-111111111102', true,  current_date - interval '260 days'),
  ('22222222-2222-4222-8222-222222222204', 'Jhon Alexander Gómez',      'TEST-0004', '11111111-1111-4111-8111-111111111102', true,  current_date - interval '210 days'),
  ('22222222-2222-4222-8222-222222222205', 'Laura Marcela Díaz',        'TEST-0005', '11111111-1111-4111-8111-111111111102', true,  current_date - interval '180 days'),
  ('22222222-2222-4222-8222-222222222206', 'Luis Fernando Cardona',     'TEST-0006', '11111111-1111-4111-8111-111111111103', true,  current_date - interval '150 days'),
  ('22222222-2222-4222-8222-222222222207', 'Natalia Andrea Muñoz',      'TEST-0007', '11111111-1111-4111-8111-111111111103', true,  current_date - interval '120 days'),
  ('22222222-2222-4222-8222-222222222208', 'Yeison Camilo Ortiz',       'TEST-0008', '11111111-1111-4111-8111-111111111103', false, current_date - interval '300 days')
on conflict (id) do update set
  nombre_completo = excluded.nombre_completo,
  legajo = excluded.legajo,
  cuadrilla_actual_id = excluded.cuadrilla_actual_id,
  activo = excluded.activo,
  fecha_ingreso = excluded.fecha_ingreso;

-- -----------------------------------------------------------------------------
-- 3. Partes diarios · últimos 90 días (lunes a viernes)
--    El técnico inactivo solo tiene registros de hace más de 30 días.
-- -----------------------------------------------------------------------------
insert into public.registros_diarios_tecnicos (
  fecha, tecnico_id, cuadrilla_id,
  instalaciones_realizadas, reparaciones_realizadas, bajas_efectuadas,
  cambios_domicilio, trabajos_pendientes,
  puntualidad, uniforme, responsabilidad, cumplimiento_tareas,
  companerismo, comunicacion_supervision, notas_observacion
)
select
  d::date,
  t.id,
  case
    when random() < 0.12
      then (array['11111111-1111-4111-8111-111111111101',
                  '11111111-1111-4111-8111-111111111102',
                  '11111111-1111-4111-8111-111111111103']::uuid[])[1 + floor(random() * 3)::int]
    else t.cuadrilla_actual_id
  end,
  2 + floor(random() * 6)::int,
  floor(random() * 5)::int,
  floor(random() * 3)::int,
  floor(random() * 3)::int,
  case when random() < 0.65 then 0 else 1 + floor(random() * 3)::int end,
  (array[5,5,4,4,4,3,3,2,1])[1 + floor(random() * 9)::int],
  (array[5,5,4,4,4,3,3,2,1])[1 + floor(random() * 9)::int],
  (array[5,5,4,4,4,3,3,2,1])[1 + floor(random() * 9)::int],
  (array[5,5,4,4,4,3,3,2,1])[1 + floor(random() * 9)::int],
  (array[5,5,4,4,4,3,3,2,1])[1 + floor(random() * 9)::int],
  (array[5,5,4,4,4,3,3,2,1])[1 + floor(random() * 9)::int],
  case
    when random() < 0.7 then null
    when random() < 0.5 then 'Observación de prueba: cumplió la ruta asignada sin novedades.'
    else 'Observación de prueba: requiere seguimiento en la organización de materiales.'
  end
from generate_series(current_date - interval '89 days', current_date, interval '1 day') as d
cross join public.tecnicos t
where t.legajo like 'TEST-%'
  and t.cuadrilla_actual_id is not null
  and extract(isodow from d) between 1 and 5
  and not (t.activo = false and d::date < current_date - 30)
  and random() > 0.05;

-- -----------------------------------------------------------------------------
-- 4. Incumplimientos · sobre una parte de los partes diarios
-- -----------------------------------------------------------------------------
with base as (
  select
    r.fecha,
    r.tecnico_id,
    r.cuadrilla_id,
    (array[
      'Errores al descontar materiales en iClass',
      'Falta de optimización de materiales',
      'Tareas sin finalizar',
      'Incumplimiento de procedimientos',
      'Falta de uniforme',
      'Falta de candado de seguridad en escaleras',
      'Portones abiertos'
    ]::tipo_incumplimiento[])[1 + floor(random() * 7)::int] as tipo,
    (array['Leve', 'Leve', 'Moderada', 'Grave']::gravedad_incumplimiento[])[1 + floor(random() * 4)::int] as gravedad
  from public.registros_diarios_tecnicos r
  join public.tecnicos t on t.id = r.tecnico_id
  where t.legajo like 'TEST-%'
    and random() < 0.09
)
insert into public.incumplimientos (fecha, tecnico_id, cuadrilla_id, tipo_incumplimiento, gravedad, descripcion)
select
  fecha,
  tecnico_id,
  cuadrilla_id,
  tipo,
  gravedad,
  case tipo
    when 'Portones abiertos' then 'Se encontró el portón del depósito sin asegurar al cierre del turno.'
    when 'Tareas sin finalizar' then 'Orden de trabajo quedó abierta sin justificación registrada.'
    when 'Falta de uniforme' then 'El técnico no portaba el uniforme completo durante la visita.'
    when 'Falta de candado de seguridad en escaleras' then 'Escalera en uso sin candado de seguridad.'
    when 'Errores al descontar materiales en iClass' then 'Diferencia detectada al descontar materiales en iClass.'
    when 'Falta de optimización de materiales' then 'Se usaron más materiales de los previstos para la orden.'
    else 'Incumplimiento de procedimiento registrado durante la supervisión de prueba.'
  end
from base;

-- -----------------------------------------------------------------------------
-- 5. Control operativo diario · últimos 90 días por cuadrilla
-- -----------------------------------------------------------------------------
with base_metricas as (
  select
    d::date as fecha,
    c.id as cuadrilla_id,
    c.estado_vehiculo,
    8 + floor(random() * 11)::int as asignadas,
    floor(random() * 4)::int as no_finalizadas
  from generate_series(current_date - interval '89 days', current_date, interval '1 day') as d
  cross join public.cuadrillas c
  where c.nombre like 'PRUEBA %'
    and extract(isodow from d) between 1 and 5
)
insert into public.metricas_cuadrilla_diaria (
  fecha, cuadrilla_id,
  ordenes_asignadas, ordenes_finalizadas, ordenes_pendientes,
  trabajos_con_reclamos, materiales_utilizados, materiales_recuperados,
  observaciones_seguridad, estado_vehiculo_check
)
select
  fecha,
  cuadrilla_id,
  asignadas,
  asignadas - no_finalizadas,
  no_finalizadas,
  case when random() < 0.5 then 0 else 1 + floor(random() * 2)::int end,
  12 + floor(random() * 29)::int,
  6 + floor(random() * 19)::int,
  case
    when random() < 0.85 then null
    else 'Observación de prueba: se reforzó el uso de candado de seguridad en escaleras.'
  end,
  case
    when random() < 0.9 then estado_vehiculo
    else (array['Operativo', 'Mantenimiento', 'Limpieza', 'Herramientas']::estado_vehiculo[])[1 + floor(random() * 4)::int]
  end
from base_metricas;

-- -----------------------------------------------------------------------------
-- 6. Movimientos de equipos · 60 registros en los últimos 90 días
-- -----------------------------------------------------------------------------
insert into public.movimientos_equipos (
  fecha_recuperacion, cuadrilla_id, tecnico_id,
  cliente_abonado, tipo_equipo, marca_modelo, numero_serie,
  estado_recepcion, destino_equipo
)
select
  current_date - floor(random() * 90)::int,
  t.cuadrilla_actual_id,
  t.id,
  (array[
    'María Fernanda López',
    'Jorge Enrique Salazar',
    'Edificio Los Cedros',
    'Conjunto Altos del Prado',
    'Sandra Milena Cárdenas',
    'Restaurante El Buen Sabor',
    'Pedro Antonio Mejía',
    'Clínica San Rafael',
    'Luz Dary Ospina',
    'Almacén La Economía'
  ])[1 + floor(random() * 10)::int],
  (array['ONU', 'Router', 'Decodificador', 'ONT', 'Módem'])[1 + floor(random() * 5)::int],
  (array['Huawei HG8245', 'ZTE F670L', 'Nokia G-140W', 'Technicolor CGA2121', 'Arris TG2482'])[1 + floor(random() * 5)::int],
  'TEST-SN-' || lpad(g::text, 4, '0'),
  (array['Operativo', 'Operativo', 'Dañado', 'Para revisión']::estado_recepcion[])[1 + floor(random() * 4)::int],
  (array['Stock disponible', 'Stock disponible', 'Laboratorio/Reparación', 'Baja definitiva']::destino_equipo[])[1 + floor(random() * 4)::int]
from generate_series(1, 60) as g
join lateral (
  select id, cuadrilla_actual_id
  from public.tecnicos
  where legajo = 'TEST-' || lpad((((g - 1) % 8) + 1)::text, 4, '0')
) t on true;

commit;

-- -----------------------------------------------------------------------------
-- Verificación rápida
-- -----------------------------------------------------------------------------
select 'Cuadrillas' as entidad, count(*) as registros from public.cuadrillas where nombre like 'PRUEBA %'
union all
select 'Técnicos', count(*) from public.tecnicos where legajo like 'TEST-%'
union all
select 'Partes diarios', count(*) from public.registros_diarios_tecnicos r
  join public.tecnicos t on t.id = r.tecnico_id where t.legajo like 'TEST-%'
union all
select 'Incumplimientos', count(*) from public.incumplimientos i
  join public.tecnicos t on t.id = i.tecnico_id where t.legajo like 'TEST-%'
union all
select 'Controles operativos', count(*) from public.metricas_cuadrilla_diaria m
  join public.cuadrillas c on c.id = m.cuadrilla_id where c.nombre like 'PRUEBA %'
union all
select 'Equipos', count(*) from public.movimientos_equipos where numero_serie like 'TEST-%';
