import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { ComparativoCuadrillaFila, FichaTecnica } from "@/lib/analytics";
import type { MovimientoEquipoDetalle } from "@/lib/types";
import { EMPRESA_LOGO_URL, EMPRESA_NOMBRE, RESPONSABLE_NOMBRE } from "@/lib/env";
import { formatFecha } from "@/lib/utils";

const VIOLETA: [number, number, number] = [124, 58, 237];
const OSCURO: [number, number, number] = [17, 17, 22];
const GRIS: [number, number, number] = [100, 100, 110];
const CLARO: [number, number, number] = [245, 244, 250];
const VERDE: [number, number, number] = [16, 185, 129];
const ROJO: [number, number, number] = [239, 68, 68];

function iniciales() {
  return EMPRESA_NOMBRE.split(/\s+/)
    .map((palabra) => palabra[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

async function cargarLogo(): Promise<string | null> {
  if (!EMPRESA_LOGO_URL || typeof window === "undefined") return null;
  try {
    return await new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      const timer = window.setTimeout(() => reject(new Error("timeout")), 3000);
      img.onload = () => {
        window.clearTimeout(timer);
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("sin contexto"));
            return;
          }
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => {
        window.clearTimeout(timer);
        reject(new Error("no se pudo cargar"));
      };
      img.src = EMPRESA_LOGO_URL;
    });
  } catch {
    return null;
  }
}

function encabezado(doc: jsPDF, titulo: string, subtitulo: string, logo: string | null) {
  const ancho = doc.internal.pageSize.getWidth();

  doc.setFillColor(...OSCURO);
  doc.rect(0, 0, ancho, 32, "F");
  doc.setFillColor(...VIOLETA);
  doc.rect(0, 32, ancho, 1.6, "F");

  if (logo) {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, 7, 22, 18, 2, 2, "F");
    try {
      doc.addImage(logo, "PNG", 16, 8.5, 18, 15, undefined, "FAST");
    } catch {
      doc.setFillColor(...VIOLETA);
      doc.roundedRect(14, 7, 22, 18, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(iniciales(), 25, 18, { align: "center" });
    }
  } else {
    doc.setFillColor(...VIOLETA);
    doc.roundedRect(14, 7, 22, 18, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(iniciales(), 25, 18, { align: "center" });
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(EMPRESA_NOMBRE.toUpperCase(), 42, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(180, 180, 190);
  doc.text("Sistema de Gestión, Desempeño Técnico y Control de Cuadrillas", 42, 20);
  doc.text(`Generado: ${new Date().toLocaleString("es-CO")}`, ancho - 14, 20, { align: "right" });

  doc.setTextColor(...OSCURO);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(titulo, 14, 47);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRIS);
  doc.text(subtitulo, 14, 53);

  return 62;
}

function pie(doc: jsPDF) {
  const paginas = doc.getNumberOfPages();
  const ancho = doc.internal.pageSize.getWidth();
  const alto = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i);
    doc.setDrawColor(225, 224, 232);
    doc.line(14, alto - 16, ancho - 14, alto - 16);
    doc.setFontSize(7.5);
    doc.setTextColor(...GRIS);
    doc.text(`${EMPRESA_NOMBRE} · Documento confidencial de uso interno`, 14, alto - 10);
    doc.text(`Página ${i} de ${paginas}`, ancho - 14, alto - 10, { align: "right" });
  }
}

function seccion(doc: jsPDF, titulo: string, y: number, ancho: number) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...OSCURO);
  doc.text(titulo, 14, y);
  doc.setDrawColor(...VIOLETA);
  doc.setLineWidth(0.6);
  doc.line(14, y + 2, ancho - 14, y + 2);
  return y + 8;
}

function firma(doc: jsPDF, y: number) {
  const alto = doc.internal.pageSize.getHeight();
  const ancho = doc.internal.pageSize.getWidth();
  let posicion = y;

  if (posicion > alto - 48) {
    doc.addPage();
    posicion = 32;
  }

  doc.setDrawColor(150, 150, 160);
  doc.setLineWidth(0.3);
  doc.line(14, posicion + 16, 82, posicion + 16);
  doc.line(ancho - 82, posicion + 16, ancho - 14, posicion + 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...OSCURO);
  doc.text(RESPONSABLE_NOMBRE, 14, posicion + 21);
  doc.text("Administración", ancho - 14, posicion + 21, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...GRIS);
  doc.text("Firma y sello · Supervisión", 14, posicion + 25);
  doc.text("Aprobado por", ancho - 14, posicion + 25, { align: "right" });

  return posicion + 30;
}

const tablaEstilos = {
  theme: "grid" as const,
  headStyles: { fillColor: VIOLETA, textColor: 255 as const, fontSize: 8.5 },
  bodyStyles: { fontSize: 8.5, textColor: [40, 40, 48] as [number, number, number] },
  alternateRowStyles: { fillColor: CLARO },
  styles: { cellPadding: 2.4, lineColor: [228, 227, 235] as [number, number, number], lineWidth: 0.2 },
  margin: { left: 14, right: 14 },
};

function finalY(doc: jsPDF, fallback = 60) {
  return (
    (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? fallback
  );
}

function dibujarRadar(
  doc: jsPDF,
  cx: number,
  cy: number,
  radio: number,
  data: { eje: string; valor: number }[],
) {
  const n = data.length;
  if (!n) return;
  const angulo = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const punto = (i: number, valor: number) => ({
    x: cx + Math.cos(angulo(i)) * radio * (valor / 5),
    y: cy + Math.sin(angulo(i)) * radio * (valor / 5),
  });

  doc.setLineWidth(0.15);
  for (let anillo = 1; anillo <= 5; anillo++) {
    const puntos = Array.from({ length: n }, (_, i) => punto(i, anillo));
    const deltas = puntos.slice(1).map((p, i) => [p.x - puntos[i].x, p.y - puntos[i].y]);
    doc.setDrawColor(215, 214, 225);
    doc.lines(deltas, puntos[0].x, puntos[0].y, [1, 1], "S", true);
  }

  doc.setDrawColor(225, 224, 235);
  for (let i = 0; i < n; i++) {
    const extremo = punto(i, 5);
    doc.line(cx, cy, extremo.x, extremo.y);
  }

  const valores = data.map((d, i) => punto(i, Math.max(0, Math.min(5, d.valor))));
  const deltas = valores.slice(1).map((p, i) => [p.x - valores[i].x, p.y - valores[i].y]);
  doc.setFillColor(237, 233, 254);
  doc.setDrawColor(...VIOLETA);
  doc.setLineWidth(0.5);
  doc.lines(deltas, valores[0].x, valores[0].y, [1, 1], "FD", true);

  doc.setFillColor(...VIOLETA);
  for (const p of valores) doc.circle(p.x, p.y, 0.7, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 82);
  for (let i = 0; i < n; i++) {
    const cos = Math.cos(angulo(i));
    const etiqueta = `${data[i].eje} (${data[i].valor.toFixed(1)})`;
    const lx = cx + cos * (radio + 6);
    const ly = cy + Math.sin(angulo(i)) * (radio + 6) + 2;
    const align = cos > 0.3 ? "left" : cos < -0.3 ? "right" : "center";
    doc.text(etiqueta, lx, ly, { align });
  }

  doc.setFontSize(6.5);
  doc.setTextColor(...GRIS);
  doc.text("5", cx, cy - radio - 2, { align: "center" });
  doc.text("0", cx + 2, cy + 2.5);
}

function dibujarBarras(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  filas: { cuadrilla: string; cumplimiento: number; tasaReclamos: number; recupero: number }[],
) {
  if (!filas.length) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...GRIS);
    doc.text("Sin datos para graficar en el período.", x, y + 8);
    return;
  }

  const plotX = x + 12;
  const plotY = y + 10;
  const plotW = w - 16;
  const plotH = h - 22;
  const base = plotY + plotH;

  doc.setLineWidth(0.2);
  doc.setFontSize(6.5);
  for (let valor = 0; valor <= 100; valor += 25) {
    const py = base - (valor / 100) * plotH;
    doc.setDrawColor(230, 229, 238);
    doc.line(plotX, py, plotX + plotW, py);
    doc.setTextColor(...GRIS);
    doc.text(`${valor}%`, x + 9.5, py + 2, { align: "right" });
  }

  const series = [
    { key: "cumplimiento" as const, color: VIOLETA, label: "Cumplimiento órdenes" },
    { key: "tasaReclamos" as const, color: ROJO, label: "Tasa de reclamos" },
    { key: "recupero" as const, color: VERDE, label: "Recupero materiales" },
  ];

  const grupo = plotW / filas.length;
  const anchoBarra = Math.min(8, (grupo - 8) / 3);
  const separacion = 1.4;

  filas.forEach((fila, indice) => {
    const centro = plotX + grupo * indice + grupo / 2;
    const inicio = centro - (anchoBarra * 3 + separacion * 2) / 2;
    series.forEach((serie, si) => {
      const valor = Math.max(0, Math.min(100, fila[serie.key]));
      const alto = (valor / 100) * plotH;
      if (alto <= 0) return;
      doc.setFillColor(...serie.color);
      doc.rect(inicio + si * (anchoBarra + separacion), base - alto, anchoBarra, alto, "F");
    });
    doc.setFontSize(6.8);
    doc.setTextColor(60, 60, 72);
    doc.text(fila.cuadrilla.slice(0, 16), centro, base + 6, { align: "center" });
  });

  doc.setDrawColor(180, 180, 195);
  doc.setLineWidth(0.3);
  doc.line(plotX, base, plotX + plotW, base);

  let leyendaX = plotX + plotW - 62;
  series.forEach((serie) => {
    doc.setFillColor(...serie.color);
    doc.rect(leyendaX, y + 3, 2.6, 2.6, "F");
    doc.setFontSize(6.5);
    doc.setTextColor(70, 70, 82);
    doc.text(serie.label, leyendaX + 4, y + 5.2);
    leyendaX += 24;
  });
}

export async function generarFichaTecnicaPDF({
  ficha,
  periodo,
}: {
  ficha: FichaTecnica;
  periodo: string;
}) {
  const logo = await cargarLogo();
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const ancho = doc.internal.pageSize.getWidth();
  let y = encabezado(doc, "Ficha Técnica de Desempeño", `Período evaluado: ${periodo}`, logo);

  autoTable(doc, {
    ...tablaEstilos,
    startY: y,
    body: [
      ["Técnico", ficha.tecnico.nombre_completo, "Legajo", ficha.tecnico.legajo],
      [
        "Fecha de ingreso",
        formatFecha(ficha.tecnico.fecha_ingreso),
        "Días con parte diario",
        String(ficha.diasTrabajados),
      ],
    ],
    columnStyles: {
      0: { fontStyle: "bold", fillColor: CLARO, cellWidth: 34 },
      2: { fontStyle: "bold", fillColor: CLARO, cellWidth: 34 },
    },
  });

  y = finalY(doc) + 10;
  y = seccion(doc, "Rendimiento técnico del período", y, ancho);

  autoTable(doc, {
    ...tablaEstilos,
    startY: y,
    head: [[
      "Instalaciones",
      "Reparaciones",
      "Bajas",
      "Cambios domicilio",
      "Pendientes",
      "% Tareas finalizadas",
    ]],
    body: [[
      ficha.instalaciones,
      ficha.reparaciones,
      ficha.bajas,
      ficha.cambiosDomicilio,
      ficha.pendientes,
      `${ficha.pctTareasFinalizadas.toFixed(1)}%`,
    ]],
  });

  y = finalY(doc) + 10;
  y = seccion(
    doc,
    `Evaluación de actitud y conducta · promedio general ${ficha.puntajeActitud.toFixed(2)} / 5`,
    y,
    ancho,
  );

  dibujarRadar(doc, ancho / 2, y + 40, 30, ficha.radar);
  y += 86;

  autoTable(doc, {
    ...tablaEstilos,
    startY: y,
    head: [["Puntualidad", "Uniforme", "Responsabilidad", "Cumplimiento", "Compañerismo", "Comunicación"]],
    body: [[
      ficha.evaluacion.puntualidad.toFixed(2),
      ficha.evaluacion.uniforme.toFixed(2),
      ficha.evaluacion.responsabilidad.toFixed(2),
      ficha.evaluacion.cumplimiento_tareas.toFixed(2),
      ficha.evaluacion.companerismo.toFixed(2),
      ficha.evaluacion.comunicacion_supervision.toFixed(2),
    ]],
  });

  y = finalY(doc) + 10;
  y = seccion(
    doc,
    `Incumplimientos registrados (${ficha.incumplimientos.length}) · Leve ${ficha.porGravedad.Leve ?? 0} · Moderada ${ficha.porGravedad.Moderada ?? 0} · Grave ${ficha.porGravedad.Grave ?? 0}`,
    y,
    ancho,
  );

  if (ficha.incumplimientos.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...GRIS);
    doc.text("Sin incumplimientos registrados en el período.", 14, y + 4);
    y += 12;
  } else {
    autoTable(doc, {
      ...tablaEstilos,
      startY: y,
      head: [["Fecha", "Tipo de incumplimiento", "Gravedad", "Descripción"]],
      body: ficha.incumplimientos.map((i) => [
        formatFecha(i.fecha),
        i.tipo_incumplimiento,
        i.gravedad,
        i.descripcion ?? "—",
      ]),
      columnStyles: { 3: { cellWidth: 62 } },
    });
    y = finalY(doc) + 12;
  }

  firma(doc, y);
  pie(doc);
  doc.save(`ficha-tecnica-${ficha.tecnico.legajo}-${periodo.replace(/\s/g, "-")}.pdf`);
}

export async function generarInformeCuadrillasPDF({
  filas,
  periodo,
  cuadrillaFiltrada,
}: {
  filas: ComparativoCuadrillaFila[];
  periodo: string;
  cuadrillaFiltrada?: string;
}) {
  const logo = await cargarLogo();
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const ancho = doc.internal.pageSize.getWidth();
  let y = encabezado(
    doc,
    cuadrillaFiltrada
      ? `Informe de Cuadrilla · ${cuadrillaFiltrada}`
      : "Informe Comparativo de Cuadrillas",
    `Período evaluado: ${periodo}`,
    logo,
  );

  y = seccion(doc, "Gráficos comparativos", y, ancho);
  dibujarBarras(
    doc,
    14,
    y,
    ancho - 28,
    62,
    filas.map((f) => ({
      cuadrilla: f.cuadrilla.replace("Cuadrilla ", ""),
      cumplimiento: f.cumplimiento,
      tasaReclamos: f.tasaReclamos,
      recupero: f.recupero,
    })),
  );

  y += 72;
  y = seccion(doc, "Indicadores comparativos (8 ejes)", y, ancho);

  autoTable(doc, {
    ...tablaEstilos,
    startY: y,
    head: [[
      "Cuadrilla",
      "Productividad",
      "Calidad (reclamos)",
      "Cumpl. órdenes",
      "Rendimiento",
      "Materiales (util. / recup.)",
      "Reincidencia",
      "Vehículo",
      "Seguridad",
      "Score",
    ]],
    body: filas.map((f) => [
      f.cuadrilla,
      String(f.productividad),
      `${f.tasaReclamos.toFixed(1)}%`,
      `${f.cumplimiento.toFixed(1)}%`,
      `${f.ordenesFinalizadas}/${f.ordenesAsignadas}`,
      `${f.materialesUtilizados} / ${f.materialesRecuperados}`,
      String(f.reincidenciaFallas),
      f.estadoVehiculo,
      String(f.seguridad),
      `${f.score}/100`,
    ]),
    bodyStyles: { fontSize: 8, textColor: [40, 40, 48] },
  });

  y = finalY(doc) + 10;
  y = seccion(doc, "Detalle operativo", y, ancho);

  autoTable(doc, {
    ...tablaEstilos,
    startY: y,
    head: [[
      "Cuadrilla",
      "Instalaciones",
      "Reparaciones",
      "Órdenes asignadas",
      "Finalizadas",
      "Reclamos",
      "Desperdicio",
      "Incumplimientos",
      "Score final",
    ]],
    body: filas.map((f) => [
      f.cuadrilla,
      String(f.instalaciones),
      String(f.reparaciones),
      String(f.ordenesAsignadas),
      String(f.ordenesFinalizadas),
      String(f.reclamos),
      String(f.desperdicio),
      String(f.incumplimientos),
      `${f.score}/100`,
    ]),
  });

  y = finalY(doc) + 10;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(...GRIS);
  doc.text(
    "Criterios: Calidad = 100 - (tasa de reclamos × 8). Seguridad descuenta 14 puntos por evento. Reincidencia = eventos repetidos del mismo tipo por técnico. Score = promedio de productividad, cumplimiento, recupero y disciplina.",
    14,
    y,
    { maxWidth: ancho - 28 },
  );
  y += 8;

  firma(doc, y);
  pie(doc);
  doc.save(
    `informe-cuadrillas-${(cuadrillaFiltrada ?? "comparativo").replace(/\s/g, "-")}-${periodo.replace(/\s/g, "-")}.pdf`,
  );
}

export async function generarManifiestoEquiposPDF({
  equipos,
  periodo,
  filtros,
}: {
  equipos: MovimientoEquipoDetalle[];
  periodo: string;
  filtros?: string;
}) {
  const logo = await cargarLogo();
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const ancho = doc.internal.pageSize.getWidth();
  let y = encabezado(
    doc,
    "Manifiesto de Recuperación y Movimiento de Equipos",
    `Período: ${periodo}${filtros ? ` · ${filtros}` : ""} · Total: ${equipos.length} equipos`,
    logo,
  );

  const resumen = equipos.reduce(
    (acc, e) => {
      acc[e.estado_recepcion] = (acc[e.estado_recepcion] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  y = seccion(
    doc,
    `Resumen por estado · Operativo ${resumen["Operativo"] ?? 0} · Dañado ${resumen["Dañado"] ?? 0} · Para revisión ${resumen["Para revisión"] ?? 0}`,
    y,
    ancho,
  );

  autoTable(doc, {
    ...tablaEstilos,
    startY: y,
    head: [[
      "Fecha",
      "Cuadrilla",
      "Técnico",
      "Cliente / Abonado",
      "Tipo",
      "Marca / Modelo",
      "N° Serie",
      "Estado recepción",
      "Destino",
    ]],
    body: equipos.map((e) => [
      formatFecha(e.fecha_recuperacion),
      e.cuadrilla?.nombre ?? "—",
      e.tecnico?.nombre_completo ?? "—",
      e.cliente_abonado,
      e.tipo_equipo,
      e.marca_modelo ?? "—",
      e.numero_serie,
      e.estado_recepcion,
      e.destino_equipo,
    ]),
    bodyStyles: { fontSize: 7.8, textColor: [40, 40, 48] },
    headStyles: { fillColor: VIOLETA, textColor: 255, fontSize: 8 },
    columnStyles: { 3: { cellWidth: 42 }, 6: { cellWidth: 34 } },
  });

  y = finalY(doc) + 12;
  firma(doc, y);
  pie(doc);
  doc.save(`manifiesto-equipos-${periodo.replace(/\s/g, "-")}.pdf`);
}
