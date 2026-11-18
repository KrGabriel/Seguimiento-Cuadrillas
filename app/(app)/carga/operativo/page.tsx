import { PageHeader } from "@/components/page-header";
import { OperativoForm } from "@/components/forms/operativo-form";
import { getCuadrillas } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function OperativoPage() {
  const cuadrillas = await getCuadrillas();

  return (
    <>
      <PageHeader
        title="Control operativo de cuadrilla"
        description="Órdenes asignadas y finalizadas, reclamos posteriores, balance de materiales y observaciones de seguridad."
      />
      <OperativoForm cuadrillas={cuadrillas.filter((c) => c.activa)} />
    </>
  );
}
