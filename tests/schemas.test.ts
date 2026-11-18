import { describe, expect, it } from "vitest";
import { incumplimientoSchema, operativoSchema, parteDiarioSchema } from "@/lib/schemas";
import { fechaHaceDias, fechaHoy } from "@/lib/utils";

const parteValido = {
  fecha: "2026-01-15",
  tecnico_id: "tec-1",
  cuadrilla_id: "cua-1",
  instalaciones_realizadas: 3,
  reparaciones_realizadas: 2,
  bajas_efectuadas: 0,
  cambios_domicilio: 1,
  trabajos_pendientes: 0,
  puntualidad: 5,
  uniforme: 4,
  responsabilidad: 5,
  cumplimiento_tareas: 4,
  companerismo: 5,
  comunicacion_supervision: 4,
  notas_observacion: "",
};

describe("parteDiarioSchema", () => {
  it("acepta un parte válido", () => {
    expect(parteDiarioSchema.safeParse(parteValido).success).toBe(true);
  });

  it("rechaza fechas futuras", () => {
    const resultado = parteDiarioSchema.safeParse({ ...parteValido, fecha: "2999-01-01" });
    expect(resultado.success).toBe(false);
  });

  it("rechaza calificaciones fuera de 1-5", () => {
    expect(parteDiarioSchema.safeParse({ ...parteValido, puntualidad: 6 }).success).toBe(false);
    expect(parteDiarioSchema.safeParse({ ...parteValido, puntualidad: 0 }).success).toBe(false);
  });

  it("convierte números escritos como texto", () => {
    const resultado = parteDiarioSchema.safeParse({
      ...parteValido,
      instalaciones_realizadas: "4",
    });
    expect(resultado.success && resultado.data.instalaciones_realizadas).toBe(4);
  });
});

describe("operativoSchema", () => {
  const operativo = {
    fecha: fechaHaceDias(1),
    cuadrilla_id: "cua-1",
    ordenes_asignadas: 10,
    ordenes_finalizadas: 8,
    ordenes_pendientes: 2,
    trabajos_con_reclamos: 0,
    materiales_utilizados: 20,
    materiales_recuperados: 15,
    observaciones_seguridad: "",
    estado_vehiculo_check: "",
  };

  it("acepta un operativo coherente", () => {
    expect(operativoSchema.safeParse(operativo).success).toBe(true);
  });

  it("rechaza finalizadas mayores a asignadas", () => {
    const resultado = operativoSchema.safeParse({ ...operativo, ordenes_finalizadas: 11 });
    expect(resultado.success).toBe(false);
  });

  it("rechaza pendientes mayores a asignadas", () => {
    const resultado = operativoSchema.safeParse({ ...operativo, ordenes_pendientes: 12 });
    expect(resultado.success).toBe(false);
  });

  it("rechaza números negativos", () => {
    expect(operativoSchema.safeParse({ ...operativo, materiales_utilizados: -1 }).success).toBe(false);
  });
});

describe("incumplimientoSchema", () => {
  const base = {
    fecha: fechaHoy(),
    tecnico_id: "tec-1",
    cuadrilla_id: "cua-1",
    tipo_incumplimiento: "Tareas sin finalizar",
    gravedad: "Leve",
    descripcion: "Llegó tarde",
    evidencia_url: "",
  };

  it("acepta el registro básico", () => {
    expect(incumplimientoSchema.safeParse(base).success).toBe(true);
  });

  it("valida la URL de evidencia cuando se informa", () => {
    expect(
      incumplimientoSchema.safeParse({ ...base, evidencia_url: "no-es-url" }).success,
    ).toBe(false);
    expect(
      incumplimientoSchema.safeParse({
        ...base,
        evidencia_url: "https://example.com/foto.jpg",
      }).success,
    ).toBe(true);
  });

  it("rechaza un tipo de incumplimiento fuera del listado", () => {
    expect(
      incumplimientoSchema.safeParse({ ...base, tipo_incumplimiento: "Otro" }).success,
    ).toBe(false);
  });
});
