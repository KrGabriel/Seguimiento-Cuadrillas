import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { EquipoForm } from "@/components/forms/equipo-form";
import { getCuadrillas, getEquipoPorId, getTecnicos } from "@/lib/queries";
import { formatFecha } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditarEquipoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [registro, tecnicos, cuadrillas] = await Promise.all([
    getEquipoPorId(id),
    getTecnicos(),
    getCuadrillas(),
  ]);

  if (!registro) notFound();

  return (
    <>
      <PageHeader
        title={`Editar equipo · ${registro.numero_serie}`}
        description={`Movimiento del ${formatFecha(registro.fecha_recuperacion)}. Corrige el estado de recepción o el destino.`}
      />
      <EquipoForm tecnicos={tecnicos} cuadrillas={cuadrillas} registro={registro} />
    </>
  );
}
