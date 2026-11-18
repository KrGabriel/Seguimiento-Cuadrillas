import Link from "next/link";
import { Plus, Truck, Wrench } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { getCuadrillas, getMetricas, getTecnicos } from "@/lib/queries";
import { finMes, getParam, inicioMes, mesActual, porcentaje } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CuadrillasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const mes = mesActual();
  const [cuadrillas, tecnicos, metricas] = await Promise.all([
    getCuadrillas(),
    getTecnicos(),
    getMetricas({ desde: inicioMes(mes), hasta: finMes(mes) }),
  ]);

  const q = (getParam(params, "q") ?? "").trim().toLowerCase();
  const estado = getParam(params, "estado");
  const vigencia = getParam(params, "vigencia");

  const filtradas = cuadrillas.filter((c) => {
    if (q && !`${c.nombre} ${c.vehiculo_asignado ?? ""}`.toLowerCase().includes(q)) return false;
    if (estado && c.estado_vehiculo !== estado) return false;
    if (vigencia === "activas" && !c.activa) return false;
    if (vigencia === "inactivas" && c.activa) return false;
    return true;
  });

  const activas = cuadrillas.filter((c) => c.activa).length;
  const enMantenimiento = cuadrillas.filter(
    (c) => c.estado_vehiculo === "Mantenimiento" || c.estado_vehiculo === "Herramientas",
  ).length;

  const rows = filtradas.map((c) => {
    const propias = metricas.filter((m) => m.cuadrilla_id === c.id);
    const asignadas = propias.reduce((a, m) => a + m.ordenes_asignadas, 0);
    const finalizadas = propias.reduce((a, m) => a + m.ordenes_finalizadas, 0);
    return {
      id: c.id,
      nombre: c.nombre,
      vehiculo: c.vehiculo_asignado ?? "—",
      estado: c.estado_vehiculo,
      activa: c.activa ? "Activa" : "Inactiva",
      tecnicos: tecnicos.filter((t) => t.activo && t.cuadrilla_actual_id === c.id).length,
      cumplimiento: asignadas > 0 ? (finalizadas / asignadas) * 100 : 0,
      ordenes: asignadas,
    };
  });

  return (
    <>
      <PageHeader
        title="Cuadrillas"
        description="Gestión de cuadrillas y estado de su vehículo: mantenimiento, limpieza y herramientas."
        actions={
          <Button asChild>
            <Link href="/cuadrillas/nueva">
              <Plus /> Nueva cuadrilla
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Cuadrillas activas" value={String(activas)} icon={Truck} accent="success" hint={`${cuadrillas.length} en total`} />
        <KpiCard
          label="Requieren atención de vehículo"
          value={String(enMantenimiento)}
          icon={Wrench}
          accent="warning"
          hint="Mantenimiento o herramientas"
        />
        <KpiCard
          label="Cumplimiento promedio del mes"
          value={porcentaje(
            rows.filter((r) => r.ordenes > 0).reduce((a, r) => a + r.cumplimiento, 0) /
              Math.max(1, rows.filter((r) => r.ordenes > 0).length),
          )}
          icon={Truck}
          accent="primary"
          hint="Órdenes finalizadas / asignadas"
        />
      </div>

      <Card className="p-4">
        <form method="get" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input name="q" placeholder="Buscar por cuadrilla o vehículo" defaultValue={q} />
          <Select name="estado" defaultValue={estado ?? ""}>
            <option value="">Todos los estados</option>
            <option value="Operativo">Operativo</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="Limpieza">Limpieza</option>
            <option value="Herramientas">Herramientas</option>
          </Select>
          <Select name="vigencia" defaultValue={vigencia ?? ""}>
            <option value="">Activas e inactivas</option>
            <option value="activas">Solo activas</option>
            <option value="inactivas">Solo inactivas</option>
          </Select>
          <div className="flex items-center gap-2">
            <Button type="submit" className="flex-1">
              Filtrar
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="?">Limpiar</Link>
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parque de cuadrillas</CardTitle>
          <CardDescription>
            Haz clic en el nombre para editar el vehículo, su estado y la vigencia de la cuadrilla.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            initialSort={{ key: "nombre", dir: "asc" }}
            columns={[
              { key: "nombre", label: "Cuadrilla", kind: "link", linkPrefix: "/cuadrillas/" },
              { key: "vehiculo", label: "Vehículo" },
              { key: "estado", label: "Estado vehículo", kind: "badge" },
              { key: "activa", label: "Vigencia", kind: "badge", align: "center" },
              { key: "tecnicos", label: "Técnicos activos", kind: "number", align: "right" },
              { key: "ordenes", label: "Órdenes mes", kind: "number", align: "right" },
              { key: "cumplimiento", label: "Cumplimiento", kind: "percent", align: "right" },
            ]}
            rows={rows}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cuadrillas
          .filter((c) => c.activa)
          .map((c) => (
            <Card key={c.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{c.nombre}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {c.vehiculo_asignado ?? "Sin vehículo"}
                  </p>
                </div>
                <Badge
                  variant={
                    c.estado_vehiculo === "Operativo"
                      ? "success"
                      : c.estado_vehiculo === "Mantenimiento"
                        ? "destructive"
                        : "warning"
                  }
                >
                  {c.estado_vehiculo}
                </Badge>
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                {tecnicos.filter((t) => t.activo && t.cuadrilla_actual_id === c.id).length} técnicos
                asignados
              </p>
            </Card>
          ))}
      </div>
    </>
  );
}
