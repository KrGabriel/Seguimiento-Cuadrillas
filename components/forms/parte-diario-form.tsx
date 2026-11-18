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
import { Textarea } from "@/components/ui/textarea";
import { Field, FormMessage } from "@/components/forms/form-field";
import { EliminarRegistroButton } from "@/components/eliminar-registro-button";
import { actualizarParteDiario, crearParteDiario } from "@/lib/actions";
import { parteDiarioSchema, type ParteDiarioInput } from "@/lib/schemas";
import { supabaseConfigurado } from "@/lib/env";
import type { Cuadrilla, RegistroDiario, Tecnico } from "@/lib/types";

const EJES: { name: keyof ParteDiarioInput; label: string }[] = [
  { name: "puntualidad", label: "Puntualidad" },
  { name: "uniforme", label: "Uniforme" },
  { name: "responsabilidad", label: "Responsabilidad" },
  { name: "cumplimiento_tareas", label: "Cumplimiento de tareas" },
  { name: "companerismo", label: "Compañerismo" },
  { name: "comunicacion_supervision", label: "Comunicación con supervisión" },
];

export function ParteDiarioForm({
  tecnicos,
  cuadrillas,
  registro,
}: {
  tecnicos: Tecnico[];
  cuadrillas: Cuadrilla[];
  registro?: RegistroDiario;
}) {
  const router = useRouter();
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const form = useForm<ParteDiarioInput>({
    resolver: zodResolver(parteDiarioSchema),
    defaultValues: {
      fecha: registro?.fecha ?? fechaHoy(),
      tecnico_id: registro?.tecnico_id ?? "",
      cuadrilla_id: registro?.cuadrilla_id ?? "",
      instalaciones_realizadas: registro?.instalaciones_realizadas ?? 0,
      reparaciones_realizadas: registro?.reparaciones_realizadas ?? 0,
      bajas_efectuadas: registro?.bajas_efectuadas ?? 0,
      cambios_domicilio: registro?.cambios_domicilio ?? 0,
      trabajos_pendientes: registro?.trabajos_pendientes ?? 0,
      puntualidad: registro?.puntualidad ?? 3,
      uniforme: registro?.uniforme ?? 3,
      responsabilidad: registro?.responsabilidad ?? 3,
      cumplimiento_tareas: registro?.cumplimiento_tareas ?? 3,
      companerismo: registro?.companerismo ?? 3,
      comunicacion_supervision: registro?.comunicacion_supervision ?? 3,
      notas_observacion: registro?.notas_observacion ?? "",
    },
  });

  const { register, handleSubmit, formState, reset, setValue } = form;

  function onTecnicoChange(id: string) {
    const tecnico = tecnicos.find((t) => t.id === id);
    if (tecnico?.cuadrilla_actual_id) setValue("cuadrilla_id", tecnico.cuadrilla_actual_id);
  }

  async function onSubmit(values: ParteDiarioInput) {
    setMensaje(null);
    const result = registro
      ? await actualizarParteDiario(registro.id, values)
      : await crearParteDiario(values);
    if (!result.ok) {
      setMensaje({ tipo: "error", texto: result.error ?? "Error al guardar." });
      return;
    }
    setMensaje({
      tipo: "ok",
      texto: result.demo
        ? "Parte diario validado correctamente (modo demostración, no se persistió)."
        : registro
          ? "Parte diario actualizado correctamente."
          : "Parte diario guardado correctamente.",
    });
    if (registro && !result.demo) {
      router.push("/carga");
      router.refresh();
      return;
    }
    reset({
      ...values,
      tecnico_id: "",
      instalaciones_realizadas: 0,
      reparaciones_realizadas: 0,
      bajas_efectuadas: 0,
      cambios_domicilio: 0,
      trabajos_pendientes: 0,
      notas_observacion: "",
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Identificación del parte</CardTitle>
          <CardDescription>
            La cuadrilla se completa automáticamente según el técnico, pero puede cambiarse si ese
            día cubrió otra zona. El registro conserva ambas referencias.
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
              {tecnicos
                .filter((t) => t.activo)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre_completo} · {t.legajo}
                  </option>
                ))}
            </Select>
          </Field>
          <Field label="Cuadrilla del día" htmlFor="cuadrilla_id" error={formState.errors.cuadrilla_id?.message}>
            <Select id="cuadrilla_id" {...register("cuadrilla_id")}>
              <option value="">Seleccionar cuadrilla</option>
              {cuadrillas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </Select>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rendimiento técnico</CardTitle>
          <CardDescription>Cantidades ejecutadas durante la jornada.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { name: "instalaciones_realizadas", label: "Instalaciones" },
            { name: "reparaciones_realizadas", label: "Reparaciones" },
            { name: "bajas_efectuadas", label: "Bajas efectuadas" },
            { name: "cambios_domicilio", label: "Cambios de domicilio" },
            { name: "trabajos_pendientes", label: "Trabajos pendientes" },
          ].map((item) => (
            <Field key={item.name} label={item.label} htmlFor={item.name}>
              <Input
                id={item.name}
                type="number"
                min={0}
                {...register(item.name as keyof ParteDiarioInput, { valueAsNumber: true })}
              />
            </Field>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evaluación de actitud y conducta</CardTitle>
          <CardDescription>Escala de 1 (muy bajo) a 5 (excelente).</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EJES.map((eje) => (
            <Field key={eje.name} label={eje.label} htmlFor={eje.name}>
              <Select
                id={eje.name}
                {...register(eje.name as keyof ParteDiarioInput, { valueAsNumber: true })}
              >
                <option value={1}>1 · Muy bajo</option>
                <option value={2}>2 · Bajo</option>
                <option value={3}>3 · Aceptable</option>
                <option value={4}>4 · Bueno</option>
                <option value={5}>5 · Excelente</option>
              </Select>
            </Field>
          ))}
          <Field
            label="Notas y observación del día"
            htmlFor="notas_observacion"
            className="sm:col-span-2 lg:col-span-3"
            hint="Registra eventos positivos o negativos relevantes para el seguimiento."
          >
            <Textarea
              id="notas_observacion"
              placeholder="Ej: Excelente disposición para apoyar a otra cuadrilla..."
              {...register("notas_observacion")}
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
          <EliminarRegistroButton tipo="parte" id={registro.id} redirectTo="/carga" />
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={() => router.push("/carga")}>
            {registro ? "Cancelar" : "Ver registros"}
          </Button>
          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
            {registro ? "Guardar cambios" : "Guardar parte diario"}
          </Button>
        </div>
      </div>
    </form>
  );
}
