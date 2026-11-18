-- =============================================================================
-- CUADRILLAS OS · Evidencias fotográficas
-- Ejecutar en el SQL Editor de Supabase.
-- Crea la columna evidencia_url y el bucket público "evidencias".
-- =============================================================================

alter table public.incumplimientos
  add column if not exists evidencia_url text;

alter table public.movimientos_equipos
  add column if not exists evidencia_url text;

insert into storage.buckets (id, name, public)
values ('evidencias', 'evidencias', true)
on conflict (id) do update set public = true;

drop policy if exists "evidencias_insert" on storage.objects;
create policy "evidencias_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'evidencias');

drop policy if exists "evidencias_update" on storage.objects;
create policy "evidencias_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'evidencias')
  with check (bucket_id = 'evidencias');

drop policy if exists "evidencias_delete" on storage.objects;
create policy "evidencias_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'evidencias');

drop policy if exists "evidencias_select" on storage.objects;
create policy "evidencias_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'evidencias');

select 'Evidencias habilitadas' as estado;
