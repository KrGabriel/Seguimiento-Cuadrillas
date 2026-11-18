import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { IncumplimientoForm } from "@/components/forms/incumplimiento-form";
import { getCuadrillas, getIncumplimientoPorId, getTecnicos } from "@/lib/queries";
import { formatFecha } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditarIncumplimientoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [registro, tecnicos, cuadrillas] = await Promise.all([
    getIncumplimientoPorId(id),
    getTecnicos(),
    getCuadrillas(),
  ]);

  if (!registro) notFound();

  return (
    <>
      <PageHeader
        title="Editar incumplimiento"
        description={`Evento del ${formatFecha(registro.fecha)}. Actualiza el tipo, la gravedad o el contexto.`}
      />
      <IncumplimientoForm tecnicos={tecnicos} cuadrillas={cuadrillas} registro={registro} />
    </>
  );
}
