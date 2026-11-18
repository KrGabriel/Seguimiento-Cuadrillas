"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn, formatFecha } from "@/lib/utils";

export type TableValue = string | number | null | undefined;
export type TableRowData = Record<string, TableValue>;

export type TableColumn = {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  kind?: "text" | "number" | "percent" | "date" | "datetime" | "badge" | "link" | "external";
  linkPrefix?: string;
  linkKey?: string;
  width?: string;
};

function badgeVariant(value: string) {
  const v = value.toLowerCase();
  if (["operativo", "activo", "activa", "baja definitiva"].includes(v)) return "success" as const;
  if (["mantenimiento", "limpieza", "herramientas", "leve", "para revisión"].includes(v))
    return "warning" as const;
  if (["dañado", "grave", "inactivo", "inactiva", "eliminar", "delete"].includes(v))
    return "destructive" as const;
  if (["moderada", "laboratorio/reparación", "actualizar", "update"].includes(v)) return "info" as const;
  if (["insertar", "insert"].includes(v)) return "success" as const;
  return "secondary" as const;
}

export function DataTable({
  columns,
  rows,
  emptyMessage = "Sin datos para el período seleccionado.",
  initialSort,
}: {
  columns: TableColumn[];
  rows: TableRowData[];
  emptyMessage?: string;
  initialSort?: { key: string; dir: "asc" | "desc" };
}) {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" }>(
    initialSort ?? { key: columns[0]?.key ?? "", dir: "desc" },
  );

  const sorted = useMemo(() => {
    const copy = [...rows];
    if (!sort.key) return copy;
    copy.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      const result =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv), "es", { numeric: true });
      return sort.dir === "asc" ? result : -result;
    });
    return copy;
  }, [rows, sort]);

  function toggle(key: string) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  }

  function renderCell(row: TableRowData, col: TableColumn) {
    const value = row[col.key];
    if (value === null || value === undefined || value === "") return <span className="text-muted-foreground">—</span>;

    if (col.kind === "badge") {
      return <Badge variant={badgeVariant(String(value))}>{String(value)}</Badge>;
    }
    if (col.kind === "date") return formatFecha(String(value));
    if (col.kind === "datetime")
      return new Date(String(value)).toLocaleString("es-CO", {
        dateStyle: "short",
        timeStyle: "short",
      });
    if (col.kind === "number") return new Intl.NumberFormat("es-CO").format(Number(value));
    if (col.kind === "percent") return `${Number(value).toFixed(1)}%`;
    if (col.kind === "external") {
      return (
        <a
          href={String(value)}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Ver
        </a>
      );
    }
    if (col.kind === "link") {
      const id = row[col.linkKey ?? "id"];
      return (
        <Link
          href={`${col.linkPrefix ?? ""}${id ?? ""}`}
          className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
        >
          {String(value)}
        </Link>
      );
    }
    return String(value);
  }

  return (
    <div className="w-full overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead
              key={col.key}
              style={col.width ? { width: col.width } : undefined}
              aria-sort={
                sort.key === col.key ? (sort.dir === "asc" ? "ascending" : "descending") : "none"
              }
              className={cn(
                col.align === "right" && "text-right",
                col.align === "center" && "text-center",
              )}
            >
              <button
                type="button"
                onClick={() => toggle(col.key)}
                aria-label={`Ordenar por ${col.label}`}
                className={cn(
                  "inline-flex items-center gap-1 transition-colors hover:text-foreground",
                  col.align === "right" && "flex-row-reverse",
                )}
              >
                {col.label}
                {sort.key === col.key ? (
                  sort.dir === "asc" ? (
                    <ArrowUp className="size-3" />
                  ) : (
                    <ArrowDown className="size-3" />
                  )
                ) : (
                  <ArrowUpDown className="size-3 opacity-40" />
                )}
              </button>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="py-10 text-center text-muted-foreground">
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          sorted.map((row, index) => (
            <TableRow key={String(row.id ?? index)}>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  className={cn(
                    col.align === "right" && "text-right tabular-nums",
                    col.align === "center" && "text-center",
                  )}
                >
                  {renderCell(row, col)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
    </div>
  );
}
