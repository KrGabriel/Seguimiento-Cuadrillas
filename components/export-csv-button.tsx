"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export type CsvColumn = { key: string; label: string };
export type CsvRow = Record<string, string | number | null | undefined>;

function escapar(valor: string | number | null | undefined) {
  const texto = valor === null || valor === undefined ? "" : String(valor);
  return `"${texto.replace(/"/g, '""')}"`;
}

export function ExportCsvButton({
  filename,
  columns,
  rows,
  label = "Exportar CSV",
}: {
  filename: string;
  columns: CsvColumn[];
  rows: CsvRow[];
  label?: string;
}) {
  function exportar() {
    const encabezado = columns.map((col) => escapar(col.label)).join(";");
    const cuerpo = rows.map((row) => columns.map((col) => escapar(row[col.key])).join(";"));
    const contenido = `\uFEFF${[encabezado, ...cuerpo].join("\r\n")}`;
    const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={exportar}>
      <Download /> {label}
    </Button>
  );
}
