import { FileText, UserRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { FiltersBar } from "@/components/filters-bar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { ExportCsvButton } from "@/components/export-csv-button";
import { ExportPdfButton } from "@/components/export-pdf-button";
import { RadarEvaluacion } from "@/components/charts/radar-evaluacion";
import { TecnicoSerieChart } from "@/components/charts/tecnico-serie-chart";
import { getCuadrillas, getIncumplimientos, getRegistrosDiarios, getTecnicos } from "@/lib/queries";
import { calcularFichaTecnica } from "@/lib/analytics";
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

export default async function InformeTecnicosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const mes = mesActual();
  const desde = getParam(params, "desde") ?? inicioMes(mes);
  const hasta = getParam(params, "hasta") ?? finMes(mes);
  const tecnicoParam = getParam(params, "tecnico");

  const [tecnicos, cuadrillas, registros, incumplimientos] = await Promise.all([
    getTecnicos(),
    getCuadrillas(),
    getRegistrosDiarios({ desde, hasta }),
    getIncumplimientos({ desde, hasta }),
  ]);

  const tecnico =
    tecnicos.find((t) => t.id === tecnicoParam) ??
    tecnicos.find((t) => t.activo) ??
    tecnicos[0];

  const ficha = tecnico ? calcularFichaTecnica(tecnico, registros, incumplimientos) : null;
  const periodo =
    desde === inicioMes(desde.slice(0, 7)) && hasta === finMes(desde.slice(0, 7))
      ? mesLabel(desde.slice(0, 7))
      : `${formatFecha(desde)} — ${formatFecha(hasta)}`;

  const totales = [
    { label: "Instalaciones", value: numero(ficha?.instalaciones) },
    { label: "Reparaciones", value: numero(ficha?.reparaciones) },
    { label: "Bajas", value: numero(ficha?.bajas) },
    { label: "Cambios de domicilio", value: numero(ficha?.cambiosDomicilio) },
    { label: "Trabajos pendientes", value: numero(ficha?.pendientes) },
    { label: "% Tareas finalizadas", value: porcentaje(ficha?.pctTareasFinalizadas) },
  ];

  const filasIncumplimientos =
    ficha?.incumplimientos.map((i) => ({
      id: i.id,
      fecha: i.fecha,
      tipo: i.tipo_incumplimiento,
      gravedad: i.gravedad,
      descripcion: i.descripcion ?? "—",
      cuadrilla: i.cuadrilla?.nombre ?? "—",
    })) ?? [];

  return (
    <>
      <PageHeader
        title="Informe individual del personal técnico"
        description="Evaluación de actitud, rendimiento, incumplimientos y ficha técnica descargable."
        actions={
          ficha ? (
            <>
              <ExportCsvButton
                filename={`incumplimientos-${ficha.tecnico.legajo}`}
                rows={ficha.incumplimientos.map((i) => ({
                  fecha: i.fecha,
                  tipo: i.tipo_incumplimiento,
                  gravedad: i.gravedad,
                  descripcion: i.descripcion ?? "",
                }))}
                columns={[
                  { key: "fecha", label: "Fecha" },
                  { key: "tipo", label: "Tipo" },
                  { key: "gravedad", label: "Gravedad" },
                  { key: "descripcion", label: "Descripción" },
                ]}
                label="Incumplimientos CSV"
              />
              <ExportPdfButton
                tipo="ficha"
                ficha={ficha}
                periodo={periodo}
                label="Exportar ficha técnica a PDF"
              />
            </>
          ) : null
        }
      />

      <FiltersBar
        tecnicos={tecnicos}
        desde={desde}
        hasta={hasta}
        tecnicoId={tecnico?.id}
        mostrarCuadrilla={false}
      />

      {!ficha ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No hay técnicos registrados. Crea un técnico para comenzar.
          </p>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserRound className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{ficha.tecnico.nombre_completo}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Legajo {ficha.tecnico.legajo} · Ingreso {formatFecha(ficha.tecnico.fecha_ingreso)} ·{" "}
                    {ficha.diasTrabajados} días con parte diario
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={ficha.tecnico.activo ? "success" : "destructive"}>
                  {ficha.tecnico.activo ? "Activo" : "Inactivo"}
                </Badge>
                <Badge variant="secondary">
                  {cuadrillas.find((c) => c.id === ficha.tecnico.cuadrilla_actual_id)?.nombre ??
                    "Sin cuadrilla"}
                </Badge>
                <Badge variant="info">Actitud {ficha.puntajeActitud.toFixed(2)} / 5</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {totales.map((item) => (
              <Card key={item.label} className="p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-1.5 text-xl font-semibold tabular-nums">{item.value}</p>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Radar de actitud y conducta</CardTitle>
                <CardDescription>
                  Promedio de los 6 ejes evaluados en el período (escala 1 a 5).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadarEvaluacion data={ficha.radar} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evolución diaria reciente</CardTitle>
                <CardDescription>
                  Instalaciones, reparaciones y evaluación promedio de los últimos 20 partes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ficha.serie.length ? (
                  <TecnicoSerieChart data={ficha.serie} />
                ) : (
                  <p className="py-24 text-center text-xs text-muted-foreground">
                    Sin partes diarios en el período.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>Detalle de evaluación promedio</CardTitle>
                <CardDescription>
                  Leve {ficha.porGravedad.Leve ?? 0} · Moderada {ficha.porGravedad.Moderada ?? 0} ·
                  Grave {ficha.porGravedad.Grave ?? 0}
                </CardDescription>
              </div>
              <FileText className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ficha.radar.map((item) => (
                  <div
                    key={item.eje}
                    className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2.5"
                  >
                    <span className="text-xs text-muted-foreground">{item.eje}</span>
                    <span className="text-sm font-semibold tabular-nums">
                      {item.valor.toFixed(2)} / 5
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial de incumplimientos</CardTitle>
              <CardDescription>
                Eventos registrados para el técnico en el período seleccionado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                initialSort={{ key: "fecha", dir: "desc" }}
                columns={[
                  { key: "fecha", label: "Fecha", kind: "date", width: "110px" },
                  {
                    key: "tipo",
                    label: "Tipo de incumplimiento",
                    kind: "link",
                    linkPrefix: "/carga/incumplimiento/",
                    linkKey: "id",
                  },
                  { key: "cuadrilla", label: "Cuadrilla" },
                  { key: "gravedad", label: "Gravedad", kind: "badge", align: "center", width: "110px" },
                  { key: "descripcion", label: "Descripción" },
                ]}
                rows={filasIncumplimientos}
                emptyMessage="Sin incumplimientos registrados en el período."
              />
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
