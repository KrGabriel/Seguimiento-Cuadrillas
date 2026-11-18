import { PageHeader } from "@/components/page-header";
import { CuadrillaForm } from "@/components/forms/cuadrilla-form";

export default function NuevaCuadrillaPage() {
  return (
    <>
      <PageHeader
        title="Nueva cuadrilla"
        description="Crea la cuadrilla y registra su vehículo y estado operativo inicial."
      />
      <CuadrillaForm />
    </>
  );
}
