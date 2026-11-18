import Link from "next/link";
import { Plus, UserRoundCheck, UserRoundX, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DataTable } from "@/components/data-table";
import { getCuadrillas, getRegistrosDiarios, getTecnicos } from "@/lib/queries";
import { finMes, getParam, inicioMes, mesActual } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TecnicosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const mes = mesActual();
  const [tecnicos, cuadrillas, registros] = await Promise.all([
    getTecnicos(),
    getCuadrillas(),
    getRegistrosDiarios({ desde: inicioMes(mes), hasta: finMes(mes) }),
  ]);

  const q = (getParam(params, "q") ?? "").trim().toLowerCase();
  const cuadrillaFiltro = getParam(params, "cuadrilla");
  const estado = getParam(params, "estado");

  const filtrados = tecnicos.filter((t) => {
    if (q && !`${t.nombre_completo} ${t.legajo}`.toLowerCase().includes(q)) return false;
    if (cuadrillaFiltro === "sin") {
      if (t.cuadrilla_actual_id) return false;
    } else if (cuadrillaFiltro && t.cuadrilla_actual_id !== cuadrillaFiltro) {
      return false;
    }
    if (estado === "activos" && !t.activo) return false;
    if (estado === "inactivos" && t.activo) return false;
    return true;
  });

  const activos = tecnicos.filter((t) => t.activo).length;
  const sinCuadrilla = tecnicos.filter((t) => t.activo && !t.cuadrilla_actual_id).length;

  const partesPorTecnico = new Map<string, number>();
  for (const r of registros) {
    partesPorTecnico.set(r.tecnico_id, (partesPorTecnico.get(r.tecnico_id) ?? 0) + 1);
  }

  const rows = filtrados
    .map((t) => ({
      id: t.id,
      nombre: t.nombre_completo,
      legajo: t.legajo,
      cuadrilla: cuadrillas.find((c) => c.id === t.cuadrilla_actual_id)?.nombre ?? "Sin asignar",
      ingreso: t.fecha_ingreso,
      estado: t.activo ? "Activo" : "Inactivo",
      partes: partesPorTecnico.get(t.id) ?? 0,
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  return (
    <>
      <PageHeader
        title="Técnicos"
        description="Alta, edición, baja y reasignación de cuadrilla. Los registros históricos conservan la cuadrilla de cada jornada."
        actions={
          <Button asChild>
            <Link href="/tecnicos/nuevo">
              <Plus /> Nuevo técnico
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Técnicos registrados" value={String(tecnicos.length)} icon={Users} hint="Incluye activos e inactivos" />
        <KpiCard
          label="Técnicos activos"
          value={String(activos)}
          icon={UserRoundCheck}
          accent="success"
          hint="Disponibles para asignación"
        />
        <KpiCard
          label="Activos sin cuadrilla"
          value={String(sinCuadrilla)}
          icon={UserRoundX}
          accent="warning"
          hint="Requieren reasignación"
        />
      </div>

      <Card className="p-4">
        <form method="get" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input name="q" placeholder="Buscar por nombre o legajo" defaultValue={q} />
          <Select name="cuadrilla" defaultValue={cuadrillaFiltro ?? ""}>
            <option value="">Todas las cuadrillas</option>
            <option value="sin">Sin asignar</option>
            {cuadrillas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
          <Select name="estado" defaultValue={estado ?? ""}>
            <option value="">Activos e inactivos</option>
            <option value="activos">Solo activos</option>
            <option value="inactivos">Solo inactivos</option>
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
          <CardTitle>Personal técnico</CardTitle>
          <CardDescription>
            Haz clic en el nombre para editar, reasignar cuadrilla o dar de baja al técnico.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            initialSort={{ key: "nombre", dir: "asc" }}
            columns={[
              { key: "legajo", label: "Legajo", width: "110px" },
              { key: "nombre", label: "Nombre completo", kind: "link", linkPrefix: "/tecnicos/" },
              { key: "cuadrilla", label: "Cuadrilla actual" },
              { key: "ingreso", label: "Ingreso", kind: "date" },
              { key: "partes", label: "Partes del mes", kind: "number", align: "right" },
              { key: "estado", label: "Estado", kind: "badge", align: "center" },
            ]}
            rows={rows}
          />
        </CardContent>
      </Card>
    </>
  );
}
