"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseConfigurado } from "@/lib/env";
import { demoTecnicos } from "@/lib/demo";
import { createClient } from "@/lib/supabase/server";
import {
  cuadrillaSchema,
  equipoSchema,
  incumplimientoSchema,
  operativoSchema,
  parteDiarioSchema,
  tecnicoSchema,
} from "@/lib/schemas";

const RUTAS = [
  "/dashboard",
  "/tecnicos",
  "/cuadrillas",
  "/carga",
  "/incumplimientos",
  "/operativo",
  "/informes/tecnicos",
  "/informes/cuadrillas",
  "/informes/equipos",
];

async function sincronizarVehiculo(cuadrillaId: string, estado: string | undefined | null) {
  if (!estado) return;
  const supabase = await createClient();
  await supabase
    .from("cuadrillas")
    .update({ estado_vehiculo: estado })
    .eq("id", cuadrillaId);
}

function revalidar() {
  for (const ruta of RUTAS) revalidatePath(ruta);
}

function vacioANull(value: string | undefined | null) {
  if (!value) return null;
  const limpio = value.trim();
  return limpio.length ? limpio : null;
}

type Resultado = { ok: boolean; error?: string; demo?: boolean };

function errorAmigable(message: string): string {
  if (message.includes("uq_registro_diario")) {
    return "Ya existe un parte diario para ese técnico en la fecha seleccionada.";
  }
  if (message.includes("uq_metrica_cuadrilla_dia")) {
    return "Ya existe un control operativo para esa cuadrilla en la fecha seleccionada.";
  }
  if (message.includes("numero_serie")) {
    return "El número de serie ya está registrado en otro movimiento.";
  }
  if (message.includes("legajo")) return "El legajo ya está asignado a otro técnico.";
  if (message.includes("nombre")) return "Ya existe una cuadrilla con ese nombre.";
  return "No se pudo guardar el registro. Verifica los datos e intenta nuevamente.";
}

export async function crearParteDiario(data: unknown): Promise<Resultado> {
  const parsed = parteDiarioSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: "Revisa los campos obligatorios." };
  if (!supabaseConfigurado) {
    revalidar();
    return { ok: true, demo: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("registros_diarios_tecnicos").insert({
    ...parsed.data,
    notas_observacion: vacioANull(parsed.data.notas_observacion),
  });
  if (error) return { ok: false, error: errorAmigable(error.message) };

  revalidar();
  return { ok: true };
}

export async function crearIncumplimiento(data: unknown): Promise<Resultado> {
  const parsed = incumplimientoSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: "Revisa los campos obligatorios." };
  if (!supabaseConfigurado) {
    revalidar();
    return { ok: true, demo: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("incumplimientos").insert({
    ...parsed.data,
    descripcion: vacioANull(parsed.data.descripcion),
    evidencia_url: vacioANull(parsed.data.evidencia_url),
  });
  if (error) return { ok: false, error: errorAmigable(error.message) };

  revalidar();
  return { ok: true };
}

export async function crearOperativo(data: unknown): Promise<Resultado> {
  const parsed = operativoSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: "Revisa los campos obligatorios." };
  if (!supabaseConfigurado) {
    revalidar();
    return { ok: true, demo: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("metricas_cuadrilla_diaria").insert({
    ...parsed.data,
    observaciones_seguridad: vacioANull(parsed.data.observaciones_seguridad),
    estado_vehiculo_check: vacioANull(parsed.data.estado_vehiculo_check),
  });
  if (error) return { ok: false, error: errorAmigable(error.message) };

  await sincronizarVehiculo(parsed.data.cuadrilla_id, parsed.data.estado_vehiculo_check);
  revalidar();
  return { ok: true };
}

export async function crearEquipo(data: unknown): Promise<Resultado> {
  const parsed = equipoSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: "Revisa los campos obligatorios." };
  if (!supabaseConfigurado) {
    revalidar();
    return { ok: true, demo: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("movimientos_equipos").insert({
    ...parsed.data,
    marca_modelo: vacioANull(parsed.data.marca_modelo),
    numero_serie: parsed.data.numero_serie.trim().toUpperCase(),
    evidencia_url: vacioANull(parsed.data.evidencia_url),
  });
  if (error) return { ok: false, error: errorAmigable(error.message) };

  revalidar();
  return { ok: true };
}

export async function crearTecnico(data: unknown): Promise<Resultado> {
  const parsed = tecnicoSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: "Revisa los campos obligatorios." };
  if (!supabaseConfigurado) {
    revalidar();
    return { ok: true, demo: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tecnicos").insert({
    ...parsed.data,
    cuadrilla_actual_id: vacioANull(parsed.data.cuadrilla_actual_id),
  });
  if (error) return { ok: false, error: errorAmigable(error.message) };

  revalidar();
  return { ok: true };
}

export async function actualizarTecnico(id: string, data: unknown): Promise<Resultado> {
  const parsed = tecnicoSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: "Revisa los campos obligatorios." };
  if (!supabaseConfigurado) {
    revalidar();
    return { ok: true, demo: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("tecnicos")
    .update({
      ...parsed.data,
      cuadrilla_actual_id: vacioANull(parsed.data.cuadrilla_actual_id),
    })
    .eq("id", id);
  if (error) return { ok: false, error: errorAmigable(error.message) };

  revalidar();
  return { ok: true };
}

export async function cambiarEstadoTecnico(id: string, activo: boolean): Promise<Resultado> {
  if (!supabaseConfigurado) {
    revalidar();
    return { ok: true, demo: true };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("tecnicos").update({ activo }).eq("id", id);
  if (error) return { ok: false, error: errorAmigable(error.message) };
  revalidar();
  return { ok: true };
}

export async function crearCuadrilla(data: unknown): Promise<Resultado> {
  const parsed = cuadrillaSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: "Revisa los campos obligatorios." };
  if (!supabaseConfigurado) {
    revalidar();
    return { ok: true, demo: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("cuadrillas").insert({
    ...parsed.data,
    vehiculo_asignado: vacioANull(parsed.data.vehiculo_asignado),
  });
  if (error) return { ok: false, error: errorAmigable(error.message) };

  revalidar();
  return { ok: true };
}

export async function actualizarCuadrilla(id: string, data: unknown): Promise<Resultado> {
  const parsed = cuadrillaSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: "Revisa los campos obligatorios." };

  if (!parsed.data.activa) {
    let asignados = 0;
    if (supabaseConfigurado) {
      const supabase = await createClient();
      const { count } = await supabase
        .from("tecnicos")
        .select("id", { count: "exact", head: true })
        .eq("cuadrilla_actual_id", id)
        .eq("activo", true);
      asignados = count ?? 0;
    } else {
      asignados = demoTecnicos.filter((t) => t.activo && t.cuadrilla_actual_id === id).length;
    }
    if (asignados > 0) {
      return {
        ok: false,
        error: `No puedes desactivar la cuadrilla: tiene ${asignados} técnico(s) activo(s) asignado(s). Reasígnalos primero.`,
      };
    }
  }

  if (!supabaseConfigurado) {
    revalidar();
    return { ok: true, demo: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("cuadrillas")
    .update({
      ...parsed.data,
      vehiculo_asignado: vacioANull(parsed.data.vehiculo_asignado),
    })
    .eq("id", id);
  if (error) return { ok: false, error: errorAmigable(error.message) };

  revalidar();
  return { ok: true };
}

// -----------------------------------------------------------------------------
// Edición y eliminación de registros diarios (parte, incumplimiento, operativo,
// equipos). Permiten corregir errores de carga manteniendo la trazabilidad.
// -----------------------------------------------------------------------------

export async function actualizarParteDiario(id: string, data: unknown): Promise<Resultado> {
  const parsed = parteDiarioSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: "Revisa los campos obligatorios." };
  if (!supabaseConfigurado) {
    revalidar();
    return { ok: true, demo: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("registros_diarios_tecnicos")
    .update({
      ...parsed.data,
      notas_observacion: vacioANull(parsed.data.notas_observacion),
    })
    .eq("id", id);
  if (error) return { ok: false, error: errorAmigable(error.message) };

  revalidar();
  return { ok: true };
}

export async function eliminarParteDiario(id: string): Promise<Resultado> {
  if (!supabaseConfigurado) {
    revalidar();
    return { ok: true, demo: true };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("registros_diarios_tecnicos").delete().eq("id", id);
  if (error) return { ok: false, error: errorAmigable(error.message) };
  revalidar();
  return { ok: true };
}

export async function actualizarIncumplimiento(id: string, data: unknown): Promise<Resultado> {
  const parsed = incumplimientoSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: "Revisa los campos obligatorios." };
  if (!supabaseConfigurado) {
    revalidar();
    return { ok: true, demo: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("incumplimientos")
    .update({
      ...parsed.data,
      descripcion: vacioANull(parsed.data.descripcion),
      evidencia_url: vacioANull(parsed.data.evidencia_url),
    })
    .eq("id", id);
  if (error) return { ok: false, error: errorAmigable(error.message) };

  revalidar();
  return { ok: true };
}

export async function eliminarIncumplimiento(id: string): Promise<Resultado> {
  if (!supabaseConfigurado) {
    revalidar();
    return { ok: true, demo: true };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("incumplimientos").delete().eq("id", id);
  if (error) return { ok: false, error: errorAmigable(error.message) };
  revalidar();
  return { ok: true };
}

export async function actualizarOperativo(id: string, data: unknown): Promise<Resultado> {
  const parsed = operativoSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: "Revisa los campos obligatorios." };
  if (!supabaseConfigurado) {
    revalidar();
    return { ok: true, demo: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("metricas_cuadrilla_diaria")
    .update({
      ...parsed.data,
      observaciones_seguridad: vacioANull(parsed.data.observaciones_seguridad),
      estado_vehiculo_check: vacioANull(parsed.data.estado_vehiculo_check),
    })
    .eq("id", id);
  if (error) return { ok: false, error: errorAmigable(error.message) };

  await sincronizarVehiculo(parsed.data.cuadrilla_id, parsed.data.estado_vehiculo_check);
  revalidar();
  return { ok: true };
}

export async function eliminarOperativo(id: string): Promise<Resultado> {
  if (!supabaseConfigurado) {
    revalidar();
    return { ok: true, demo: true };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("metricas_cuadrilla_diaria").delete().eq("id", id);
  if (error) return { ok: false, error: errorAmigable(error.message) };
  revalidar();
  return { ok: true };
}

export async function actualizarEquipo(id: string, data: unknown): Promise<Resultado> {
  const parsed = equipoSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: "Revisa los campos obligatorios." };
  if (!supabaseConfigurado) {
    revalidar();
    return { ok: true, demo: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("movimientos_equipos")
    .update({
      ...parsed.data,
      marca_modelo: vacioANull(parsed.data.marca_modelo),
      numero_serie: parsed.data.numero_serie.trim().toUpperCase(),
      evidencia_url: vacioANull(parsed.data.evidencia_url),
    })
    .eq("id", id);
  if (error) return { ok: false, error: errorAmigable(error.message) };

  revalidar();
  return { ok: true };
}

export async function eliminarEquipo(id: string): Promise<Resultado> {
  if (!supabaseConfigurado) {
    revalidar();
    return { ok: true, demo: true };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("movimientos_equipos").delete().eq("id", id);
  if (error) return { ok: false, error: errorAmigable(error.message) };
  revalidar();
  return { ok: true };
}

export async function eliminarTecnicoDefinitivo(id: string): Promise<Resultado> {
  if (!supabaseConfigurado) {
    revalidar();
    return { ok: true, demo: true };
  }
  const supabase = await createClient();
  const [registros, faltas, equipos] = await Promise.all([
    supabase
      .from("registros_diarios_tecnicos")
      .select("id", { count: "exact", head: true })
      .eq("tecnico_id", id),
    supabase
      .from("incumplimientos")
      .select("id", { count: "exact", head: true })
      .eq("tecnico_id", id),
    supabase
      .from("movimientos_equipos")
      .select("id", { count: "exact", head: true })
      .eq("tecnico_id", id),
  ]);

  const historial = (registros.count ?? 0) + (faltas.count ?? 0) + (equipos.count ?? 0);
  if (historial > 0) {
    return {
      ok: false,
      error: `No se puede eliminar: el técnico tiene ${historial} registro(s) histórico(s). Usa la baja lógica.`,
    };
  }

  const { error } = await supabase.from("tecnicos").delete().eq("id", id);
  if (error) return { ok: false, error: errorAmigable(error.message) };
  revalidar();
  return { ok: true };
}

export async function eliminarCuadrillaDefinitiva(id: string): Promise<Resultado> {
  if (!supabaseConfigurado) {
    revalidar();
    return { ok: true, demo: true };
  }
  const supabase = await createClient();
  const [registros, faltas, equipos, metricas, tecnicos] = await Promise.all([
    supabase
      .from("registros_diarios_tecnicos")
      .select("id", { count: "exact", head: true })
      .eq("cuadrilla_id", id),
    supabase
      .from("incumplimientos")
      .select("id", { count: "exact", head: true })
      .eq("cuadrilla_id", id),
    supabase
      .from("movimientos_equipos")
      .select("id", { count: "exact", head: true })
      .eq("cuadrilla_id", id),
    supabase
      .from("metricas_cuadrilla_diaria")
      .select("id", { count: "exact", head: true })
      .eq("cuadrilla_id", id),
    supabase
      .from("tecnicos")
      .select("id", { count: "exact", head: true })
      .eq("cuadrilla_actual_id", id),
  ]);

  const historial =
    (registros.count ?? 0) +
    (faltas.count ?? 0) +
    (equipos.count ?? 0) +
    (metricas.count ?? 0) +
    (tecnicos.count ?? 0);
  if (historial > 0) {
    return {
      ok: false,
      error: `No se puede eliminar: la cuadrilla tiene ${historial} registro(s) o técnico(s) asociado(s). Desactívala en su lugar.`,
    };
  }

  const { error } = await supabase.from("cuadrillas").delete().eq("id", id);
  if (error) return { ok: false, error: errorAmigable(error.message) };
  revalidar();
  return { ok: true };
}

export async function cerrarSesion() {
  if (supabaseConfigurado) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
