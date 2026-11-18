import { PageHeader } from "@/components/page-header";
import { IncumplimientoForm } from "@/components/forms/incumplimiento-form";
import { getCuadrillas, getTecnicos } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function IncumplimientoPage() {
  const [tecnicos, cuadrillas] = await Promise.all([getTecnicos(), getCuadrillas()]);

  return (
    <>
      <PageHeader
        title="Registro de incumplimientos"
        description="Carga rápida de faltas según el listado oficial: iClass, optimización de materiales, uniforme, seguridad en escaleras y portones."
      />
      <IncumplimientoForm tecnicos={tecnicos} cuadrillas={cuadrillas} />
    </>
  );
}
