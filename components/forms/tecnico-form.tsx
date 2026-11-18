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
import { fechaHoy } from "@/lib/utils";
import { Field, FormMessage } from "@/components/forms/form-field";
import { EliminarDefinitivoButton } from "@/components/eliminar-definitivo-button";
import { actualizarTecnico, crearTecnico } from "@/lib/actions";
import { tecnicoSchema, type TecnicoInput } from "@/lib/schemas";
import type { Cuadrilla, Tecnico } from "@/lib/types";
import { supabaseConfigurado } from "@/lib/env";

export function TecnicoForm({
  tecnico,
  cuadrillas,
}: {
  tecnico?: Tecnico;
  cuadrillas: Cuadrilla[];
}) {
  const router = useRouter();
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const form = useForm<TecnicoInput>({
    resolver: zodResolver(tecnicoSchema),
    defaultValues: {
      nombre_completo: tecnico?.nombre_completo ?? "",
      legajo: tecnico?.legajo ?? "",
      cuadrilla_actual_id: tecnico?.cuadrilla_actual_id ?? "",
      fecha_ingreso: tecnico?.fecha_ingreso ?? fechaHoy(),
      activo: tecnico?.activo ?? true,
    },
  });

  const { register, handleSubmit, formState } = form;

  async function onSubmit(values: TecnicoInput) {
    setMensaje(null);

    if (tecnico?.activo && !values.activo) {
      const confirmado = window.confirm(
        "El técnico quedará inactivo y no aparecerá en nuevas cargas diarias. Su historial se conserva. ¿Continuar?",
      );
      if (!confirmado) return;
    }

    const result = tecnico
      ? await actualizarTecnico(tecnico.id, values)
      : await crearTecnico(values);

    if (!result.ok) {
      setMensaje({ tipo: "error", texto: result.error ?? "Error al guardar." });
      return;
    }

    setMensaje({
      tipo: "ok",
      texto: result.demo
        ? "Datos validados (modo demostración, no se persistió)."
        : tecnico
          ? "Técnico actualizado correctamente."
          : "Técnico creado correctamente.",
    });

    if (!result.demo) {
      router.push("/tecnicos");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>{tecnico ? "Editar técnico" : "Nuevo técnico"}</CardTitle>
          <CardDescription>
            La reasignación de cuadrilla es inmediata; los registros históricos conservan la
            cuadrilla en la que operó cada día.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Nombre completo"
            htmlFor="nombre_completo"
            error={formState.errors.nombre_completo?.message}
          >
            <Input id="nombre_completo" placeholder="Nombre y apellidos" {...register("nombre_completo")} />
          </Field>
          <Field label="Legajo" htmlFor="legajo" error={formState.errors.legajo?.message}>
            <Input id="legajo" placeholder="LEG-0001" {...register("legajo")} />
          </Field>
          <Field label="Cuadrilla actual" htmlFor="cuadrilla_actual_id">
            <Select id="cuadrilla_actual_id" {...register("cuadrilla_actual_id")}>
              <option value="">Sin asignar</option>
              {cuadrillas
                .filter((c) => c.activa || c.id === tecnico?.cuadrilla_actual_id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
            </Select>
          </Field>
          <Field
            label="Fecha de ingreso"
            htmlFor="fecha_ingreso"
            error={formState.errors.fecha_ingreso?.message}
          >
            <Input id="fecha_ingreso" type="date" {...register("fecha_ingreso")} />
          </Field>
          <label className="flex cursor-pointer items-center gap-2.5 rounded-md border border-border bg-background/40 px-3 py-2.5 text-xs sm:col-span-2">
            <input
              type="checkbox"
              {...register("activo")}
              className="size-4 rounded border-border accent-[hsl(var(--primary))]"
            />
            <span>
              Técnico activo
              <span className="ml-2 text-muted-foreground">
                (desmarca para darlo de baja sin perder su historial)
              </span>
            </span>
          </label>
        </CardContent>
      </Card>

      {mensaje ? <FormMessage {...mensaje} /> : null}
      {!supabaseConfigurado ? (
        <p className="text-[11px] text-muted-foreground">
          Modo demostración: los cambios no se persisten en Supabase.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        {tecnico ? (
          <EliminarDefinitivoButton
            tipo="tecnico"
            id={tecnico.id}
            nombre={tecnico.nombre_completo}
            redirectTo="/tecnicos"
          />
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={() => router.push("/tecnicos")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
            {tecnico ? "Guardar cambios" : "Crear técnico"}
          </Button>
        </div>
      </div>
    </form>
  );
}
