"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  eliminarEquipo,
  eliminarIncumplimiento,
  eliminarOperativo,
  eliminarParteDiario,
} from "@/lib/actions";

type Tipo = "parte" | "incumplimiento" | "operativo" | "equipo";

const ACCIONES = {
  parte: eliminarParteDiario,
  incumplimiento: eliminarIncumplimiento,
  operativo: eliminarOperativo,
  equipo: eliminarEquipo,
} as const;

export function EliminarRegistroButton({
  tipo,
  id,
  redirectTo,
  label = "Eliminar",
}: {
  tipo: Tipo;
  id: string;
  redirectTo: string;
  label?: string;
}) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function eliminar() {
    if (!window.confirm("¿Eliminar este registro? Esta acción no se puede deshacer.")) return;
    setCargando(true);
    setError(null);
    const resultado = await ACCIONES[tipo](id);
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
      <Button type="button" variant="destructive" onClick={eliminar} disabled={cargando}>
        {cargando ? <Loader2 className="animate-spin" /> : <Trash2 />}
        {label}
      </Button>
      {error ? <span className="text-[11px] text-red-400">{error}</span> : null}
    </div>
  );
}
