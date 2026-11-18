import Link from "next/link";
import { ArrowRight, ClipboardCheck, ClipboardList, PackageCheck, ShieldAlert, Truck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { getRegistrosDiarios } from "@/lib/queries";

export const dynamic = "force-dynamic";

const accesos = [
  {
    href: "/carga/parte-diario",
    titulo: "Parte diario de técnico",
    descripcion: "Rendimiento y evaluación de actitud del día.",
    icon: ClipboardCheck,
  },
  {
    href: "/carga/incumplimiento",
    titulo: "Registro de incumplimientos",
    descripcion: "Faltas, gravedad y observaciones.",
    icon: ShieldAlert,
  },
  {
    href: "/carga/operativo",
    titulo: "Control operativo de cuadrilla",
    descripcion: "Órdenes, reclamos y balance de materiales.",
    icon: Truck,
  },
  {
    href: "/carga/equipo",
    titulo: "Recuperación de equipos",
    descripcion: "Trazabilidad por número de serie y destino.",
    icon: PackageCheck,
  },
];

export default async function CargaPage() {
  const registros = await getRegistrosDiarios();
  const recientes = registros.slice(0, 10).map((r) => ({
    id: r.id,
    fecha: r.fecha,
    tecnico: r.tecnico?.nombre_completo ?? "—",
    cuadrilla: r.cuadrilla?.nombre ?? "—",
    instalaciones: r.instalaciones_realizadas,
    reparaciones: r.reparaciones_realizadas,
    pendientes: r.trabajos_pendientes,
    evaluacion: Number(
      (
        (r.puntualidad +
          r.uniforme +
          r.responsabilidad +
          r.cumplimiento_tareas +
          r.companerismo +
          r.comunicacion_supervision) /
        6
      ).toFixed(1),
    ),
  }));

  return (
    <>
      <PageHeader
        title="Carga diaria"
        description="Formularios rápidos para registrar la operación del día sin fricción."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {accesos.map((acceso) => (
          <Link key={acceso.href} href={acceso.href} className="group">
            <Card className="h-full transition-colors hover:border-primary/50 hover:bg-accent/30">
              <CardHeader>
                <div className="mb-1 flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <acceso.icon className="size-4" />
                </div>
                <CardTitle className="flex items-center justify-between">
                  {acceso.titulo}
                  <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </CardTitle>
                <CardDescription>{acceso.descripcion}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="size-4 text-muted-foreground" /> Últimos partes cargados
          </CardTitle>
          <CardDescription>Historial reciente de registros diarios de técnicos.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            initialSort={{ key: "fecha", dir: "desc" }}
            columns={[
              { key: "fecha", label: "Fecha", kind: "date", width: "110px" },
              {
                key: "tecnico",
                label: "Técnico",
                kind: "link",
                linkPrefix: "/carga/parte-diario/",
                linkKey: "id",
              },
              { key: "cuadrilla", label: "Cuadrilla" },
              { key: "instalaciones", label: "Inst.", kind: "number", align: "right" },
              { key: "reparaciones", label: "Rep.", kind: "number", align: "right" },
              { key: "pendientes", label: "Pend.", kind: "number", align: "right" },
              { key: "evaluacion", label: "Evaluación", kind: "number", align: "right" },
            ]}
            rows={recientes}
          />
        </CardContent>
      </Card>
    </>
  );
}
