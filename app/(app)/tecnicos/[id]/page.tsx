import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { TecnicoForm } from "@/components/forms/tecnico-form";
import { getCuadrillas, getTecnico } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function EditarTecnicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [tecnico, cuadrillas] = await Promise.all([getTecnico(id), getCuadrillas()]);

  if (!tecnico) notFound();

  return (
    <>
      <PageHeader
        title={`Editar técnico · ${tecnico.nombre_completo}`}
        description="Actualiza los datos, reasigna la cuadrilla actual o desactiva al técnico sin perder su historial."
      />
      <TecnicoForm tecnico={tecnico} cuadrillas={cuadrillas} />
    </>
  );
}
