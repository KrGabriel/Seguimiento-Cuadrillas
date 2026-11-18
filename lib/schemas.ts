import { z } from "zod";
import {
  DESTINOS_EQUIPO,
  ESTADOS_RECEPCION,
  ESTADOS_VEHICULO,
  GRAVEDADES,
  TIPOS_INCUMPLIMIENTO,
} from "@/lib/types";
import { fechaHoy } from "@/lib/utils";

const numeroNoNegativo = z.coerce.number().int().min(0, "No puede ser negativo");
const calificacion = z.coerce.number().int().min(1).max(5);

const fechaISO = z
  .string()
  .min(1, "Selecciona una fecha")
  .refine((valor) => valor <= fechaHoy(), {
    message: "La fecha no puede ser futura",
  });

export const parteDiarioSchema = z.object({
  fecha: fechaISO,
  tecnico_id: z.string().min(1, "Selecciona un técnico"),
  cuadrilla_id: z.string().min(1, "Selecciona una cuadrilla"),
  instalaciones_realizadas: numeroNoNegativo,
  reparaciones_realizadas: numeroNoNegativo,
  bajas_efectuadas: numeroNoNegativo,
  cambios_domicilio: numeroNoNegativo,
  trabajos_pendientes: numeroNoNegativo,
  puntualidad: calificacion,
  uniforme: calificacion,
  responsabilidad: calificacion,
  cumplimiento_tareas: calificacion,
  companerismo: calificacion,
  comunicacion_supervision: calificacion,
  notas_observacion: z.string().max(1000).optional().or(z.literal("")),
});

export type ParteDiarioInput = z.infer<typeof parteDiarioSchema>;

export const incumplimientoSchema = z.object({
  fecha: fechaISO,
  tecnico_id: z.string().min(1, "Selecciona un técnico"),
  cuadrilla_id: z.string().min(1, "Selecciona una cuadrilla"),
  tipo_incumplimiento: z.enum(TIPOS_INCUMPLIMIENTO),
  gravedad: z.enum(GRAVEDADES as [string, ...string[]]),
  descripcion: z.string().max(1000).optional().or(z.literal("")),
  evidencia_url: z.string().url("URL de evidencia inválida").optional().or(z.literal("")),
});

export type IncumplimientoInput = z.infer<typeof incumplimientoSchema>;

export const operativoSchema = z
  .object({
    fecha: fechaISO,
    cuadrilla_id: z.string().min(1, "Selecciona una cuadrilla"),
    ordenes_asignadas: numeroNoNegativo,
    ordenes_finalizadas: numeroNoNegativo,
    ordenes_pendientes: numeroNoNegativo,
    trabajos_con_reclamos: numeroNoNegativo,
    materiales_utilizados: numeroNoNegativo,
    materiales_recuperados: numeroNoNegativo,
    observaciones_seguridad: z.string().max(1000).optional().or(z.literal("")),
    estado_vehiculo_check: z.enum(ESTADOS_VEHICULO as [string, ...string[]]).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.ordenes_finalizadas > data.ordenes_asignadas) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ordenes_finalizadas"],
        message: "No puede superar las órdenes asignadas",
      });
    }
    if (data.ordenes_pendientes > data.ordenes_asignadas) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ordenes_pendientes"],
        message: "No puede superar las órdenes asignadas",
      });
    }
  });

export type OperativoInput = z.infer<typeof operativoSchema>;

export const equipoSchema = z.object({
  fecha_recuperacion: fechaISO,
  cuadrilla_id: z.string().min(1, "Selecciona una cuadrilla"),
  tecnico_id: z.string().min(1, "Selecciona un técnico"),
  cliente_abonado: z.string().min(2, "Ingresa el cliente o abonado"),
  tipo_equipo: z.string().min(1, "Ingresa el tipo de equipo"),
  marca_modelo: z.string().max(120).optional().or(z.literal("")),
  numero_serie: z.string().min(3, "Ingresa el número de serie"),
  estado_recepcion: z.enum(ESTADOS_RECEPCION as [string, ...string[]]),
  destino_equipo: z.enum(DESTINOS_EQUIPO as [string, ...string[]]),
  evidencia_url: z.string().url("URL de evidencia inválida").optional().or(z.literal("")),
});

export type EquipoInput = z.infer<typeof equipoSchema>;

export const tecnicoSchema = z.object({
  nombre_completo: z.string().min(3, "Ingresa el nombre completo"),
  legajo: z.string().min(1, "Ingresa el legajo"),
  cuadrilla_actual_id: z.string().optional().or(z.literal("")),
  fecha_ingreso: z.string().min(1, "Selecciona la fecha de ingreso"),
  activo: z.boolean(),
});

export type TecnicoInput = z.infer<typeof tecnicoSchema>;

export const cuadrillaSchema = z.object({
  nombre: z.string().min(2, "Ingresa el nombre de la cuadrilla"),
  vehiculo_asignado: z.string().max(60).optional().or(z.literal("")),
  estado_vehiculo: z.enum(ESTADOS_VEHICULO as [string, ...string[]]),
  activa: z.boolean(),
});

export type CuadrillaInput = z.infer<typeof cuadrillaSchema>;
