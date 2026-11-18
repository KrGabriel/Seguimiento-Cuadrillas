import Link from "next/link";
import { ClipboardList, Plus, Truck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { FiltersBar } from "@/components/filters-bar";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { getCuadrillas, getMetricas } from "@/lib/queries";
import { finMes, getParam, inicioMes, mesActual, numero, porcentaje } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OperativoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const mes = mesActual();
  const desde = getParam(params, "desde") ?? inicioMes(mes);
  const hasta = getParam(params, "hasta") ?? finMes(mes);
  const cuadrillaId = getParam(params, "cuadrilla");

  const [metricas, cuadrillas] = await Promise.all([
    getMetricas({ desde, hasta }),
    getCuadrillas(),
  ]);

  const filtradas = cuadrillaId
    ? metricas.filter((m) => m.cuadrilla_id === cuadrillaId)
    : metricas;

  const rows = filtradas.map((m) => ({
    id: m.id,
    fecha: m.fecha,
    cuadrilla: m.cuadrilla?.nombre ?? "—",
    asignadas: m.ordenes_asignadas,
    finalizadas: m.ordenes_finalizadas,
    pendientes: m.ordenes_pendientes,
    reclamos: m.trabajos_con_reclamos,
    utilizados: m.materiales_utilizados,
    recuperados: m.materiales_recuperados,
    cumplimiento:
      m.ordenes_asignadas > 0 ? (m.ordenes_finalizadas / m.ordenes_asignadas) * 100 : 0,
    vehiculo: m.estado_vehiculo_check ?? "Sin check",
  }));

  const asignadas = filtradas.reduce((a, m) => a + m.ordenes_asignadas, 0);
  const finalizadas = filtradas.reduce((a, m) => a + m.ordenes_finalizadas, 0);
  const reclamos = filtradas.reduce((a, m) => a + m.trabajos_con_reclamos, 0);
  const utilizados = filtradas.reduce((a, m) => a + m.materiales_utilizados, 0);
  const recuperados = filtradas.reduce((a, m) => a + m.materiales_recuperados, 0);

  return (
    <>
      <PageHeader
        title="Control operativo diario"
        description="Auditoría de órdenes, reclamos y balance de materiales por cuadrilla. Haz clic en la cuadrilla para editar o eliminar el registro."
        actions={
          <Button asChild>
            <Link href="/carga/operativo">
              <Plus /> Nuevo control
            </Link>
          </Button>
        }
      />

      <FiltersBar
        cuadrillas={cuadrillas}
        desde={desde}
        hasta={hasta}
        cuadrillaId={cuadrillaId}
        mostrarTecnico={false}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Cumplimiento del período"
          value={porcentaje(asignadas > 0 ? (finalizadas / asignadas) * 100 : 0)}
          hint={`${numero(finalizadas)} de ${numero(asignadas)} órdenes`}
          icon={ClipboardList}
          accent="success"
        />
        <KpiCard
          label="Reclamos posteriores"
          value={numero(reclamos)}
          icon={ClipboardList}
          accent="destructive"
          hint="Acumulado de los registros"
        />
        <KpiCard
          label="Materiales utilizados"
          value={numero(utilizados)}
          icon={Truck}
          accent="primary"
          hint={`${numero(recuperados)} recuperados`}
        />
        <KpiCard
          label="Registros cargados"
          value={numero(filtradas.length)}
          icon={ClipboardList}
          accent="info"
          hint="Un registro por cuadrilla y fecha"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registros operativos</CardTitle>
          <CardDescription>
            {filtradas.length} registro(s) en el período seleccionado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            initialSort={{ key: "fecha", dir: "desc" }}
            columns={[
              { key: "fecha", label: "Fecha", kind: "date", width: "105px" },
              {
                key: "cuadrilla",
                label: "Cuadrilla",
                kind: "link",
                linkPrefix: "/carga/operativo/",
                linkKey: "id",
              },
              { key: "asignadas", label: "Asignadas", kind: "number", align: "right" },
              { key: "finalizadas", label: "Finalizadas", kind: "number", align: "right" },
              { key: "pendientes", label: "Pendientes", kind: "number", align: "right" },
              { key: "reclamos", label: "Reclamos", kind: "number", align: "right" },
              { key: "utilizados", label: "Mat. util.", kind: "number", align: "right" },
              { key: "recuperados", label: "Mat. recup.", kind: "number", align: "right" },
              { key: "cumplimiento", label: "Cumplimiento", kind: "percent", align: "right" },
              { key: "vehiculo", label: "Vehículo", kind: "badge", align: "center" },
            ]}
            rows={rows}
            emptyMessage="Sin controles operativos para los filtros seleccionados."
          />
        </CardContent>
      </Card>
    </>
  );
}
