import type {
  Cuadrilla,
  EvaluacionPromedio,
  IncumplimientoDetalle,
  MetricaCuadrillaDetalle,
  MovimientoEquipoDetalle,
  RegistroDiarioDetalle,
  Tecnico,
} from "@/lib/types";
import { clamp, fechaHaceDias, mesLabel, nombreMes, promedio } from "@/lib/utils";

export type KpisDashboard = {
  instalaciones: number;
  reparaciones: number;
  pctFinalizadas: number;
  incumplimientos: number;
  equiposRecuperados: number;
  ordenesAsignadas: number;
  ordenesFinalizadas: number;
  reclamos: number;
};

export function calcularKpis(
  registros: RegistroDiarioDetalle[],
  incumplimientos: IncumplimientoDetalle[],
  metricas: MetricaCuadrillaDetalle[],
  movimientos: MovimientoEquipoDetalle[],
): KpisDashboard {
  const asignadas = metricas.reduce((acc, m) => acc + m.ordenes_asignadas, 0);
  const finalizadas = metricas.reduce((acc, m) => acc + m.ordenes_finalizadas, 0);
  const reclamos = metricas.reduce((acc, m) => acc + m.trabajos_con_reclamos, 0);

  return {
    instalaciones: registros.reduce((acc, r) => acc + r.instalaciones_realizadas, 0),
    reparaciones: registros.reduce((acc, r) => acc + r.reparaciones_realizadas, 0),
    pctFinalizadas: asignadas > 0 ? (finalizadas / asignadas) * 100 : 0,
    incumplimientos: incumplimientos.length,
    equiposRecuperados: movimientos.length,
    ordenesAsignadas: asignadas,
    ordenesFinalizadas: finalizadas,
    reclamos,
  };
}

export type PuntoTendencia = {
  mes: string;
  instalaciones: number;
  reparaciones: number;
  incumplimientos: number;
  equipos: number;
};

export function tendenciaMensual(
  registros: RegistroDiarioDetalle[],
  incumplimientos: IncumplimientoDetalle[],
  movimientos: MovimientoEquipoDetalle[],
  meses = 6,
  mesFinal?: string,
): PuntoTendencia[] {
  const buckets = new Map<string, PuntoTendencia>();
  const ahora = mesFinal ? new Date(`${mesFinal}-01T12:00:00`) : new Date();

  for (let i = meses - 1; i >= 0; i--) {
    const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, {
      mes: nombreMes(`${key}-01`),
      instalaciones: 0,
      reparaciones: 0,
      incumplimientos: 0,
      equipos: 0,
    });
  }

  for (const r of registros) {
    const bucket = buckets.get(r.fecha.slice(0, 7));
    if (!bucket) continue;
    bucket.instalaciones += r.instalaciones_realizadas;
    bucket.reparaciones += r.reparaciones_realizadas;
  }

  for (const i of incumplimientos) {
    const bucket = buckets.get(i.fecha.slice(0, 7));
    if (bucket) bucket.incumplimientos += 1;
  }

  for (const m of movimientos) {
    const bucket = buckets.get(m.fecha_recuperacion.slice(0, 7));
    if (bucket) bucket.equipos += 1;
  }

  return Array.from(buckets.values());
}

export function evolucionMensual(
  registros: RegistroDiarioDetalle[],
  incumplimientos: IncumplimientoDetalle[],
): PuntoTendencia[] {
  const presentes = new Set<string>();
  for (const r of registros) presentes.add(r.fecha.slice(0, 7));
  for (const i of incumplimientos) presentes.add(i.fecha.slice(0, 7));
  if (!presentes.size) return [];

  const ordenados = Array.from(presentes).sort();
  const [anioInicio, mesInicio] = ordenados[0].split("-").map(Number);
  const [anioFin, mesFin] = ordenados[ordenados.length - 1].split("-").map(Number);

  const puntos: PuntoTendencia[] = [];
  const cursor = new Date(anioInicio, mesInicio - 1, 1);
  const fin = new Date(anioFin, mesFin - 1, 1);

  while (cursor <= fin) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    puntos.push({
      mes: nombreMes(`${key}-01`),
      instalaciones: 0,
      reparaciones: 0,
      incumplimientos: 0,
      equipos: 0,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  const indice = new Map(puntos.map((p, index) => [index, p]));
  for (const r of registros) {
    const [a, m] = r.fecha.slice(0, 7).split("-").map(Number);
    const pos = (a - anioInicio) * 12 + (m - mesInicio);
    const punto = indice.get(pos);
    if (!punto) continue;
    punto.instalaciones += r.instalaciones_realizadas;
    punto.reparaciones += r.reparaciones_realizadas;
  }

  for (const i of incumplimientos) {
    const [a, m] = i.fecha.slice(0, 7).split("-").map(Number);
    const pos = (a - anioInicio) * 12 + (m - mesInicio);
    const punto = indice.get(pos);
    if (punto) punto.incumplimientos += 1;
  }

  return puntos;
}

export type ComparativoCuadrillaFila = {
  cuadrillaId: string;
  cuadrilla: string;
  estadoVehiculo: string;
  productividad: number;
  instalaciones: number;
  reparaciones: number;
  ordenesAsignadas: number;
  ordenesFinalizadas: number;
  cumplimiento: number;
  reclamos: number;
  tasaReclamos: number;
  materialesUtilizados: number;
  materialesRecuperados: number;
  desperdicio: number;
  recupero: number;
  reincidenciaFallas: number;
  seguridad: number;
  incumplimientos: number;
  score: number;
};

function calcularReincidencia(incumplimientos: IncumplimientoDetalle[]): number {
  const conteo = new Map<string, number>();
  for (const falta of incumplimientos) {
    const key = `${falta.tecnico_id}|${falta.tipo_incumplimiento}`;
    conteo.set(key, (conteo.get(key) ?? 0) + 1);
  }
  let reincidencias = 0;
  for (const total of conteo.values()) {
    if (total > 1) reincidencias += total - 1;
  }
  return reincidencias;
}

export function comparativoCuadrillas(
  cuadrillas: Cuadrilla[],
  metricas: MetricaCuadrillaDetalle[],
  registros: RegistroDiarioDetalle[],
  incumplimientos: IncumplimientoDetalle[],
): ComparativoCuadrillaFila[] {
  const filas = cuadrillas.map((cuadrilla) => {
    const m = metricas.filter((x) => x.cuadrilla_id === cuadrilla.id);
    const r = registros.filter((x) => x.cuadrilla_id === cuadrilla.id);
    const i = incumplimientos.filter((x) => x.cuadrilla_id === cuadrilla.id);

    const asignadas = m.reduce((acc, x) => acc + x.ordenes_asignadas, 0);
    const finalizadas = m.reduce((acc, x) => acc + x.ordenes_finalizadas, 0);
    const reclamos = m.reduce((acc, x) => acc + x.trabajos_con_reclamos, 0);
    const utilizados = m.reduce((acc, x) => acc + x.materiales_utilizados, 0);
    const recuperados = m.reduce((acc, x) => acc + x.materiales_recuperados, 0);
    const instalaciones = r.reduce((acc, x) => acc + x.instalaciones_realizadas, 0);
    const reparaciones = r.reduce((acc, x) => acc + x.reparaciones_realizadas, 0);
    const seguridad = i.filter((x) =>
      [
        "Falta de uniforme",
        "Falta de candado de seguridad en escaleras",
        "Portones abiertos",
      ].includes(x.tipo_incumplimiento),
    ).length;
    const reincidenciaFallas = calcularReincidencia(i);

    const cumplimiento = asignadas > 0 ? (finalizadas / asignadas) * 100 : 0;
    const tasaReclamos = finalizadas > 0 ? (reclamos / finalizadas) * 100 : 0;
    const recupero = utilizados > 0 ? (recuperados / utilizados) * 100 : 0;

    const scoreCalidad = clamp(100 - tasaReclamos * 8);
    const scoreDisciplina = clamp(100 - i.length * 6);
    const scoreSeguridad = clamp(100 - seguridad * 14);

    return {
      cuadrillaId: cuadrilla.id,
      cuadrilla: cuadrilla.nombre,
      estadoVehiculo: cuadrilla.estado_vehiculo,
      productividad: instalaciones + reparaciones,
      instalaciones,
      reparaciones,
      ordenesAsignadas: asignadas,
      ordenesFinalizadas: finalizadas,
      cumplimiento,
      reclamos,
      tasaReclamos,
      materialesUtilizados: utilizados,
      materialesRecuperados: recuperados,
      desperdicio: Math.max(0, utilizados - recuperados),
      recupero,
      reincidenciaFallas,
      seguridad,
      incumplimientos: i.length,
      score: Math.round((cumplimiento + scoreCalidad + scoreDisciplina + scoreSeguridad) / 4),
    };
  });

  const maxProductividad = Math.max(1, ...filas.map((f) => f.productividad));

  return filas
    .map((f) => ({
      ...f,
      score: Math.round(
        (f.score +
          clamp((f.productividad / maxProductividad) * 100) +
          clamp(f.recupero)) /
          3,
      ),
    }))
    .sort((a, b) => b.productividad - a.productividad);
}

export type FichaTecnica = {
  tecnico: Tecnico;
  diasTrabajados: number;
  instalaciones: number;
  reparaciones: number;
  bajas: number;
  cambiosDomicilio: number;
  pendientes: number;
  tareasFinalizadas: number;
  pctTareasFinalizadas: number;
  evaluacion: EvaluacionPromedio;
  puntajeActitud: number;
  incumplimientos: IncumplimientoDetalle[];
  porGravedad: Record<string, number>;
  radar: { eje: string; valor: number }[];
  serie: { fecha: string; instalaciones: number; reparaciones: number; evaluacion: number }[];
};

export function calcularFichaTecnica(
  tecnico: Tecnico,
  registros: RegistroDiarioDetalle[],
  incumplimientos: IncumplimientoDetalle[],
): FichaTecnica {
  const propios = registros.filter((r) => r.tecnico_id === tecnico.id);
  const faltas = incumplimientos.filter((i) => i.tecnico_id === tecnico.id);

  const instalaciones = propios.reduce((a, r) => a + r.instalaciones_realizadas, 0);
  const reparaciones = propios.reduce((a, r) => a + r.reparaciones_realizadas, 0);
  const bajas = propios.reduce((a, r) => a + r.bajas_efectuadas, 0);
  const cambiosDomicilio = propios.reduce((a, r) => a + r.cambios_domicilio, 0);
  const pendientes = propios.reduce((a, r) => a + r.trabajos_pendientes, 0);
  const tareasFinalizadas = instalaciones + reparaciones + bajas + cambiosDomicilio;

  const evaluacion: EvaluacionPromedio = {
    puntualidad: promedio(propios.map((r) => r.puntualidad)),
    uniforme: promedio(propios.map((r) => r.uniforme)),
    responsabilidad: promedio(propios.map((r) => r.responsabilidad)),
    cumplimiento_tareas: promedio(propios.map((r) => r.cumplimiento_tareas)),
    companerismo: promedio(propios.map((r) => r.companerismo)),
    comunicacion_supervision: promedio(propios.map((r) => r.comunicacion_supervision)),
  };

  const valores = Object.values(evaluacion);
  const radar = [
    { eje: "Puntualidad", valor: evaluacion.puntualidad },
    { eje: "Uniforme", valor: evaluacion.uniforme },
    { eje: "Responsabilidad", valor: evaluacion.responsabilidad },
    { eje: "Cumplimiento", valor: evaluacion.cumplimiento_tareas },
    { eje: "Compañerismo", valor: evaluacion.companerismo },
    { eje: "Comunicación", valor: evaluacion.comunicacion_supervision },
  ];

  const porGravedad: Record<string, number> = { Leve: 0, Moderada: 0, Grave: 0 };
  for (const falta of faltas) porGravedad[falta.gravedad] += 1;

  const serie = [...propios]
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(-20)
    .map((r) => ({
      fecha: r.fecha.slice(5),
      instalaciones: r.instalaciones_realizadas,
      reparaciones: r.reparaciones_realizadas,
      evaluacion: Number(
        (
          (r.puntualidad +
            r.uniforme +
            r.responsabilidad +
            r.cumplimiento_tareas +
            r.companerismo +
            r.comunicacion_supervision) /
          6
        ).toFixed(2),
      ),
    }));

  return {
    tecnico,
    diasTrabajados: propios.length,
    instalaciones,
    reparaciones,
    bajas,
    cambiosDomicilio,
    pendientes,
    tareasFinalizadas,
    pctTareasFinalizadas:
      tareasFinalizadas + pendientes > 0
        ? (tareasFinalizadas / (tareasFinalizadas + pendientes)) * 100
        : 0,
    evaluacion,
    puntajeActitud: promedio(valores),
    incumplimientos: faltas.sort((a, b) => b.fecha.localeCompare(a.fecha)),
    porGravedad,
    radar,
    serie,
  };
}

export type AlertaOperativa = {
  id: string;
  nivel: "danger" | "warning" | "info";
  titulo: string;
  detalle: string;
  href?: string;
};

export function generarAlertas({
  cuadrillas,
  tecnicos,
  registros,
  incumplimientos,
  metricas,
  movimientos,
  dias = 30,
}: {
  cuadrillas: Cuadrilla[];
  tecnicos: Tecnico[];
  registros: RegistroDiarioDetalle[];
  incumplimientos: IncumplimientoDetalle[];
  metricas: MetricaCuadrillaDetalle[];
  movimientos: MovimientoEquipoDetalle[];
  dias?: number;
}): AlertaOperativa[] {
  const desde = fechaHaceDias(dias);
  const alertas: AlertaOperativa[] = [];

  const graves = incumplimientos.filter((i) => i.fecha >= desde && i.gravedad === "Grave");
  if (graves.length) {
    alertas.push({
      id: "graves",
      nivel: "danger",
      titulo: `${graves.length} incumplimiento(s) grave(s)`,
      detalle: `Registrados en los últimos ${dias} días. Revisa el detalle para tomar acciones.`,
      href: "/incumplimientos?gravedad=Grave",
    });
  }

  const porTecnicoTipo = new Map<string, { tecnico: string; tipo: string; total: number }>();
  for (const falta of incumplimientos.filter((i) => i.fecha >= desde)) {
    const key = `${falta.tecnico_id}|${falta.tipo_incumplimiento}`;
    const actual = porTecnicoTipo.get(key) ?? {
      tecnico: falta.tecnico?.nombre_completo ?? "Técnico",
      tipo: falta.tipo_incumplimiento,
      total: 0,
    };
    actual.total += 1;
    porTecnicoTipo.set(key, actual);
  }
  const reincidentes = Array.from(porTecnicoTipo.values())
    .filter((x) => x.total > 1)
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);
  if (reincidentes.length) {
    alertas.push({
      id: "reincidencia",
      nivel: "warning",
      titulo: `${reincidentes.length} caso(s) de reincidencia`,
      detalle: reincidentes.map((x) => `${x.tecnico}: ${x.tipo} (${x.total})`).join(" · "),
      href: "/informes/tecnicos",
    });
  }

  const vehiculos = cuadrillas.filter((c) => c.activa && c.estado_vehiculo !== "Operativo");
  if (vehiculos.length) {
    alertas.push({
      id: "vehiculos",
      nivel: "warning",
      titulo: `${vehiculos.length} cuadrilla(s) con vehículo fuera de servicio`,
      detalle: vehiculos.map((c) => `${c.nombre}: ${c.estado_vehiculo}`).join(" · "),
      href: "/cuadrillas",
    });
  }

  const pendientes = metricas.reduce((acc, m) => acc + m.ordenes_pendientes, 0);
  if (pendientes > 15) {
    alertas.push({
      id: "pendientes",
      nivel: "warning",
      titulo: `${pendientes} órdenes pendientes acumuladas`,
      detalle: "El volumen de trabajo sin cerrar puede afectar la promesa de servicio.",
      href: "/operativo",
    });
  }

  const sinParte = tecnicos.filter(
    (t) => t.activo && !registros.some((r) => r.tecnico_id === t.id && r.fecha >= fechaHaceDias(7)),
  );
  if (sinParte.length) {
    alertas.push({
      id: "sin-parte",
      nivel: "info",
      titulo: `${sinParte.length} técnico(s) activo(s) sin parte en 7 días`,
      detalle: sinParte
        .slice(0, 4)
        .map((t) => t.nombre_completo)
        .join(", "),
      href: "/tecnicos",
    });
  }

  const danados = movimientos.filter(
    (m) => m.fecha_recuperacion >= desde && m.estado_recepcion === "Dañado",
  );
  if (danados.length) {
    alertas.push({
      id: "equipos-danados",
      nivel: "info",
      titulo: `${danados.length} equipo(s) dañado(s) recuperado(s)`,
      detalle: "Verifica el destino en el manifiesto de equipos.",
      href: "/informes/equipos?estado=Dañado",
    });
  }

  const orden: Record<AlertaOperativa["nivel"], number> = { danger: 0, warning: 1, info: 2 };
  return alertas.sort((a, b) => orden[a.nivel] - orden[b.nivel]);
}

export function etiquetaPeriodo(desde: string, hasta: string) {  const d = new Date(`${desde}T12:00:00`);
  const h = new Date(`${hasta}T12:00:00`);
  if (
    d.getMonth() === h.getMonth() &&
    d.getFullYear() === h.getFullYear() &&
    d.getDate() === 1 &&
    new Date(h.getFullYear(), h.getMonth() + 1, 0).getDate() === h.getDate()
  ) {
    return mesLabel(desde.slice(0, 7));
  }
  return `${desde} · ${hasta}`;
}
