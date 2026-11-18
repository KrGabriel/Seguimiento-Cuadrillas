export type EstadoVehiculo = "Operativo" | "Mantenimiento" | "Limpieza" | "Herramientas";
export type GravedadIncumplimiento = "Leve" | "Moderada" | "Grave";
export type EstadoRecepcion = "Operativo" | "Dañado" | "Para revisión";
export type DestinoEquipo = "Stock disponible" | "Laboratorio/Reparación" | "Baja definitiva";

export const TIPOS_INCUMPLIMIENTO = [
  "Errores al descontar materiales en iClass",
  "Falta de optimización de materiales",
  "Tareas sin finalizar",
  "Incumplimiento de procedimientos",
  "Falta de uniforme",
  "Falta de candado de seguridad en escaleras",
  "Portones abiertos",
] as const;

export type TipoIncumplimiento = (typeof TIPOS_INCUMPLIMIENTO)[number];

export const ESTADOS_VEHICULO: EstadoVehiculo[] = [
  "Operativo",
  "Mantenimiento",
  "Limpieza",
  "Herramientas",
];

export const GRAVEDADES: GravedadIncumplimiento[] = ["Leve", "Moderada", "Grave"];
export const ESTADOS_RECEPCION: EstadoRecepcion[] = ["Operativo", "Dañado", "Para revisión"];
export const DESTINOS_EQUIPO: DestinoEquipo[] = [
  "Stock disponible",
  "Laboratorio/Reparación",
  "Baja definitiva",
];
export const TIPOS_EQUIPO = ["ONU", "Router", "Decodificador", "ONT", "Módem", "Otro"];

export type Cuadrilla = {
  id: string;
  nombre: string;
  vehiculo_asignado: string | null;
  estado_vehiculo: EstadoVehiculo;
  activa: boolean;
  created_at: string;
};

export type Tecnico = {
  id: string;
  nombre_completo: string;
  legajo: string;
  cuadrilla_actual_id: string | null;
  activo: boolean;
  fecha_ingreso: string;
  created_at?: string;
};

export type ReferenciaTecnico = Pick<Tecnico, "id" | "nombre_completo" | "legajo">;
export type ReferenciaCuadrilla = Pick<Cuadrilla, "id" | "nombre">;

export type RegistroDiario = {
  id: string;
  fecha: string;
  tecnico_id: string;
  cuadrilla_id: string;
  instalaciones_realizadas: number;
  reparaciones_realizadas: number;
  bajas_efectuadas: number;
  cambios_domicilio: number;
  trabajos_pendientes: number;
  puntualidad: number;
  uniforme: number;
  responsabilidad: number;
  cumplimiento_tareas: number;
  companerismo: number;
  comunicacion_supervision: number;
  notas_observacion: string | null;
};

export type RegistroDiarioDetalle = RegistroDiario & {
  tecnico: ReferenciaTecnico | null;
  cuadrilla: ReferenciaCuadrilla | null;
};

export type Incumplimiento = {
  id: string;
  fecha: string;
  tecnico_id: string;
  cuadrilla_id: string;
  tipo_incumplimiento: TipoIncumplimiento;
  gravedad: GravedadIncumplimiento;
  descripcion: string | null;
};

export type IncumplimientoDetalle = Incumplimiento & {
  tecnico: ReferenciaTecnico | null;
  cuadrilla: ReferenciaCuadrilla | null;
};

export type MetricaCuadrilla = {
  id: string;
  fecha: string;
  cuadrilla_id: string;
  ordenes_asignadas: number;
  ordenes_finalizadas: number;
  ordenes_pendientes: number;
  trabajos_con_reclamos: number;
  materiales_utilizados: number;
  materiales_recuperados: number;
  observaciones_seguridad: string | null;
  estado_vehiculo_check: EstadoVehiculo | null;
};

export type MetricaCuadrillaDetalle = MetricaCuadrilla & {
  cuadrilla: ReferenciaCuadrilla | null;
};

export type MovimientoEquipo = {
  id: string;
  fecha_recuperacion: string;
  cuadrilla_id: string;
  tecnico_id: string;
  cliente_abonado: string;
  tipo_equipo: string;
  marca_modelo: string | null;
  numero_serie: string;
  estado_recepcion: EstadoRecepcion;
  destino_equipo: DestinoEquipo;
};

export type MovimientoEquipoDetalle = MovimientoEquipo & {
  tecnico: ReferenciaTecnico | null;
  cuadrilla: ReferenciaCuadrilla | null;
};

export type EvaluacionPromedio = {
  puntualidad: number;
  uniforme: number;
  responsabilidad: number;
  cumplimiento_tareas: number;
  companerismo: number;
  comunicacion_supervision: number;
};
