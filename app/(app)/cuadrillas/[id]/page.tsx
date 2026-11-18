import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { CuadrillaForm } from "@/components/forms/cuadrilla-form";
import { getCuadrilla, getTecnicos } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function EditarCuadrillaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [cuadrilla, tecnicos] = await Promise.all([getCuadrilla(id), getTecnicos()]);

  if (!cuadrilla) notFound();

  const asignados = tecnicos.filter((t) => t.activo && t.cuadrilla_actual_id === id).length;

  return (
    <>
      <PageHeader
        title={`Editar cuadrilla · ${cuadrilla.nombre}`}
        description="Actualiza vehículo, estado operativo y vigencia de la cuadrilla."
      />
      <CuadrillaForm cuadrilla={cuadrilla} tecnicosAsignados={asignados} />
    </>
  );
}
