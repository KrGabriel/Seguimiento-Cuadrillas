import Link from "next/link";
import {
  ArrowUpRight,
  ClipboardCheck,
  PackageCheck,
  ShieldAlert,
  Wrench,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { CuadrillasBarChart } from "@/components/charts/cuadrillas-bar-chart";
import { ExportPdfButton } from "@/components/export-pdf-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCuadrillas, getIncumplimientos, getMetricas, getMovimientos, getRegistrosDiarios } from "@/lib/queries";
import { calcularKpis, comparativoCuadrillas, tendenciaMensual } from "@/lib/analytics";
import {
  finMes,
  formatFecha,
  getParam,
  inicioMes,
  mesLabel,
  mesActual,
  numero,
  porcentaje,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

function restarMeses(mesBase: string, meses: number) {
  const base = new Date(`${mesBase}-01T12:00:00`);
  const objetivo = new Date(base.getFullYear(), base.getMonth() - meses, 1);
  return `${objetivo.getFullYear()}-${String(objetivo.getMonth() + 1).padStart(2, "0")}`;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const mesParam = getParam(params, "mes");
  const mes = mesParam && /^\d{4}-\d{2}$/.test(mesParam) ? mesParam : mesActual();
  const desde = inicioMes(mes);
  const hasta = finMes(mes);
  const desdeTendencia = inicioMes(restarMeses(mes, 5));

  const [registrosHist, incumplimientosHist, movimientos, metricas, cuadrillas] = await Promise.all([
    getRegistrosDiarios({ desde: desdeTendencia, hasta }),
    getIncumplimientos({ desde: desdeTendencia, hasta }),
    getMovimientos(),
    getMetricas({ desde, hasta }),
    getCuadrillas(),
  ]);

  const registros = registrosHist.filter((r) => r.fecha >= desde && r.fecha <= hasta);
  const incumplimientos = incumplimientosHist.filter((i) => i.fecha >= desde && i.fecha <= hasta);
  const movimientosMes = movimientos.filter(
    (m) => m.fecha_recuperacion >= desde && m.fecha_recuperacion <= hasta,
  );

  const kpis = calcularKpis(registros, incumplimientos, metricas, movimientosMes);
  const tendencia = tendenciaMensual(registrosHist, incumplimientosHist, movimientos, 6, mes);
  const comparativo = comparativoCuadrillas(cuadrillas, metricas, registros, incumplimientos);

  const barData = comparativo.map((f) => ({
    cuadrilla: f.cuadrilla.replace("Cuadrilla ", ""),
    finalizadas: f.ordenesFinalizadas,
    pendientes: Math.max(0, f.ordenesAsignadas - f.ordenesFinalizadas),
    asignadas: f.ordenesAsignadas,
  }));

  const ranking = new Map<string, { nombre: string; instalaciones: number; registros: number }>();
  for (const r of registros) {
    const actual = ranking.get(r.tecnico_id) ?? {
      nombre: r.tecnico?.nombre_completo ?? "—",
      instalaciones: 0,
      registros: 0,
    };
    actual.instalaciones += r.instalaciones_realizadas;
    actual.registros += 1;
    ranking.set(r.tecnico_id, actual);
  }
  const topTecnicos = Array.from(ranking.entries())
    .sort((a, b) => b[1].instalaciones - a[1].instalaciones)
    .slice(0, 5);

  return (
    <>
      <PageHeader
        title="Dashboard ejecutivo"
        description={`Vista general del desempeño operativo · ${mesLabel(mes)}`}
        actions={
          <>
            <form method="get" className="flex items-center gap-2">
              <Input
                type="month"
                name="mes"
                defaultValue={mes}
                className="h-8 w-[150px]"
                aria-label="Mes a consultar"
              />
              <Button type="submit" size="sm" variant="outline">
                Ver
              </Button>
            </form>
            {mes !== mesActual() ? (
              <Button asChild size="sm" variant="ghost">
                <Link href="/dashboard">Mes actual</Link>
              </Button>
            ) : null}
            <Button asChild size="sm">
              <Link href="/carga">
                <ClipboardCheck /> Registrar carga diaria
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Instalaciones del mes"
          value={numero(kpis.instalaciones)}
          hint={`${numero(kpis.reparaciones)} reparaciones ejecutadas`}
          icon={Wrench}
          accent="primary"
        />
        <KpiCard
          label="Tareas finalizadas"
          value={porcentaje(kpis.pctFinalizadas)}
          hint={`${numero(kpis.ordenesFinalizadas)} de ${numero(kpis.ordenesAsignadas)} órdenes`}
          icon={ClipboardCheck}
          accent="success"
        />
        <KpiCard
          label="Incumplimientos"
          value={numero(kpis.incumplimientos)}
          hint="Eventos registrados en el mes"
          icon={ShieldAlert}
          accent="destructive"
        />
        <KpiCard
          label="Equipos recuperados"
          value={numero(kpis.equiposRecuperados)}
          hint="Movimientos con trazabilidad"
          icon={PackageCheck}
          accent="info"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Tendencia mensual de rendimiento técnico</CardTitle>
              <CardDescription>Instalaciones, reparaciones e incumplimientos (últimos 6 meses).</CardDescription>
            </div>
            <Badge variant="secondary">6 meses</Badge>
          </CardHeader>
          <CardContent>
            <TrendChart data={tendencia} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pulso operativo del mes</CardTitle>
            <CardDescription>Balance de órdenes y reclamos posteriores.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Órdenes asignadas", value: numero(kpis.ordenesAsignadas) },
              { label: "Órdenes finalizadas", value: numero(kpis.ordenesFinalizadas) },
              { label: "Trabajos con reclamos", value: numero(kpis.reclamos) },
              {
                label: "Tasa de reclamos",
                value: kpis.ordenesFinalizadas
                  ? porcentaje((kpis.reclamos / kpis.ordenesFinalizadas) * 100)
                  : "0%",
              },
              { label: "Cuadrillas activas", value: numero(cuadrillas.filter((c) => c.activa).length) },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between border-b border-border/60 pb-3 last:border-0 last:pb-0">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <span className="text-sm font-semibold tabular-nums">{item.value}</span>
              </div>
            ))}
            <Button asChild variant="secondary" className="w-full">
              <Link href="/informes/cuadrillas">
                Ver informe de cuadrillas <ArrowUpRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Órdenes por cuadrilla</CardTitle>
              <CardDescription>Finalizadas vs. pendientes del mes actual (barras apiladas).</CardDescription>
            </div>
            <ExportPdfButton
              tipo="cuadrillas"
              periodo={mesLabel(mes)}
              filas={comparativo}
              label="PDF comparativo"
            />
          </CardHeader>
          <CardContent>
            {barData.length ? (
              <CuadrillasBarChart data={barData} />
            ) : (
              <p className="py-16 text-center text-xs text-muted-foreground">Sin métricas registradas.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top técnicos por instalaciones</CardTitle>
            <CardDescription>Ranking del mes actual.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topTecnicos.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin registros en el período.</p>
            ) : (
              topTecnicos.map(([id, data], index) => (
                <div key={id} className="flex items-center gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{data.nombre}</p>
                    <p className="text-[10px] text-muted-foreground">{data.registros} días con parte</p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{data.instalaciones}</span>
                </div>
              ))
            )}
            <Button asChild variant="ghost" className="w-full">
              <Link href="/informes/tecnicos">Ver desempeño individual</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Incumplimientos recientes</CardTitle>
            <CardDescription>Últimos eventos registrados en el mes.</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/carga/incumplimiento">Registrar falta</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {incumplimientos.slice(0, 5).map((i) => (
            <div
              key={i.id}
              className="flex flex-col gap-1 rounded-md border border-border/60 bg-background/40 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">{i.tipo_incumplimiento}</p>
                <p className="text-[10px] text-muted-foreground">
                  {i.tecnico?.nombre_completo ?? "—"} · {i.cuadrilla?.nombre ?? "—"} · {formatFecha(i.fecha)}
                </p>
              </div>
              <Badge
                variant={i.gravedad === "Grave" ? "destructive" : i.gravedad === "Moderada" ? "warning" : "secondary"}
              >
                {i.gravedad}
              </Badge>
            </div>
          ))}
          {incumplimientos.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              Sin incumplimientos en el mes. Buen desempeño general.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </>
  );
}
