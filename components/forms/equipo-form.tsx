"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PackageCheck, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { fechaHoy } from "@/lib/utils";
import { Field, FormMessage } from "@/components/forms/form-field";
import { EliminarRegistroButton } from "@/components/eliminar-registro-button";
import { actualizarEquipo, crearEquipo } from "@/lib/actions";
import { equipoSchema, type EquipoInput } from "@/lib/schemas";
import {
  DESTINOS_EQUIPO,
  ESTADOS_RECEPCION,
  TIPOS_EQUIPO,
  type Cuadrilla,
  type MovimientoEquipo,
  type Tecnico,
} from "@/lib/types";
import { supabaseConfigurado } from "@/lib/env";

export function EquipoForm({
  tecnicos,
  cuadrillas,
  registro,
}: {
  tecnicos: Tecnico[];
  cuadrillas: Cuadrilla[];
  registro?: MovimientoEquipo;
}) {
  const router = useRouter();
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const form = useForm<EquipoInput>({
    resolver: zodResolver(equipoSchema),
    defaultValues: {
      fecha_recuperacion: registro?.fecha_recuperacion ?? fechaHoy(),
      cuadrilla_id: registro?.cuadrilla_id ?? "",
      tecnico_id: registro?.tecnico_id ?? "",
      cliente_abonado: registro?.cliente_abonado ?? "",
      tipo_equipo: registro?.tipo_equipo ?? "ONU",
      marca_modelo: registro?.marca_modelo ?? "",
      numero_serie: registro?.numero_serie ?? "",
      estado_recepcion: registro?.estado_recepcion ?? "Operativo",
      destino_equipo: registro?.destino_equipo ?? "Stock disponible",
    },
  });

  const { register, handleSubmit, formState, reset, setValue } = form;

  function onTecnicoChange(id: string) {
    const tecnico = tecnicos.find((t) => t.id === id);
    if (tecnico?.cuadrilla_actual_id) setValue("cuadrilla_id", tecnico.cuadrilla_actual_id);
  }

  async function onSubmit(values: EquipoInput) {
    setMensaje(null);
    const result = registro
      ? await actualizarEquipo(registro.id, values)
      : await crearEquipo(values);
    if (!result.ok) {
      setMensaje({ tipo: "error", texto: result.error ?? "Error al guardar." });
      return;
    }
    setMensaje({
      tipo: "ok",
      texto: result.demo
        ? "Movimiento de equipo validado (modo demostración, no se persistió)."
        : registro
          ? "Equipo actualizado correctamente."
          : "Equipo registrado correctamente.",
    });
    if (registro && !result.demo) {
      router.push("/informes/equipos");
      router.refresh();
      return;
    }
    reset({
      ...values,
      tecnico_id: "",
      cuadrilla_id: "",
      cliente_abonado: "",
      marca_modelo: "",
      numero_serie: "",
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackageCheck className="size-4 text-primary" /> Recuperación y movimiento de equipos
          </CardTitle>
          <CardDescription>
            Registro de equipos retirados de clientes con su estado de recepción y destino final.
            El número de serie es único.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field
            label="Fecha de recuperación"
            htmlFor="fecha_recuperacion"
            error={formState.errors.fecha_recuperacion?.message}
          >
            <Input id="fecha_recuperacion" type="date" {...register("fecha_recuperacion")} />
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
            label="Cliente / abonado"
            htmlFor="cliente_abonado"
            error={formState.errors.cliente_abonado?.message}
          >
            <Input id="cliente_abonado" placeholder="Nombre del cliente o abonado" {...register("cliente_abonado")} />
          </Field>
          <Field label="Tipo de equipo" htmlFor="tipo_equipo" error={formState.errors.tipo_equipo?.message}>
            <Select id="tipo_equipo" {...register("tipo_equipo")}>
              {TIPOS_EQUIPO.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Marca / modelo" htmlFor="marca_modelo">
            <Input id="marca_modelo" placeholder="Ej: Huawei HG8245" {...register("marca_modelo")} />
          </Field>
          <Field
            label="Número de serie"
            htmlFor="numero_serie"
            error={formState.errors.numero_serie?.message}
          >
            <Input id="numero_serie" placeholder="SN-000000" {...register("numero_serie")} />
          </Field>
          <Field
            label="Estado de recepción"
            htmlFor="estado_recepcion"
            error={formState.errors.estado_recepcion?.message}
          >
            <Select id="estado_recepcion" {...register("estado_recepcion")}>
              {ESTADOS_RECEPCION.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Destino del equipo"
            htmlFor="destino_equipo"
            error={formState.errors.destino_equipo?.message}
          >
            <Select id="destino_equipo" {...register("destino_equipo")}>
              {DESTINOS_EQUIPO.map((destino) => (
                <option key={destino} value={destino}>
                  {destino}
                </option>
              ))}
            </Select>
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
          <EliminarRegistroButton tipo="equipo" id={registro.id} redirectTo="/informes/equipos" />
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={() => router.push("/informes/equipos")}>
            {registro ? "Cancelar" : "Ver manifiesto"}
          </Button>
          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
            {registro ? "Guardar cambios" : "Registrar equipo"}
          </Button>
        </div>
      </div>
    </form>
  );
}
