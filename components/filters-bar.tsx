import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Cuadrilla, Tecnico } from "@/lib/types";
import { GRAVEDADES, TIPOS_INCUMPLIMIENTO } from "@/lib/types";

type Props = {
  tecnicos?: Tecnico[];
  cuadrillas?: Cuadrilla[];
  desde?: string;
  hasta?: string;
  tecnicoId?: string;
  cuadrillaId?: string;
  q?: string;
  estado?: string;
  destino?: string;
  gravedad?: string;
  tipo?: string;
  mostrarTecnico?: boolean;
  mostrarCuadrilla?: boolean;
  mostrarBusqueda?: boolean;
  mostrarEstado?: boolean;
  mostrarDestino?: boolean;
  mostrarGravedad?: boolean;
  mostrarTipo?: boolean;
  preservar?: Record<string, string | undefined>;
};

export function FiltersBar({
  tecnicos = [],
  cuadrillas = [],
  desde,
  hasta,
  tecnicoId,
  cuadrillaId,
  q,
  estado,
  destino,
  gravedad,
  tipo,
  mostrarTecnico = true,
  mostrarCuadrilla = true,
  mostrarBusqueda = false,
  mostrarEstado = false,
  mostrarDestino = false,
  mostrarGravedad = false,
  mostrarTipo = false,
  preservar = {},
}: Props) {
  return (
    <Card className="p-4">
      <form method="get" className="grid gap-3 md:grid-cols-2 xl:grid-cols-6 xl:items-end">
        {Object.entries(preservar).map(([key, value]) =>
          value ? <input key={key} type="hidden" name={key} value={value} /> : null,
        )}

        <div className="space-y-1.5">
          <Label htmlFor="desde">Desde</Label>
          <Input id="desde" name="desde" type="date" defaultValue={desde} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="hasta">Hasta</Label>
          <Input id="hasta" name="hasta" type="date" defaultValue={hasta} />
        </div>

        {mostrarTecnico ? (
          <div className="space-y-1.5">
            <Label htmlFor="tecnico">Técnico</Label>
            <Select id="tecnico" name="tecnico" defaultValue={tecnicoId ?? ""}>
              <option value="">Todos los técnicos</option>
              {tecnicos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre_completo} · {t.legajo}
                </option>
              ))}
            </Select>
          </div>
        ) : null}

        {mostrarCuadrilla ? (
          <div className="space-y-1.5">
            <Label htmlFor="cuadrilla">Cuadrilla</Label>
            <Select id="cuadrilla" name="cuadrilla" defaultValue={cuadrillaId ?? ""}>
              <option value="">Todas las cuadrillas</option>
              {cuadrillas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </Select>
          </div>
        ) : null}

        {mostrarBusqueda ? (
          <div className="space-y-1.5 xl:col-span-2">
            <Label htmlFor="q">Búsqueda rápida</Label>
            <Input
              id="q"
              name="q"
              placeholder="N° de serie o cliente / abonado"
              defaultValue={q}
            />
          </div>
        ) : null}

        {mostrarEstado ? (
          <div className="space-y-1.5">
            <Label htmlFor="estado">Estado recepción</Label>
            <Select id="estado" name="estado" defaultValue={estado ?? ""}>
              <option value="">Todos los estados</option>
              <option value="Operativo">Operativo</option>
              <option value="Dañado">Dañado</option>
              <option value="Para revisión">Para revisión</option>
            </Select>
          </div>
        ) : null}

        {mostrarDestino ? (
          <div className="space-y-1.5">
            <Label htmlFor="destino">Destino</Label>
            <Select id="destino" name="destino" defaultValue={destino ?? ""}>
              <option value="">Todos los destinos</option>
              <option value="Stock disponible">Stock disponible</option>
              <option value="Laboratorio/Reparación">Laboratorio/Reparación</option>
              <option value="Baja definitiva">Baja definitiva</option>
            </Select>
          </div>
        ) : null}

        {mostrarTipo ? (
          <div className="space-y-1.5 xl:col-span-2">
            <Label htmlFor="tipo">Tipo de incumplimiento</Label>
            <Select id="tipo" name="tipo" defaultValue={tipo ?? ""}>
              <option value="">Todos los tipos</option>
              {TIPOS_INCUMPLIMIENTO.map((valor) => (
                <option key={valor} value={valor}>
                  {valor}
                </option>
              ))}
            </Select>
          </div>
        ) : null}

        {mostrarGravedad ? (
          <div className="space-y-1.5">
            <Label htmlFor="gravedad">Gravedad</Label>
            <Select id="gravedad" name="gravedad" defaultValue={gravedad ?? ""}>
              <option value="">Todas</option>
              {GRAVEDADES.map((valor) => (
                <option key={valor} value={valor}>
                  {valor}
                </option>
              ))}
            </Select>
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <Button type="submit" className="flex-1">
            Filtrar
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="?">Limpiar</Link>
          </Button>
        </div>
      </form>
    </Card>
  );
}
