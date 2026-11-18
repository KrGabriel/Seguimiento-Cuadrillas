import { describe, expect, it } from "vitest";
import {
  clamp,
  fechaHaceDias,
  fechaHoy,
  mesActual,
  paginar,
  parsePage,
  promedio,
  toISODate,
} from "@/lib/utils";

describe("fechas", () => {
  it("toISODate usa la fecha local sin corrimiento UTC", () => {
    expect(toISODate(new Date(2026, 0, 1, 23, 30))).toBe("2026-01-01");
  });

  it("fechaHoy y mesActual tienen formato ISO", () => {
    expect(fechaHoy()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(mesActual()).toBe(fechaHoy().slice(0, 7));
  });

  it("fechaHaceDias calcula días hacia atrás", () => {
    const hoy = new Date(`${fechaHoy()}T12:00:00`);
    const esperado = new Date(hoy);
    esperado.setDate(esperado.getDate() - 7);
    expect(fechaHaceDias(7)).toBe(toISODate(esperado));
  });
});

describe("paginación", () => {
  const items = Array.from({ length: 23 }, (_, i) => i);

  it("paginar devuelve la página correcta y los metadatos", () => {
    const resultado = paginar(items, 2, 10);
    expect(resultado.items).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
    expect(resultado.total).toBe(23);
    expect(resultado.totalPages).toBe(3);
    expect(resultado.page).toBe(2);
    expect(resultado.desde).toBe(11);
    expect(resultado.hasta).toBe(20);
  });

  it("paginar acota páginas fuera de rango", () => {
    expect(paginar(items, 99, 10).page).toBe(3);
    expect(paginar(items, 0, 10).page).toBe(1);
  });

  it("parsePage valida y acota el parámetro", () => {
    expect(parsePage("2", 3)).toBe(2);
    expect(parsePage(undefined, 3)).toBe(1);
    expect(parsePage("abc", 3)).toBe(1);
    expect(parsePage("9", 3)).toBe(3);
    expect(parsePage("-1", 3)).toBe(1);
  });
});

describe("números", () => {
  it("clamp limita al rango", () => {
    expect(clamp(120)).toBe(100);
    expect(clamp(-5)).toBe(0);
    expect(clamp(42)).toBe(42);
  });

  it("promedio de arreglo vacío es 0", () => {
    expect(promedio([])).toBe(0);
    expect(promedio([2, 4, 6])).toBe(4);
  });
});
