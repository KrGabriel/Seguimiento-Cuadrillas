-- =============================================================================
-- CUADRILLAS OS · Limpiar solo los datos de prueba
-- Ejecutar en el SQL Editor de Supabase cuando ya no necesites las pruebas.
-- No elimina datos reales.
-- =============================================================================

begin;

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

-- Opcional: los datos iniciales que trae supabase/schema.sql
-- (Cuadrilla Norte/Sur/Centro y el Técnico de Prueba LEG-0001). Descomenta si
-- también quieres quitarlos; fallará si tienen registros reales asociados.
-- delete from public.tecnicos where legajo = 'LEG-0001';
-- delete from public.cuadrillas
-- where nombre in ('Cuadrilla Norte', 'Cuadrilla Sur', 'Cuadrilla Centro');

commit;

-- -----------------------------------------------------------------------------
-- Opción destructiva: eliminar TODOS los datos (reales y de prueba) y reiniciar
-- las tablas. Úsala solo si quieres dejar la base vacía.
-- -----------------------------------------------------------------------------
-- truncate table
--   public.movimientos_equipos,
--   public.incumplimientos,
--   public.registros_diarios_tecnicos,
--   public.metricas_cuadrilla_diaria,
--   public.tecnicos,
--   public.cuadrillas
-- restart identity cascade;

select 'Cuadrillas de prueba restantes' as entidad, count(*) as registros
from public.cuadrillas where nombre like 'PRUEBA %'
union all
select 'Técnicos de prueba restantes', count(*)
from public.tecnicos where legajo like 'TEST-%';
