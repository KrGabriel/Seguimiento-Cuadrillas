"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ComparativoCuadrillaFila, FichaTecnica } from "@/lib/analytics";
import type { MovimientoEquipoDetalle } from "@/lib/types";

type Props =
  | { tipo: "ficha"; periodo: string; ficha: FichaTecnica; label?: string }
  | {
      tipo: "cuadrillas";
      periodo: string;
      filas: ComparativoCuadrillaFila[];
      cuadrillaFiltrada?: string;
      label?: string;
    }
  | {
      tipo: "equipos";
      periodo: string;
      equipos: MovimientoEquipoDetalle[];
      filtros?: string;
      label?: string;
    };

export function ExportPdfButton(props: Props) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function exportar() {
    setCargando(true);
    setError(null);
    try {
      const pdf = await import("@/lib/pdf");
      if (props.tipo === "ficha") {
        await pdf.generarFichaTecnicaPDF({ ficha: props.ficha, periodo: props.periodo });
      } else if (props.tipo === "cuadrillas") {
        await pdf.generarInformeCuadrillasPDF({
          filas: props.filas,
          periodo: props.periodo,
          cuadrillaFiltrada: props.cuadrillaFiltrada,
        });
      } else {
        await pdf.generarManifiestoEquiposPDF({
          equipos: props.equipos,
          periodo: props.periodo,
          filtros: props.filtros,
        });
      }
    } catch (e) {
      setError("No se pudo generar el PDF. Intenta nuevamente.");
      console.error(e);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={exportar} variant="outline" disabled={cargando}>
        {cargando ? <Loader2 className="animate-spin" /> : <Download />}
        {props.label ?? "Exportar PDF"}
      </Button>
      {error ? <span className="text-[11px] text-red-400">{error}</span> : null}
    </div>
  );
}
