import { Building2, ShieldCheck, TrendingUp, Truck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { FiltersBar } from "@/components/filters-bar";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { ExportCsvButton } from "@/components/export-csv-button";
import { ExportPdfButton } from "@/components/export-pdf-button";
import { ComparativoChart } from "@/components/charts/comparativo-chart";
import { CuadrillasBarChart } from "@/components/charts/cuadrillas-bar-chart";
import { TrendChart } from "@/components/charts/trend-chart";
import { getCuadrillas, getIncumplimientos, getMetricas, getRegistrosDiarios } from "@/lib/queries";
import { comparativoCuadrillas, evolucionMensual } from "@/lib/analytics";
import {
  finMes,
  formatFecha,
  getParam,
  inicioMes,
  mesActual,
  mesLabel,
  numero,
  porcentaje,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function InformeCuadrillasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const mes = mesActual();
  const desde = getParam(params, "desde") ?? inicioMes(mes);
  const hasta = getParam(params, "hasta") ?? finMes(mes);
  const cuadrillaParam = getParam(params, "cuadrilla");

  const [cuadrillas, metricas, registros, incumplimientos] = await Promise.all([
    getCuadrillas(),
    getMetricas({ desde, hasta }),
    getRegistrosDiarios({ desde, hasta }),
    getIncumplimientos({ desde, hasta }),
  ]);

  const seleccionada = cuadrillas.find((c) => c.id === cuadrillaParam);
  const comparativo = comparativoCuadrillas(cuadrillas, metricas, registros, incumplimientos);
  const filas = seleccionada
    ? comparativo.filter((f) => f.cuadrillaId === seleccionada.id)
    : comparativo;

  const periodo =
    desde === inicioMes(desde.slice(0, 7)) && hasta === finMes(desde.slice(0, 7))
      ? mesLabel(desde.slice(0, 7))
      : `${formatFecha(desde)} — ${formatFecha(hasta)}`;

  const promedioCumplimiento =
    filas.reduce((a, f) => a + f.cumplimiento, 0) / Math.max(1, filas.length);
  const totalReclamos = filas.reduce((a, f) => a + f.reclamos, 0);
  const totalDesperdicio = filas.reduce((a, f) => a + f.desperdicio, 0);
  const mejor = [...filas].sort((a, b) => b.score - a.score)[0];

  const tabla = filas.map((f) => ({
    id: f.cuadrillaId,
    cuadrilla: f.cuadrilla,
    productividad: f.productividad,
    calidad: f.tasaReclamos,
    cumplimiento: f.cumplimiento,
    rendimiento: `${f.ordenesFinalizadas}/${f.ordenesAsignadas}`,
    utilizados: f.materialesUtilizados,
    recuperados: f.materialesRecuperados,
    desperdicio: f.desperdicio,
    recupero: f.recupero,
    reincidencia: f.reincidenciaFallas,
    vehiculo: f.estadoVehiculo,
    seguridad: f.seguridad,
    incumplimientos: f.incumplimientos,
    score: f.score,
  }));

  const chartData = filas.map((f) => ({
    cuadrilla: f.cuadrilla.replace("Cuadrilla ", ""),
    cumplimiento: Number(f.cumplimiento.toFixed(1)),
    tasaReclamos: Number(f.tasaReclamos.toFixed(1)),
    recupero: Number(f.recupero.toFixed(1)),
  }));

  const barData = filas.map((f) => ({
    cuadrilla: f.cuadrilla.replace("Cuadrilla ", ""),
    finalizadas: f.ordenesFinalizadas,
    pendientes: Math.max(0, f.ordenesAsignadas - f.ordenesFinalizadas),
    asignadas: f.ordenesAsignadas,
  }));

  const registrosCuadrilla = seleccionada
    ? registros.filter((r) => r.cuadrilla_id === seleccionada.id)
    : [];
  const incumplimientosCuadrilla = seleccionada
    ? incumplimientos.filter((i) => i.cuadrilla_id === seleccionada.id)
    : [];

  type FilaTecnico = {
    id: string;
    tecnico: string;
    legajo: string;
    dias: number;
    instalaciones: number;
    reparaciones: number;
    productividad: number;
    evaluacion: number;
    incumplimientos: number;
  };

  const mapaTecnicos = new Map<string, {
    nombre: string;
    legajo: string;
    dias: number;
    instalaciones: number;
    reparaciones: number;
    sumaEvaluacion: number;
    incumplimientos: number;
  }>();

  for (const r of registrosCuadrilla) {
    const actual = mapaTecnicos.get(r.tecnico_id) ?? {
      nombre: r.tecnico?.nombre_completo ?? "—",
      legajo: r.tecnico?.legajo ?? "—",
      dias: 0,
      instalaciones: 0,
      reparaciones: 0,
      sumaEvaluacion: 0,
      incumplimientos: 0,
    };
    actual.dias += 1;
    actual.instalaciones += r.instalaciones_realizadas;
    actual.reparaciones += r.reparaciones_realizadas;
    actual.sumaEvaluacion +=
      (r.puntualidad +
        r.uniforme +
        r.responsabilidad +
        r.cumplimiento_tareas +
        r.companerismo +
        r.comunicacion_supervision) /
      6;
    mapaTecnicos.set(r.tecnico_id, actual);
  }

  for (const falta of incumplimientosCuadrilla) {
    const actual = mapaTecnicos.get(falta.tecnico_id) ?? {
      nombre: falta.tecnico?.nombre_completo ?? "—",
      legajo: falta.tecnico?.legajo ?? "—",
      dias: 0,
      instalaciones: 0,
      reparaciones: 0,
      sumaEvaluacion: 0,
      incumplimientos: 0,
    };
    actual.incumplimientos += 1;
    mapaTecnicos.set(falta.tecnico_id, actual);
  }

  const filasTecnicos: FilaTecnico[] = Array.from(mapaTecnicos.entries())
    .map(([id, t]) => ({
      id,
      tecnico: t.nombre,
      legajo: t.legajo,
      dias: t.dias,
      instalaciones: t.instalaciones,
      reparaciones: t.reparaciones,
      productividad: t.instalaciones + t.reparaciones,
      evaluacion: t.dias > 0 ? t.sumaEvaluacion / t.dias : 0,
      incumplimientos: t.incumplimientos,
    }))
    .sort((a, b) => b.productividad - a.productividad);

  const filasIncumplimientos = incumplimientosCuadrilla.map((i) => ({
    id: i.id,
    fecha: i.fecha,
    tipo: i.tipo_incumplimiento,
    tecnico: i.tecnico?.nombre_completo ?? "—",
    gravedad: i.gravedad,
    descripcion: i.descripcion ?? "—",
  }));

  const evolucion = seleccionada
    ? evolucionMensual(registrosCuadrilla, incumplimientosCuadrilla)
    : [];

  return (
    <>
      <PageHeader
        title={seleccionada ? `Informe de cuadrilla · ${seleccionada.nombre}` : "Informes por cuadrilla"}
        description="Comparativo en 8 ejes: productividad, calidad, cumplimiento, rendimiento, materiales, reincidencia, vehículo y seguridad."
        actions={
          <>
            <ExportCsvButton
              filename={seleccionada ? `cuadrilla-${seleccionada.nombre}` : "cuadrillas-comparativo"}
              rows={filas.map((f) => ({ ...f }))}
              columns={[
                { key: "cuadrilla", label: "Cuadrilla" },
                { key: "productividad", label: "Productividad" },
                { key: "instalaciones", label: "Instalaciones" },
                { key: "reparaciones", label: "Reparaciones" },
                { key: "ordenesAsignadas", label: "Órdenes asignadas" },
                { key: "ordenesFinalizadas", label: "Órdenes finalizadas" },
                { key: "cumplimiento", label: "Cumplimiento (%)" },
                { key: "reclamos", label: "Reclamos" },
                { key: "tasaReclamos", label: "Tasa reclamos (%)" },
                { key: "materialesUtilizados", label: "Materiales utilizados" },
                { key: "materialesRecuperados", label: "Materiales recuperados" },
                { key: "desperdicio", label: "Desperdicio" },
                { key: "recupero", label: "Recupero (%)" },
                { key: "reincidenciaFallas", label: "Reincidencia" },
                { key: "seguridad", label: "Eventos de seguridad" },
                { key: "incumplimientos", label: "Incumplimientos" },
                { key: "score", label: "Score" },
                { key: "estadoVehiculo", label: "Estado vehículo" },
              ]}
            />
            <ExportPdfButton
              tipo="cuadrillas"
              filas={filas}
              periodo={periodo}
              cuadrillaFiltrada={seleccionada?.nombre}
              label={seleccionada ? "Exportar informe de cuadrilla" : "Exportar informe comparativo"}
            />
          </>
        }
      />

      <FiltersBar
        cuadrillas={cuadrillas}
        desde={desde}
        hasta={hasta}
        cuadrillaId={seleccionada?.id}
        mostrarTecnico={false}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Mejor score"
          value={mejor ? `${mejor.score}/100` : "—"}
          hint={mejor?.cuadrilla ?? "Sin datos"}
          icon={TrendingUp}
          accent="primary"
        />
        <KpiCard
          label="Cumplimiento promedio"
          value={porcentaje(promedioCumplimiento)}
          hint="Órdenes finalizadas / asignadas"
          icon={Building2}
          accent="success"
        />
        <KpiCard
          label="Reclamos posteriores"
          value={numero(totalReclamos)}
          hint="Acumulado del período"
          icon={ShieldCheck}
          accent="destructive"
        />
        <KpiCard
          label="Desperdicio de materiales"
          value={numero(totalDesperdicio)}
          hint="Utilizados no recuperados"
          icon={Truck}
          accent="warning"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Comparativo de indicadores</CardTitle>
            <CardDescription>
              Cumplimiento de órdenes, tasa de reclamos y recupero de materiales (%).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ComparativoChart data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Órdenes finalizadas vs. pendientes</CardTitle>
            <CardDescription>Volumen operativo por cuadrilla en el período.</CardDescription>
          </CardHeader>
          <CardContent>
            <CuadrillasBarChart data={barData} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>Tabla comparativa · 8 ejes de evaluación</CardTitle>
            <CardDescription>
              Ordena cualquier columna para comparar el desempeño entre cuadrillas.
            </CardDescription>
          </div>
          <Badge variant="secondary">{filas.length} cuadrillas</Badge>
        </CardHeader>
        <CardContent>
          <DataTable
            initialSort={{ key: "score", dir: "desc" }}
            columns={[
              { key: "cuadrilla", label: "Cuadrilla" },
              { key: "productividad", label: "Productividad", kind: "number", align: "right" },
              { key: "calidad", label: "Calidad (reclamos)", kind: "percent", align: "right" },
              { key: "cumplimiento", label: "Cumpl. órdenes", kind: "percent", align: "right" },
              { key: "rendimiento", label: "Rendimiento", align: "right" },
              { key: "utilizados", label: "Mat. utilizados", kind: "number", align: "right" },
              { key: "recuperados", label: "Mat. recuperados", kind: "number", align: "right" },
              { key: "desperdicio", label: "Desperdicio", kind: "number", align: "right" },
              { key: "recupero", label: "Recupero", kind: "percent", align: "right" },
              { key: "reincidencia", label: "Reincidencia", kind: "number", align: "right" },
              { key: "vehiculo", label: "Vehículo", kind: "badge", align: "center" },
              { key: "seguridad", label: "Seguridad", kind: "number", align: "right" },
              { key: "incumplimientos", label: "Incump.", kind: "number", align: "right" },
              { key: "score", label: "Score", kind: "number", align: "right" },
            ]}
            rows={tabla}
          />
        </CardContent>
      </Card>

      {seleccionada ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Evolución de {seleccionada.nombre}</CardTitle>
              <CardDescription>
                Instalaciones, reparaciones e incumplimientos por mes dentro del período consultado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {evolucion.length ? (
                <TrendChart data={evolucion} />
              ) : (
                <p className="py-16 text-center text-xs text-muted-foreground">
                  Sin registros en el período.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Desempeño de los técnicos de la cuadrilla</CardTitle>
              <CardDescription>
                Productividad y evaluación promedio según los partes diarios del período.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                initialSort={{ key: "productividad", dir: "desc" }}
                columns={[
                  { key: "tecnico", label: "Técnico" },
                  { key: "legajo", label: "Legajo" },
                  { key: "dias", label: "Días", kind: "number", align: "right" },
                  { key: "instalaciones", label: "Instalaciones", kind: "number", align: "right" },
                  { key: "reparaciones", label: "Reparaciones", kind: "number", align: "right" },
                  { key: "productividad", label: "Productividad", kind: "number", align: "right" },
                  { key: "evaluacion", label: "Evaluación /5", align: "right" },
                  { key: "incumplimientos", label: "Incump.", kind: "number", align: "right" },
                ]}
                rows={filasTecnicos.map((t) => ({
                  ...t,
                  evaluacion: t.dias > 0 ? t.evaluacion.toFixed(2) : "—",
                }))}
                emptyMessage="Sin partes diarios para esta cuadrilla en el período."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Incumplimientos de la cuadrilla</CardTitle>
              <CardDescription>
                Eventos del período con el técnico que los originó.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                initialSort={{ key: "fecha", dir: "desc" }}
                columns={[
                  { key: "fecha", label: "Fecha", kind: "date", width: "105px" },
                  { key: "tipo", label: "Tipo" },
                  { key: "tecnico", label: "Técnico" },
                  { key: "gravedad", label: "Gravedad", kind: "badge", align: "center" },
                  { key: "descripcion", label: "Descripción" },
                ]}
                rows={filasIncumplimientos}
                emptyMessage="Sin incumplimientos en el período."
              />
            </CardContent>
          </Card>
        </>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Lectura de los 8 ejes</CardTitle>
          <CardDescription>Criterios utilizados para el score final de cada cuadrilla.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-xs text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
          <p><span className="font-medium text-foreground">Productividad:</span> instalaciones y reparaciones del período.</p>
          <p><span className="font-medium text-foreground">Calidad:</span> tasa de reclamos sobre órdenes finalizadas.</p>
          <p><span className="font-medium text-foreground">Cumplimiento:</span> órdenes finalizadas sobre asignadas.</p>
          <p><span className="font-medium text-foreground">Rendimiento operativo:</span> relación finalizadas/asignadas del período.</p>
          <p><span className="font-medium text-foreground">Materiales:</span> utilizados vs. recuperados y desperdicio.</p>
          <p><span className="font-medium text-foreground">Reincidencia:</span> eventos repetidos del mismo tipo por un técnico (más allá del primero).</p>
          <p><span className="font-medium text-foreground">Vehículo:</span> estado operativo reportado por la cuadrilla.</p>
          <p><span className="font-medium text-foreground">Seguridad:</span> eventos de uniforme, escaleras y portones.</p>
        </CardContent>
      </Card>
    </>
  );
}
