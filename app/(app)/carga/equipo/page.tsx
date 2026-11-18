import { PageHeader } from "@/components/page-header";
import { EquipoForm } from "@/components/forms/equipo-form";
import { getCuadrillas, getTecnicos } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function EquipoPage() {
  const [tecnicos, cuadrillas] = await Promise.all([getTecnicos(), getCuadrillas()]);

  return (
    <>
      <PageHeader
        title="Recuperación y movimiento de equipos"
        description="Fecha, cuadrilla, técnico, cliente, tipo, marca/modelo, número de serie, estado de recepción y destino."
      />
      <EquipoForm tecnicos={tecnicos} cuadrillas={cuadrillas} />
    </>
  );
}
