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
import { actualizarOperativo, crearOperativo } from "@/lib/actions";
import { operativoSchema, type OperativoInput } from "@/lib/schemas";
import { ESTADOS_VEHICULO, type Cuadrilla, type MetricaCuadrilla } from "@/lib/types";
import { supabaseConfigurado } from "@/lib/env";

export function OperativoForm({
  cuadrillas,
  registro,
}: {
  cuadrillas: Cuadrilla[];
  registro?: MetricaCuadrilla;
}) {
  const router = useRouter();
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const form = useForm<OperativoInput>({
    resolver: zodResolver(operativoSchema),
    defaultValues: {
      fecha: registro?.fecha ?? fechaHoy(),
      cuadrilla_id: registro?.cuadrilla_id ?? "",
      ordenes_asignadas: registro?.ordenes_asignadas ?? 0,
      ordenes_finalizadas: registro?.ordenes_finalizadas ?? 0,
      ordenes_pendientes: registro?.ordenes_pendientes ?? 0,
      trabajos_con_reclamos: registro?.trabajos_con_reclamos ?? 0,
      materiales_utilizados: registro?.materiales_utilizados ?? 0,
      materiales_recuperados: registro?.materiales_recuperados ?? 0,
      observaciones_seguridad: registro?.observaciones_seguridad ?? "",
      estado_vehiculo_check: registro?.estado_vehiculo_check ?? "",
    },
  });

  const { register, handleSubmit, formState, reset } = form;

  async function onSubmit(values: OperativoInput) {
    setMensaje(null);
    const result = registro
      ? await actualizarOperativo(registro.id, values)
      : await crearOperativo(values);
    if (!result.ok) {
      setMensaje({ tipo: "error", texto: result.error ?? "Error al guardar." });
      return;
    }
    setMensaje({
      tipo: "ok",
      texto: result.demo
        ? "Control operativo validado (modo demostración, no se persistió)."
        : registro
          ? "Control operativo actualizado correctamente."
          : "Control operativo guardado correctamente.",
    });
    if (registro && !result.demo) {
      router.push("/operativo");
      router.refresh();
      return;
    }
    reset({
      ...values,
      cuadrilla_id: "",
      ordenes_asignadas: 0,
      ordenes_finalizadas: 0,
      ordenes_pendientes: 0,
      trabajos_con_reclamos: 0,
      materiales_utilizados: 0,
      materiales_recuperados: 0,
      observaciones_seguridad: "",
      estado_vehiculo_check: "",
    });
  }

  const campos = [
    { name: "ordenes_asignadas", label: "Órdenes asignadas" },
    { name: "ordenes_finalizadas", label: "Órdenes finalizadas" },
    { name: "ordenes_pendientes", label: "Órdenes pendientes" },
    { name: "trabajos_con_reclamos", label: "Trabajos con reclamos" },
    { name: "materiales_utilizados", label: "Materiales utilizados" },
    { name: "materiales_recuperados", label: "Materiales recuperados" },
  ] as const;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Control operativo de cuadrilla</CardTitle>
          <CardDescription>
            Balance diario de órdenes, reclamos posteriores y materiales. Un registro por cuadrilla
            y fecha.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Fecha" htmlFor="fecha" error={formState.errors.fecha?.message}>
            <Input id="fecha" type="date" {...register("fecha")} />
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
          <Field label="Estado del vehículo (check)" htmlFor="estado_vehiculo_check">
            <Select id="estado_vehiculo_check" {...register("estado_vehiculo_check")}>
              <option value="">Sin novedad registrada</option>
              {ESTADOS_VEHICULO.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </Select>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Órdenes y materiales</CardTitle>
          <CardDescription>
            El porcentaje de cumplimiento se calcula automáticamente en los informes.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campos.map((campo) => (
            <Field
              key={campo.name}
              label={campo.label}
              htmlFor={campo.name}
              error={formState.errors[campo.name]?.message}
            >
              <Input id={campo.name} type="number" min={0} {...register(campo.name, { valueAsNumber: true })} />
            </Field>
          ))}
          <Field
            label="Observaciones de seguridad"
            htmlFor="observaciones_seguridad"
            className="sm:col-span-2 lg:col-span-3"
          >
            <Textarea
              id="observaciones_seguridad"
              placeholder="Novedades de seguridad, EPP, herramientas o estado del vehículo..."
              {...register("observaciones_seguridad")}
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
          <EliminarRegistroButton tipo="operativo" id={registro.id} redirectTo="/operativo" />
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={() => router.push("/operativo")}>
            {registro ? "Cancelar" : "Ver controles"}
          </Button>
          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
            {registro ? "Guardar cambios" : "Guardar control operativo"}
          </Button>
        </div>
      </div>
    </form>
  );
}
