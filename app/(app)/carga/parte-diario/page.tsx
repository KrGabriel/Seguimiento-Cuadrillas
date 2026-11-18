import { PageHeader } from "@/components/page-header";
import { ParteDiarioForm } from "@/components/forms/parte-diario-form";
import { getCuadrillas, getTecnicos } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ParteDiarioPage() {
  const [tecnicos, cuadrillas] = await Promise.all([getTecnicos(), getCuadrillas()]);

  return (
    <>
      <PageHeader
        title="Parte diario de técnico"
        description="Rendimiento técnico, evaluación de actitud y notas del día. La cuadrilla se autocompleta y puede ajustarse."
      />
      <ParteDiarioForm tecnicos={tecnicos} cuadrillas={cuadrillas.filter((c) => c.activa)} />
    </>
  );
}
