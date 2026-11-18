import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { ParteDiarioForm } from "@/components/forms/parte-diario-form";
import { getCuadrillas, getRegistroDiarioPorId, getTecnicos } from "@/lib/queries";
import { formatFecha } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditarParteDiarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [registro, tecnicos, cuadrillas] = await Promise.all([
    getRegistroDiarioPorId(id),
    getTecnicos(),
    getCuadrillas(),
  ]);

  if (!registro) notFound();

  return (
    <>
      <PageHeader
        title="Editar parte diario"
        description={`Corrige la carga del ${formatFecha(registro.fecha)}. Los cambios quedan reflejados en los informes.`}
      />
      <ParteDiarioForm tecnicos={tecnicos} cuadrillas={cuadrillas} registro={registro} />
    </>
  );
}
