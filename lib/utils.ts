import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFecha(fecha: string | Date | null | undefined) {
  if (!fecha) return "—";
  const date = typeof fecha === "string" ? new Date(`${fecha.slice(0, 10)}T12:00:00`) : fecha;
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatFechaCorta(fecha: string | Date | null | undefined) {
  if (!fecha) return "—";
  const date = typeof fecha === "string" ? new Date(`${fecha.slice(0, 10)}T12:00:00`) : fecha;
  return new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short" }).format(date);
}

export function mesLabel(mes: string) {
  const date = new Date(`${mes}-01T12:00:00`);
  const label = new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric" }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function nombreMes(fecha: string) {
  const date = new Date(`${fecha.slice(0, 7)}-01T12:00:00`);
  const label = new Intl.DateTimeFormat("es-CO", { month: "short", year: "2-digit" }).format(date);
  return label.replace(".", "").replace(/^\w/, (c) => c.toUpperCase());
}

export function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fechaHoy() {
  return toISODate(new Date());
}

export function fechaHaceDias(dias: number) {
  const hoy = new Date();
  return toISODate(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - dias));
}

export function inicioMes(mes?: string) {
  const base = mes ? new Date(`${mes}-01T12:00:00`) : new Date();
  return toISODate(new Date(base.getFullYear(), base.getMonth(), 1));
}

export function finMes(mes?: string) {
  const base = mes ? new Date(`${mes}-01T12:00:00`) : new Date();
  return toISODate(new Date(base.getFullYear(), base.getMonth() + 1, 0));
}

export function mesActual() {
  return fechaHoy().slice(0, 7);
}

export function numero(value: number | null | undefined) {
  return new Intl.NumberFormat("es-CO").format(value ?? 0);
}

export function porcentaje(value: number | null | undefined, decimals = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return "0%";
  return `${value.toFixed(decimals)}%`;
}

export function promedio(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((acc, v) => acc + v, 0) / values.length;
}

export function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

export function formatRango(desde: string, hasta: string) {
  return `${formatFecha(desde)} — ${formatFecha(hasta)}`;
}

export function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}
