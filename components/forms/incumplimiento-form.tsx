"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { fechaHoy } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormMessage } from "@/components/forms/form-field";
import { EliminarRegistroButton } from "@/components/eliminar-registro-button";
import { actualizarIncumplimiento, crearIncumplimiento } from "@/lib/actions";
import { incumplimientoSchema, type IncumplimientoInput } from "@/lib/schemas";
import {
  TIPOS_INCUMPLIMIENTO,
  GRAVEDADES,
  type Cuadrilla,
  type Incumplimiento,
  type Tecnico,
} from "@/lib/types";
import { supabaseConfigurado } from "@/lib/env";

export function IncumplimientoForm({
  tecnicos,
  cuadrillas,
  registro,
}: {
  tecnicos: Tecnico[];
  cuadrillas: Cuadrilla[];
  registro?: Incumplimiento;
}) {
  const router = useRouter();
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const form = useForm<IncumplimientoInput>({
    resolver: zodResolver(incumplimientoSchema),
    defaultValues: {
      fecha: registro?.fecha ?? fechaHoy(),
      tecnico_id: registro?.tecnico_id ?? "",
      cuadrilla_id: registro?.cuadrilla_id ?? "",
      tipo_incumplimiento: registro?.tipo_incumplimiento ?? TIPOS_INCUMPLIMIENTO[0],
      gravedad: registro?.gravedad ?? "Leve",
      descripcion: registro?.descripcion ?? "",
    },
  });

  const { register, handleSubmit, formState, reset, setValue } = form;

  function onTecnicoChange(id: string) {
    const tecnico = tecnicos.find((t) => t.id === id);
    if (tecnico?.cuadrilla_actual_id) setValue("cuadrilla_id", tecnico.cuadrilla_actual_id);
  }

  async function onSubmit(values: IncumplimientoInput) {
    setMensaje(null);
    const result = registro
      ? await actualizarIncumplimiento(registro.id, values)
      : await crearIncumplimiento(values);
    if (!result.ok) {
      setMensaje({ tipo: "error", texto: result.error ?? "Error al guardar." });
      return;
    }
    setMensaje({
      tipo: "ok",
      texto: result.demo
        ? "Incumplimiento validado (modo demostración, no se persistió)."
        : registro
          ? "Incumplimiento actualizado correctamente."
          : "Incumplimiento registrado correctamente.",
    });
    if (registro && !result.demo) {
      router.push("/incumplimientos");
      router.refresh();
      return;
    }
    reset({
      ...values,
      tecnico_id: "",
      descripcion: "",
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-400" /> Registro de incumplimiento
          </CardTitle>
          <CardDescription>
            Carga rápida de faltas con el listado oficial de tipos y nivel de gravedad.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Fecha" htmlFor="fecha" error={formState.errors.fecha?.message}>
            <Input id="fecha" type="date" {...register("fecha")} />
          </Field>
          <Field label="Técnico" htmlFor="tecnico_id" error={formState.errors.tecnico_id?.message}>
            <Select
              id="tecnico_id"
              {...register("tecnico_id", { onChange: (e) => onTecnicoChange(e.target.value) })}
            >
              <option value="">Seleccionar técnico</option>
              {tecnicos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre_completo} · {t.legajo}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Cuadrilla" htmlFor="cuadrilla_id" error={formState.errors.cuadrilla_id?.message}>
            <Select id="cuadrilla_id" {...register("cuadrilla_id")}>
              <option value="">Seleccionar cuadrilla</option>
              {cuadrillas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Tipo de incumplimiento"
            htmlFor="tipo_incumplimiento"
            className="sm:col-span-2"
            error={formState.errors.tipo_incumplimiento?.message}
          >
            <Select id="tipo_incumplimiento" {...register("tipo_incumplimiento")}>
              {TIPOS_INCUMPLIMIENTO.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Gravedad" htmlFor="gravedad" error={formState.errors.gravedad?.message}>
            <Select id="gravedad" {...register("gravedad")}>
              {GRAVEDADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Descripción / contexto"
            htmlFor="descripcion"
            className="sm:col-span-2 lg:col-span-3"
            hint="Detalla lo ocurrido para respaldar la trazabilidad del evento."
          >
            <Textarea
              id="descripcion"
              placeholder="Describe brevemente la situación observada..."
              {...register("descripcion")}
            />
          </Field>
        </CardContent>
      </Card>

      {mensaje ? <FormMessage {...mensaje} /> : null}
      {!supabaseConfigurado ? (
        <p className="text-[11px] text-muted-foreground">
          Modo demostración: los formularios validan la carga pero no escriben en Supabase.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        {registro ? (
          <EliminarRegistroButton tipo="incumplimiento" id={registro.id} redirectTo="/incumplimientos" />
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={() => router.push("/incumplimientos")}>
            {registro ? "Cancelar" : "Ver incumplimientos"}
          </Button>
          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
            {registro ? "Guardar cambios" : "Registrar incumplimiento"}
          </Button>
        </div>
      </div>
    </form>
  );
}
