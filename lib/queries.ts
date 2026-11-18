import { supabaseConfigurado } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import {
  demoCuadrillas,
  demoEquipos,
  demoIncumplimientos,
  demoMetricas,
  demoRegistros,
  demoTecnicos,
} from "@/lib/demo";
import type {
  Auditoria,
  Cuadrilla,
  Incumplimiento,
  IncumplimientoDetalle,
  MetricaCuadrilla,
  MetricaCuadrillaDetalle,
  MovimientoEquipo,
  MovimientoEquipoDetalle,
  Perfil,
  RegistroDiario,
  RegistroDiarioDetalle,
  Tecnico,
} from "@/lib/types";

function lanzarErrorConsulta(mensaje: string): never {
  if (mensaje.includes("permission denied")) {
    throw new Error(
      "Permiso denegado en Supabase. Ejecuta supabase/fix-permisos.sql en el SQL Editor y verifica que la sesión del administrador esté activa.",
    );
  }
  if (mensaje.includes("does not exist")) {
    throw new Error(
      "El esquema de base de datos no está creado. Ejecuta supabase/schema.sql en el SQL Editor de Supabase.",
    );
  }
  throw new Error(mensaje);
}

function conRelacionesRegistro(registro: RegistroDiario): RegistroDiarioDetalle {
  const tecnico = demoTecnicos.find((t) => t.id === registro.tecnico_id);
  const cuadrilla = demoCuadrillas.find((c) => c.id === registro.cuadrilla_id);
  return {
    ...registro,
    tecnico: tecnico
      ? { id: tecnico.id, nombre_completo: tecnico.nombre_completo, legajo: tecnico.legajo }
      : null,
    cuadrilla: cuadrilla ? { id: cuadrilla.id, nombre: cuadrilla.nombre } : null,
  };
}

export async function getCuadrillas(): Promise<Cuadrilla[]> {
  if (!supabaseConfigurado) return demoCuadrillas;
  const supabase = await createClient();
  const { data, error } = await supabase.from("cuadrillas").select("*").order("nombre");
  if (error) lanzarErrorConsulta(error.message);
  return (data ?? []) as Cuadrilla[];
}

export async function getTecnicos(): Promise<Tecnico[]> {
  if (!supabaseConfigurado) return demoTecnicos;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tecnicos")
    .select("*")
    .order("nombre_completo");
  if (error) lanzarErrorConsulta(error.message);
  return (data ?? []) as Tecnico[];
}

export async function getTecnico(id: string): Promise<Tecnico | null> {
  if (!supabaseConfigurado) return demoTecnicos.find((t) => t.id === id) ?? null;
  const supabase = await createClient();
  const { data } = await supabase.from("tecnicos").select("*").eq("id", id).maybeSingle();
  return (data as Tecnico | null) ?? null;
}

export async function getCuadrilla(id: string): Promise<Cuadrilla | null> {
  if (!supabaseConfigurado) return demoCuadrillas.find((c) => c.id === id) ?? null;
  const supabase = await createClient();
  const { data } = await supabase.from("cuadrillas").select("*").eq("id", id).maybeSingle();
  return (data as Cuadrilla | null) ?? null;
}

export async function getRegistrosDiarios(rango?: {
  desde?: string;
  hasta?: string;
}): Promise<RegistroDiarioDetalle[]> {
  if (!supabaseConfigurado) {
    return demoRegistros
      .filter((r) => (!rango?.desde || r.fecha >= rango.desde) && (!rango?.hasta || r.fecha <= rango.hasta))
      .map(conRelacionesRegistro)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  const supabase = await createClient();
  let query = supabase
    .from("registros_diarios_tecnicos")
    .select("*, tecnico:tecnicos(id,nombre_completo,legajo), cuadrilla:cuadrillas(id,nombre)")
    .order("fecha", { ascending: false })
    .limit(5000);

  if (rango?.desde) query = query.gte("fecha", rango.desde);
  if (rango?.hasta) query = query.lte("fecha", rango.hasta);

  const { data, error } = await query;
  if (error) lanzarErrorConsulta(error.message);
  return (data ?? []) as unknown as RegistroDiarioDetalle[];
}

export async function getIncumplimientos(rango?: {
  desde?: string;
  hasta?: string;
}): Promise<IncumplimientoDetalle[]> {
  if (!supabaseConfigurado) {
    return demoIncumplimientos
      .filter((i) => (!rango?.desde || i.fecha >= rango.desde) && (!rango?.hasta || i.fecha <= rango.hasta))
      .map((i) => {
        const tecnico = demoTecnicos.find((t) => t.id === i.tecnico_id);
        const cuadrilla = demoCuadrillas.find((c) => c.id === i.cuadrilla_id);
        return {
          ...i,
          tecnico: tecnico
            ? { id: tecnico.id, nombre_completo: tecnico.nombre_completo, legajo: tecnico.legajo }
            : null,
          cuadrilla: cuadrilla ? { id: cuadrilla.id, nombre: cuadrilla.nombre } : null,
        };
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  const supabase = await createClient();
  let query = supabase
    .from("incumplimientos")
    .select("*, tecnico:tecnicos(id,nombre_completo,legajo), cuadrilla:cuadrillas(id,nombre)")
    .order("fecha", { ascending: false })
    .limit(5000);

  if (rango?.desde) query = query.gte("fecha", rango.desde);
  if (rango?.hasta) query = query.lte("fecha", rango.hasta);

  const { data, error } = await query;
  if (error) lanzarErrorConsulta(error.message);
  return (data ?? []) as unknown as IncumplimientoDetalle[];
}

export async function getMetricas(rango?: {
  desde?: string;
  hasta?: string;
}): Promise<MetricaCuadrillaDetalle[]> {
  if (!supabaseConfigurado) {
    return demoMetricas
      .filter((m) => (!rango?.desde || m.fecha >= rango.desde) && (!rango?.hasta || m.fecha <= rango.hasta))
      .map((m) => {
        const cuadrilla = demoCuadrillas.find((c) => c.id === m.cuadrilla_id);
        return {
          ...m,
          cuadrilla: cuadrilla ? { id: cuadrilla.id, nombre: cuadrilla.nombre } : null,
        };
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  const supabase = await createClient();
  let query = supabase
    .from("metricas_cuadrilla_diaria")
    .select("*, cuadrilla:cuadrillas(id,nombre)")
    .order("fecha", { ascending: false })
    .limit(5000);

  if (rango?.desde) query = query.gte("fecha", rango.desde);
  if (rango?.hasta) query = query.lte("fecha", rango.hasta);

  const { data, error } = await query;
  if (error) lanzarErrorConsulta(error.message);
  return (data ?? []) as unknown as MetricaCuadrillaDetalle[];
}

export async function getMovimientos(): Promise<MovimientoEquipoDetalle[]> {
  if (!supabaseConfigurado) {
    return demoEquipos
      .map((m) => {
        const tecnico = demoTecnicos.find((t) => t.id === m.tecnico_id);
        const cuadrilla = demoCuadrillas.find((c) => c.id === m.cuadrilla_id);
        return {
          ...m,
          tecnico: tecnico
            ? { id: tecnico.id, nombre_completo: tecnico.nombre_completo, legajo: tecnico.legajo }
            : null,
          cuadrilla: cuadrilla ? { id: cuadrilla.id, nombre: cuadrilla.nombre } : null,
        };
      })
      .sort((a, b) => b.fecha_recuperacion.localeCompare(a.fecha_recuperacion));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("movimientos_equipos")
    .select("*, tecnico:tecnicos(id,nombre_completo,legajo), cuadrilla:cuadrillas(id,nombre)")
    .order("fecha_recuperacion", { ascending: false })
    .limit(5000);

  if (error) lanzarErrorConsulta(error.message);
  return (data ?? []) as unknown as MovimientoEquipoDetalle[];
}

export async function getRegistroDiarioPorId(id: string): Promise<RegistroDiario | null> {
  if (!supabaseConfigurado) return demoRegistros.find((r) => r.id === id) ?? null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("registros_diarios_tecnicos")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as RegistroDiario | null) ?? null;
}

export async function getIncumplimientoPorId(id: string): Promise<Incumplimiento | null> {
  if (!supabaseConfigurado) return demoIncumplimientos.find((i) => i.id === id) ?? null;
  const supabase = await createClient();
  const { data } = await supabase.from("incumplimientos").select("*").eq("id", id).maybeSingle();
  return (data as Incumplimiento | null) ?? null;
}

export async function getMetricaPorId(id: string): Promise<MetricaCuadrilla | null> {
  if (!supabaseConfigurado) return demoMetricas.find((m) => m.id === id) ?? null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("metricas_cuadrilla_diaria")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as MetricaCuadrilla | null) ?? null;
}

export async function getEquipoPorId(id: string): Promise<MovimientoEquipo | null> {
  if (!supabaseConfigurado) return demoEquipos.find((e) => e.id === id) ?? null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("movimientos_equipos")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as MovimientoEquipo | null) ?? null;
}

export async function getAuditoria(limite = 150): Promise<Auditoria[]> {
  if (!supabaseConfigurado) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("auditoria")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limite);
  if (error) return [];
  return (data ?? []) as Auditoria[];
}

export async function getPerfilActual(): Promise<Perfil | null> {
  if (!supabaseConfigurado) {
    return {
      id: "demo",
      email: "demo@cuadrillas.local",
      nombre: "Administrador de demostración",
      rol: "Administrador",
      activo: true,
      created_at: new Date().toISOString(),
    };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("perfiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (data) return data as Perfil;

  return {
    id: user.id,
    email: user.email ?? "",
    nombre: user.email ?? "Administrador",
    rol: "Administrador",
    activo: true,
    created_at: user.created_at ?? new Date().toISOString(),
  };
}

export async function getPerfiles(): Promise<Perfil[]> {
  if (!supabaseConfigurado) {
    return [
      {
        id: "demo",
        email: "demo@cuadrillas.local",
        nombre: "Administrador de demostración",
        rol: "Administrador",
        activo: true,
        created_at: new Date().toISOString(),
      },
    ];
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("perfiles")
    .select("*")
    .order("rol")
    .order("email");
  if (error) lanzarErrorConsulta(error.message);
  return (data ?? []) as Perfil[];
}
