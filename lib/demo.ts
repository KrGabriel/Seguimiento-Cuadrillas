import type {
  Cuadrilla,
  DestinoEquipo,
  EstadoRecepcion,
  EstadoVehiculo,
  GravedadIncumplimiento,
  Incumplimiento,
  MetricaCuadrilla,
  MovimientoEquipo,
  RegistroDiario,
  Tecnico,
  TipoIncumplimiento,
} from "@/lib/types";
import { TIPOS_INCUMPLIMIENTO } from "@/lib/types";
import { toISODate } from "@/lib/utils";

function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20261118);
const entre = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const elegir = <T>(items: readonly T[]): T => items[Math.floor(rand() * items.length)];
const hoy = new Date();

export const demoCuadrillas: Cuadrilla[] = [
  {
    id: "cuad-1",
    nombre: "Cuadrilla Norte",
    vehiculo_asignado: "AB123CD",
    estado_vehiculo: "Operativo",
    activa: true,
    created_at: "2025-01-10T12:00:00.000Z",
  },
  {
    id: "cuad-2",
    nombre: "Cuadrilla Sur",
    vehiculo_asignado: "EF456GH",
    estado_vehiculo: "Limpieza",
    activa: true,
    created_at: "2025-01-10T12:00:00.000Z",
  },
  {
    id: "cuad-3",
    nombre: "Cuadrilla Centro",
    vehiculo_asignado: "IJ789KL",
    estado_vehiculo: "Mantenimiento",
    activa: true,
    created_at: "2025-03-02T12:00:00.000Z",
  },
  {
    id: "cuad-4",
    nombre: "Cuadrilla Occidente",
    vehiculo_asignado: "MN321OP",
    estado_vehiculo: "Herramientas",
    activa: true,
    created_at: "2025-06-15T12:00:00.000Z",
  },
];

const nombresTecnicos = [
  "Andrés Felipe Rojas",
  "Carlos Mario Restrepo",
  "Diana Carolina Pérez",
  "Jhon Alexander Gómez",
  "Laura Marcela Díaz",
  "Luis Fernando Cardona",
  "Miguel Ángel Torres",
  "Natalia Andrea Muñoz",
  "Óscar Iván Ramírez",
  "Paula Andrea Vargas",
  "Santiago Herrera",
  "Yeison Camilo Ortiz",
];

export const demoTecnicos: Tecnico[] = nombresTecnicos.map((nombre, index) => ({
  id: `tec-${index + 1}`,
  nombre_completo: nombre,
  legajo: `LEG-${String(index + 1).padStart(4, "0")}`,
  cuadrilla_actual_id: demoCuadrillas[index % demoCuadrillas.length].id,
  activo: index !== 11,
  fecha_ingreso: `202${4 - (index % 3)}-0${(index % 9) + 1}-1${index % 9}`,
}));

function fechaHaceDias(dias: number) {
  const d = new Date(hoy);
  d.setDate(d.getDate() - dias);
  return d;
}

type DiaGenerado = { fecha: string; tecnico: Tecnico; cuadrillaId: string };

const dias: DiaGenerado[] = [];

for (let offset = 84; offset >= 0; offset--) {
  const fecha = fechaHaceDias(offset);
  if (fecha.getDay() === 0) continue;
  const iso = toISODate(fecha);

  for (const tecnico of demoTecnicos) {
    if (!tecnico.activo && offset < 30) continue;
    const asignada = tecnico.cuadrilla_actual_id ?? demoCuadrillas[0].id;
    const cubreOtra = rand() < 0.12;
    const cuadrillaId = cubreOtra ? elegir(demoCuadrillas).id : asignada;
    if (rand() < 0.04) continue;
    dias.push({ fecha: iso, tecnico, cuadrillaId });
  }
}

export const demoRegistros: RegistroDiario[] = dias.map((dia, index) => {
  const base = entre(2, 7);
  const pendientes = rand() < 0.35 ? entre(1, 3) : 0;
  const esBuenDia = rand() > 0.22;
  const nota = () => (esBuenDia ? entre(4, 5) : entre(2, 4));
  return {
    id: `reg-${index + 1}`,
    fecha: dia.fecha,
    tecnico_id: dia.tecnico.id,
    cuadrilla_id: dia.cuadrillaId,
    instalaciones_realizadas: base,
    reparaciones_realizadas: entre(0, 4),
    bajas_efectuadas: entre(0, 2),
    cambios_domicilio: entre(0, 2),
    trabajos_pendientes: pendientes,
    puntualidad: nota(),
    uniforme: nota(),
    responsabilidad: nota(),
    cumplimiento_tareas: nota(),
    companerismo: nota(),
    comunicacion_supervision: nota(),
    notas_observacion: esBuenDia
      ? rand() < 0.4
        ? "Cumplió con la ruta asignada sin novedades."
        : null
      : "Requiere seguimiento en la organización de materiales.",
  };
});

const gravedades: GravedadIncumplimiento[] = ["Leve", "Leve", "Moderada", "Grave"];

export const demoIncumplimientos: Incumplimiento[] = [];
let incumplimientoIndex = 0;

for (const dia of dias) {
  if (rand() > 0.09) continue;
  const tipo = elegir(TIPOS_INCUMPLIMIENTO) as TipoIncumplimiento;
  incumplimientoIndex += 1;
  demoIncumplimientos.push({
    id: `inc-${incumplimientoIndex}`,
    fecha: dia.fecha,
    tecnico_id: dia.tecnico.id,
    cuadrilla_id: dia.cuadrillaId,
    tipo_incumplimiento: tipo,
    gravedad: elegir(gravedades),
    descripcion:
      tipo === "Portones abiertos"
        ? "Se encontró el portón del depósito sin asegurar al cierre del turno."
        : tipo === "Tareas sin finalizar"
          ? "Orden de trabajo quedó abierta sin justificación registrada."
          : "Occurrencia registrada durante la supervisión en campo.",
  });
}

export const demoMetricas: MetricaCuadrilla[] = [];
let metricaIndex = 0;

for (let offset = 84; offset >= 0; offset--) {
  const fecha = fechaHaceDias(offset);
  if (fecha.getDay() === 0) continue;
  const iso = toISODate(fecha);

  for (const cuadrilla of demoCuadrillas) {
    const asignadas = entre(8, 18);
    const finalizadas = Math.max(0, asignadas - entre(0, 3));
    metricaIndex += 1;
    demoMetricas.push({
      id: `met-${metricaIndex}`,
      fecha: iso,
      cuadrilla_id: cuadrilla.id,
      ordenes_asignadas: asignadas,
      ordenes_finalizadas: finalizadas,
      ordenes_pendientes: asignadas - finalizadas,
      trabajos_con_reclamos: rand() < 0.5 ? entre(0, 2) : 0,
      materiales_utilizados: entre(12, 40),
      materiales_recuperados: entre(6, 24),
      observaciones_seguridad:
        rand() < 0.18 ? "Se reforzó el uso de candado de seguridad en escaleras." : null,
      estado_vehiculo_check: cuadrilla.estado_vehiculo as EstadoVehiculo,
    });
  }
}

const tiposEquipo = ["ONU", "Router", "Decodificador", "ONT", "Módem"];
const marcasModelo = [
  "Huawei HG8245",
  "ZTE F670L",
  "Nokia G-140W",
  "Technicolor CGA2121",
  "Arris TG2482",
];
const estadosRecepcion: EstadoRecepcion[] = ["Operativo", "Operativo", "Dañado", "Para revisión"];
const destinos: DestinoEquipo[] = [
  "Stock disponible",
  "Stock disponible",
  "Laboratorio/Reparación",
  "Baja definitiva",
];
const clientes = [
  "María Fernanda López",
  "Jorge Enrique Salazar",
  "Edificio Los Cedros",
  "Conjunto Altos del Prado",
  "Sandra Milena Cárdenas",
  "Restaurante El Buen Sabor",
  "Pedro Antonio Mejía",
  "Clínica San Rafael",
  "Luz Dary Ospina",
  "Almacén La Economía",
];

export const demoEquipos: MovimientoEquipo[] = Array.from({ length: 48 }, (_, index) => {
  const dia = dias[entre(0, dias.length - 1)];
  return {
    id: `eq-${index + 1}`,
    fecha_recuperacion: dia.fecha,
    cuadrilla_id: dia.cuadrillaId,
    tecnico_id: dia.tecnico.id,
    cliente_abonado: elegir(clientes),
    tipo_equipo: elegir(tiposEquipo),
    marca_modelo: elegir(marcasModelo),
    numero_serie: `SN-${String(100000 + index * 37)}`,
    estado_recepcion: elegir(estadosRecepcion),
    destino_equipo: elegir(destinos),
  };
});
