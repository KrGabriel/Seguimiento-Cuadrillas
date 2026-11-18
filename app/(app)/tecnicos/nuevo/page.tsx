import { PageHeader } from "@/components/page-header";
import { TecnicoForm } from "@/components/forms/tecnico-form";
import { getCuadrillas } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function NuevoTecnicoPage() {
  const cuadrillas = await getCuadrillas();

  return (
    <>
      <PageHeader
        title="Nuevo técnico"
        description="Registra los datos del técnico y su cuadrilla inicial. Podrás reasignarlo en cualquier momento."
      />
      <TecnicoForm cuadrillas={cuadrillas} />
    </>
  );
}
