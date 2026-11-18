import { PackageCheck, PackageX, Wrench } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { FiltersBar } from "@/components/filters-bar";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { ExportCsvButton } from "@/components/export-csv-button";
import { Pagination } from "@/components/pagination";
import { ExportPdfButton } from "@/components/export-pdf-button";
import { getCuadrillas, getMovimientos, getTecnicos } from "@/lib/queries";
import { formatFecha, fechaHaceDias, fechaHoy, getParam, mesLabel, numero, paginar, parsePage } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function InformeEquiposPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const fechaHasta = getParam(params, "hasta") ?? fechaHoy();
  const fechaDesde = getParam(params, "desde") ?? fechaHaceDias(120);
  const tecnicoId = getParam(params, "tecnico");
  const cuadrillaId = getParam(params, "cuadrilla");
  const estado = getParam(params, "estado");
  const destino = getParam(params, "destino");
  const q = getParam(params, "q")?.trim() ?? "";

  const [movimientos, tecnicos, cuadrillas] = await Promise.all([
    getMovimientos(),
    getTecnicos(),
    getCuadrillas(),
  ]);

  const filtrados = movimientos.filter((m) => {
    if (m.fecha_recuperacion < fechaDesde || m.fecha_recuperacion > fechaHasta) return false;
    if (tecnicoId && m.tecnico_id !== tecnicoId) return false;
    if (cuadrillaId && m.cuadrilla_id !== cuadrillaId) return false;
    if (estado && m.estado_recepcion !== estado) return false;
    if (destino && m.destino_equipo !== destino) return false;
    if (q) {
      const texto = `${m.numero_serie} ${m.cliente_abonado} ${m.tipo_equipo} ${m.marca_modelo ?? ""}`.toLowerCase();
      if (!texto.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  const periodo = `${formatFecha(fechaDesde)} — ${formatFecha(fechaHasta)}`;

  const filtrosResumen = [
    tecnicos.find((t) => t.id === tecnicoId)?.nombre_completo,
    cuadrillas.find((c) => c.id === cuadrillaId)?.nombre,
    estado,
    destino,
    q ? `Búsqueda: ${q}` : undefined,
  ]
    .filter(Boolean)
    .join(" · ");

  const rows = filtrados.map((m) => ({
    id: m.id,
    fecha: m.fecha_recuperacion,
    serie: m.numero_serie,
    cliente: m.cliente_abonado,
    tipo: m.tipo_equipo,
    marca: m.marca_modelo ?? "—",
    tecnico: m.tecnico?.nombre_completo ?? "—",
    cuadrilla: m.cuadrilla?.nombre ?? "—",
    estado: m.estado_recepcion,
    destino: m.destino_equipo,
    evidencia: m.evidencia_url ?? "",
  }));

  const operativos = filtrados.filter((m) => m.estado_recepcion === "Operativo").length;
  const danados = filtrados.filter((m) => m.estado_recepcion === "Dañado").length;
  const revision = filtrados.filter((m) => m.estado_recepcion === "Para revisión").length;
  const stock = filtrados.filter((m) => m.destino_equipo === "Stock disponible").length;

  const pagina = paginar(rows, parsePage(getParam(params, "page")), 15);

  return (
    <>
      <PageHeader
        title="Recuperación y movimiento de equipos"
        description="Trazabilidad completa por número de serie, cliente, cuadrilla, técnico, estado y destino."
        actions={
          <>
            <ExportCsvButton
              filename="equipos"
              rows={rows}
              columns={[
                { key: "fecha", label: "Fecha" },
                { key: "serie", label: "N° Serie" },
                { key: "cliente", label: "Cliente / Abonado" },
                { key: "tipo", label: "Tipo" },
                { key: "marca", label: "Marca / Modelo" },
                { key: "tecnico", label: "Técnico" },
                { key: "cuadrilla", label: "Cuadrilla" },
                { key: "estado", label: "Estado" },
                { key: "destino", label: "Destino" },
              ]}
            />
            <ExportPdfButton
              tipo="equipos"
              equipos={filtrados}
              periodo={periodo}
              filtros={filtrosResumen}
              label="Exportar manifiesto a PDF"
            />
          </>
        }
      />

      <FiltersBar
        tecnicos={tecnicos}
        cuadrillas={cuadrillas}
        desde={fechaDesde}
        hasta={fechaHasta}
        tecnicoId={tecnicoId}
        cuadrillaId={cuadrillaId}
        q={q}
        estado={estado}
        destino={destino}
        mostrarBusqueda
        mostrarEstado
        mostrarDestino
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Equipos recuperados"
          value={numero(filtrados.length)}
          hint={`${numero(stock)} en stock disponible`}
          icon={PackageCheck}
          accent="primary"
        />
        <KpiCard label="Operativos" value={numero(operativos)} icon={PackageCheck} accent="success" hint="Listos para reutilización" />
        <KpiCard label="Dañados" value={numero(danados)} icon={PackageX} accent="destructive" hint="Requieren evaluación" />
        <KpiCard label="Para revisión" value={numero(revision)} icon={Wrench} accent="warning" hint="Pendientes de diagnóstico" />
      </div>

      <Card>
        <CardHeader className="flex-row flex-wrap items-start justify-between gap-2 space-y-0">
          <div>
            <CardTitle>Manifiesto de equipos</CardTitle>
            <CardDescription>
              Usa el buscador por número de serie o cliente. Haz clic en los encabezados para ordenar.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{mesLabel(fechaDesde.slice(0, 7))} en adelante</Badge>
            {filtrosResumen ? <Badge variant="secondary">Filtros activos</Badge> : null}
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            initialSort={{ key: "fecha", dir: "desc" }}
            columns={[
              { key: "fecha", label: "Fecha", kind: "date", width: "105px" },
              { key: "serie", label: "N° Serie", kind: "link", linkPrefix: "/carga/equipo/", linkKey: "id", width: "140px" },
              { key: "cliente", label: "Cliente / Abonado" },
              { key: "tipo", label: "Tipo" },
              { key: "marca", label: "Marca / Modelo" },
              { key: "tecnico", label: "Técnico" },
              { key: "cuadrilla", label: "Cuadrilla" },
              { key: "estado", label: "Estado", kind: "badge", align: "center" },
              { key: "destino", label: "Destino", kind: "badge", align: "center" },
              { key: "evidencia", label: "Evidencia", kind: "external", align: "center", width: "90px" },
            ]}
            rows={pagina.items}
            emptyMessage="No se encontraron equipos con los filtros aplicados."
          />
          <Pagination
            page={pagina.page}
            totalPages={pagina.totalPages}
            total={pagina.total}
            desde={pagina.desde}
            hasta={pagina.hasta}
            basePath="/informes/equipos"
            searchParams={params}
            etiqueta="equipos"
          />
        </CardContent>
      </Card>
    </>
  );
}
