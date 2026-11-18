"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field, FormMessage } from "@/components/forms/form-field";
import { EliminarDefinitivoButton } from "@/components/eliminar-definitivo-button";
import { actualizarCuadrilla, crearCuadrilla } from "@/lib/actions";
import { cuadrillaSchema, type CuadrillaInput } from "@/lib/schemas";
import { ESTADOS_VEHICULO, type Cuadrilla } from "@/lib/types";
import { supabaseConfigurado } from "@/lib/env";

export function CuadrillaForm({
  cuadrilla,
  tecnicosAsignados = 0,
}: {
  cuadrilla?: Cuadrilla;
  tecnicosAsignados?: number;
}) {
  const router = useRouter();
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const form = useForm<CuadrillaInput>({
    resolver: zodResolver(cuadrillaSchema),
    defaultValues: {
      nombre: cuadrilla?.nombre ?? "",
      vehiculo_asignado: cuadrilla?.vehiculo_asignado ?? "",
      estado_vehiculo: cuadrilla?.estado_vehiculo ?? "Operativo",
      activa: cuadrilla?.activa ?? true,
    },
  });

  const { register, handleSubmit, formState } = form;

  async function onSubmit(values: CuadrillaInput) {
    setMensaje(null);

    if (cuadrilla?.activa && !values.activa) {
      if (tecnicosAsignados > 0) {
        setMensaje({
          tipo: "error",
          texto: `No puedes desactivar la cuadrilla: tiene ${tecnicosAsignados} técnico(s) activo(s) asignado(s). Reasígnalos primero desde Técnicos.`,
        });
        return;
      }
      if (
        !window.confirm(
          "¿Desactivar esta cuadrilla? Dejará de estar disponible para nuevas asignaciones.",
        )
      ) {
        return;
      }
    }

    const result = cuadrilla
      ? await actualizarCuadrilla(cuadrilla.id, values)
      : await crearCuadrilla(values);

    if (!result.ok) {
      setMensaje({ tipo: "error", texto: result.error ?? "Error al guardar." });
      return;
    }

    setMensaje({
      tipo: "ok",
      texto: result.demo
        ? "Datos validados (modo demostración, no se persistió)."
        : cuadrilla
          ? "Cuadrilla actualizada correctamente."
          : "Cuadrilla creada correctamente.",
    });

    if (!result.demo) {
      router.push("/cuadrillas");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>{cuadrilla ? "Editar cuadrilla" : "Nueva cuadrilla"}</CardTitle>
          <CardDescription>
            Registra el vehículo asignado y su estado operativo (mantenimiento, limpieza,
            herramientas).
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre" htmlFor="nombre" error={formState.errors.nombre?.message}>
            <Input id="nombre" placeholder="Cuadrilla Norte" {...register("nombre")} />
          </Field>
          <Field label="Vehículo asignado" htmlFor="vehiculo_asignado">
            <Input id="vehiculo_asignado" placeholder="Placa o identificador" {...register("vehiculo_asignado")} />
          </Field>
          <Field
            label="Estado del vehículo"
            htmlFor="estado_vehiculo"
            error={formState.errors.estado_vehiculo?.message}
          >
            <Select id="estado_vehiculo" {...register("estado_vehiculo")}>
              {ESTADOS_VEHICULO.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </Select>
          </Field>
          <label className="flex cursor-pointer items-center gap-2.5 self-end rounded-md border border-border bg-background/40 px-3 py-2.5 text-xs">
            <input
              type="checkbox"
              {...register("activa")}
              className="size-4 rounded border-border accent-[hsl(var(--primary))]"
            />
            Cuadrilla activa
          </label>
          {cuadrilla && tecnicosAsignados > 0 ? (
            <p className="text-[11px] text-amber-400 sm:col-span-2">
              Esta cuadrilla tiene {tecnicosAsignados} técnico(s) activo(s). Debes reasignarlos antes
              de desactivarla.
            </p>
          ) : null}
        </CardContent>
      </Card>

      {mensaje ? <FormMessage {...mensaje} /> : null}
      {!supabaseConfigurado ? (
        <p className="text-[11px] text-muted-foreground">
          Modo demostración: los cambios no se persisten en Supabase.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        {cuadrilla ? (
          <EliminarDefinitivoButton
            tipo="cuadrilla"
            id={cuadrilla.id}
            nombre={cuadrilla.nombre}
            redirectTo="/cuadrillas"
          />
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={() => router.push("/cuadrillas")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
            {cuadrilla ? "Guardar cambios" : "Crear cuadrilla"}
          </Button>
        </div>
      </div>
    </form>
  );
}
