import { History, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DataTable } from "@/components/data-table";
import { ExportCsvButton } from "@/components/export-csv-button";
import { Pagination } from "@/components/pagination";
import { getAuditoria } from "@/lib/queries";
import { getParam, paginar, parsePage } from "@/lib/utils";

export const dynamic = "force-dynamic";

const OPERACIONES: Record<string, string> = {
  INSERT: "Insertar",
  UPDATE: "Actualizar",
  DELETE: "Eliminar",
};

const TABLAS = [
  "cuadrillas",
  "tecnicos",
  "registros_diarios_tecnicos",
  "incumplimientos",
  "metricas_cuadrilla_diaria",
  "movimientos_equipos",
  "perfiles",
];

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const eventos = await getAuditoria(500);
  const tabla = getParam(params, "tabla");
  const q = (getParam(params, "q") ?? "").trim().toLowerCase();

  const filtrados = eventos.filter((e) => {
    if (tabla && e.tabla !== tabla) return false;
    if (
      q &&
      !`${e.usuario_email ?? ""} ${e.registro_id ?? ""} ${e.tabla} ${e.operacion}`
        .toLowerCase()
        .includes(q)
    )
      return false;
    return true;
  });

  const rows = filtrados.map((e) => ({
    id: e.id,
    fecha: e.created_at,
    tabla: e.tabla,
    operacion: OPERACIONES[e.operacion] ?? e.operacion,
    usuario: e.usuario_email ?? "sistema",
    registro: e.registro_id ?? "-",
  }));

  const pagina = paginar(rows, parsePage(getParam(params, "page")), 25);
  const inserciones = filtrados.filter((e) => e.operacion === "INSERT").length;
  const actualizaciones = filtrados.filter((e) => e.operacion === "UPDATE").length;
  const eliminaciones = filtrados.filter((e) => e.operacion === "DELETE").length;

  return (
    <>
      <PageHeader
        title="Auditoría de cambios"
        description="Quién creó, modificó o eliminó cada registro operativo. Requiere ejecutar supabase/auditoria.sql."
        actions={
          <ExportCsvButton
            filename="auditoria"
            rows={rows}
            columns={[
              { key: "fecha", label: "Fecha" },
              { key: "tabla", label: "Tabla" },
              { key: "operacion", label: "Operación" },
              { key: "usuario", label: "Usuario" },
              { key: "registro", label: "Registro" },
            ]}
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Eventos" value={String(filtrados.length)} icon={History} hint="Últimos 500 cambios" />
        <KpiCard label="Inserciones" value={String(inserciones)} icon={ShieldCheck} accent="success" />
        <KpiCard label="Actualizaciones" value={String(actualizaciones)} icon={ShieldCheck} accent="info" />
        <KpiCard label="Eliminaciones" value={String(eliminaciones)} icon={ShieldCheck} accent="destructive" />
      </div>

      <Card className="p-4">
        <form method="get" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input name="q" placeholder="Usuario, registro o tabla" defaultValue={q} aria-label="Buscar en auditoría" />
          <Select name="tabla" defaultValue={tabla ?? ""} aria-label="Filtrar por tabla">
            <option value="">Todas las tablas</option>
            {TABLAS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
          <div className="flex items-center gap-2 lg:col-span-2">
            <Button type="submit">Filtrar</Button>
            <Button asChild variant="ghost">
              <a href="/auditoria">Limpiar</a>
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bitácora de cambios</CardTitle>
          <CardDescription>
            {eventos.length === 0
              ? "Sin eventos. Ejecuta supabase/auditoria.sql para activar el registro."
              : `${filtrados.length} evento(s) encontrados en los últimos 500 cambios.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            initialSort={{ key: "fecha", dir: "desc" }}
            columns={[
              { key: "fecha", label: "Fecha y hora", kind: "datetime", width: "160px" },
              { key: "tabla", label: "Tabla" },
              { key: "operacion", label: "Operación", kind: "badge", align: "center", width: "120px" },
              { key: "usuario", label: "Usuario" },
              { key: "registro", label: "ID registro", width: "200px" },
            ]}
            rows={pagina.items}
            emptyMessage="No hay eventos de auditoría para los filtros seleccionados."
          />
          <Pagination
            page={pagina.page}
            totalPages={pagina.totalPages}
            total={pagina.total}
            desde={pagina.desde}
            hasta={pagina.hasta}
            basePath="/auditoria"
            searchParams={params}
            etiqueta="eventos"
          />
        </CardContent>
      </Card>
    </>
  );
}
