"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  eliminarCuadrillaDefinitiva,
  eliminarTecnicoDefinitivo,
} from "@/lib/actions";

export function EliminarDefinitivoButton({
  tipo,
  id,
  nombre,
  redirectTo,
}: {
  tipo: "tecnico" | "cuadrilla";
  id: string;
  nombre: string;
  redirectTo: string;
}) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function eliminar() {
    const confirmado = window.confirm(
      `¿Eliminar definitivamente “${nombre}”? Solo es posible si no tiene historial. Esta acción no se puede deshacer.`,
    );
    if (!confirmado) return;
    setCargando(true);
    setError(null);
    const resultado =
      tipo === "tecnico" ? await eliminarTecnicoDefinitivo(id) : await eliminarCuadrillaDefinitiva(id);
    setCargando(false);
    if (!resultado.ok) {
      setError(resultado.error ?? "No se pudo eliminar.");
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button type="button" variant="destructive" size="sm" onClick={eliminar} disabled={cargando}>
        {cargando ? <Loader2 className="animate-spin" /> : <Trash2 />} Eliminar definitivamente
      </Button>
      {error ? <span className="text-[11px] text-red-400">{error}</span> : null}
    </div>
  );
}
