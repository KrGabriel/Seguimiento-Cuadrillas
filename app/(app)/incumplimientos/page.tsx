import Link from "next/link";
import { AlertTriangle, Plus, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { FiltersBar } from "@/components/filters-bar";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { ExportCsvButton } from "@/components/export-csv-button";
import { Pagination } from "@/components/pagination";
import { getCuadrillas, getIncumplimientos, getTecnicos } from "@/lib/queries";
import { finMes, getParam, inicioMes, mesActual, numero, paginar, parsePage } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function IncumplimientosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const mes = mesActual();
  const desde = getParam(params, "desde") ?? inicioMes(mes);
  const hasta = getParam(params, "hasta") ?? finMes(mes);
  const tecnicoId = getParam(params, "tecnico");
  const cuadrillaId = getParam(params, "cuadrilla");
  const gravedad = getParam(params, "gravedad");
  const tipo = getParam(params, "tipo");

  const [incumplimientos, tecnicos, cuadrillas] = await Promise.all([
    getIncumplimientos({ desde, hasta }),
    getTecnicos(),
    getCuadrillas(),
  ]);

  const filtrados = incumplimientos.filter((i) => {
    if (tecnicoId && i.tecnico_id !== tecnicoId) return false;
    if (cuadrillaId && i.cuadrilla_id !== cuadrillaId) return false;
    if (gravedad && i.gravedad !== gravedad) return false;
    if (tipo && i.tipo_incumplimiento !== tipo) return false;
    return true;
  });

  const rows = filtrados.map((i) => ({
    id: i.id,
    fecha: i.fecha,
    tipo: i.tipo_incumplimiento,
    tecnico: i.tecnico?.nombre_completo ?? "—",
    cuadrilla: i.cuadrilla?.nombre ?? "—",
    gravedad: i.gravedad,
    descripcion: i.descripcion ?? "-",
    evidencia: i.evidencia_url ?? "",
  }));

  const graves = filtrados.filter((i) => i.gravedad === "Grave").length;
  const moderadas = filtrados.filter((i) => i.gravedad === "Moderada").length;
  const leves = filtrados.filter((i) => i.gravedad === "Leve").length;

  const pagina = paginar(rows, parsePage(getParam(params, "page")), 15);

  return (
    <>
      <PageHeader
        title="Incumplimientos"
        description="Listado global de eventos con filtros por técnico, cuadrilla, tipo y gravedad. Haz clic en el tipo para corregir o eliminar."
        actions={
          <>
            <ExportCsvButton
              filename="incumplimientos"
              rows={rows}
              columns={[
                { key: "fecha", label: "Fecha" },
                { key: "tipo", label: "Tipo de incumplimiento" },
                { key: "tecnico", label: "Técnico" },
                { key: "cuadrilla", label: "Cuadrilla" },
                { key: "gravedad", label: "Gravedad" },
                { key: "descripcion", label: "Descripción" },
              ]}
            />
            <Button asChild>
            <Link href="/carga/incumplimiento">
              <Plus /> Registrar incumplimiento
            </Link>
          </Button>
          </>
        }
      />

      <FiltersBar
        tecnicos={tecnicos}
        cuadrillas={cuadrillas}
        desde={desde}
        hasta={hasta}
        tecnicoId={tecnicoId}
        cuadrillaId={cuadrillaId}
        gravedad={gravedad}
        tipo={tipo}
        mostrarGravedad
        mostrarTipo
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total de eventos"
          value={numero(filtrados.length)}
          hint="Según filtros aplicados"
          icon={ShieldAlert}
          accent="primary"
        />
        <KpiCard label="Leves" value={numero(leves)} icon={AlertTriangle} accent="info" />
        <KpiCard label="Moderadas" value={numero(moderadas)} icon={AlertTriangle} accent="warning" />
        <KpiCard label="Graves" value={numero(graves)} icon={AlertTriangle} accent="destructive" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registro de incumplimientos</CardTitle>
          <CardDescription>
            {filtrados.length} evento(s) en el período. Ordena cualquier columna para auditar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            initialSort={{ key: "fecha", dir: "desc" }}
            columns={[
              { key: "fecha", label: "Fecha", kind: "date", width: "105px" },
              {
                key: "tipo",
                label: "Tipo de incumplimiento",
                kind: "link",
                linkPrefix: "/carga/incumplimiento/",
                linkKey: "id",
              },
              { key: "tecnico", label: "Técnico" },
              { key: "cuadrilla", label: "Cuadrilla" },
              { key: "gravedad", label: "Gravedad", kind: "badge", align: "center", width: "105px" },
              { key: "descripcion", label: "Descripción" },
              { key: "evidencia", label: "Evidencia", kind: "external", align: "center", width: "90px" },
            ]}
            rows={pagina.items}
            emptyMessage="Sin incumplimientos para los filtros seleccionados."
          />
          <Pagination
            page={pagina.page}
            totalPages={pagina.totalPages}
            total={pagina.total}
            desde={pagina.desde}
            hasta={pagina.hasta}
            basePath="/incumplimientos"
            searchParams={params}
            etiqueta="incumplimientos"
          />
        </CardContent>
      </Card>
    </>
  );
}
