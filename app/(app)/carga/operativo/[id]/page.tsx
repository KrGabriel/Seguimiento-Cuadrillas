import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { OperativoForm } from "@/components/forms/operativo-form";
import { getCuadrillas, getMetricaPorId } from "@/lib/queries";
import { formatFecha } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditarOperativoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [registro, cuadrillas] = await Promise.all([getMetricaPorId(id), getCuadrillas()]);

  if (!registro) notFound();

  return (
    <>
      <PageHeader
        title="Editar control operativo"
        description={`Balance del ${formatFecha(registro.fecha)}. Si registras un estado de vehículo, se sincroniza con la cuadrilla.`}
      />
      <OperativoForm cuadrillas={cuadrillas} registro={registro} />
    </>
  );
}
