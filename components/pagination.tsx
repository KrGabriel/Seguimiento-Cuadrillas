import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Params = Record<string, string | string[] | undefined>;

function construirHref(basePath: string, params: Params, page: number) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === "page" || value === undefined) continue;
    const limpio = Array.isArray(value) ? value[0] : value;
    if (limpio) search.set(key, limpio);
  }
  if (page > 1) search.set("page", String(page));
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Pagination({
  page,
  totalPages,
  total,
  desde,
  hasta,
  basePath,
  searchParams = {},
  etiqueta = "registros",
}: {
  page: number;
  totalPages: number;
  total: number;
  desde: number;
  hasta: number;
  basePath: string;
  searchParams?: Params;
  etiqueta?: string;
}) {
  if (totalPages <= 1) {
    return (
      <p className="px-1 py-2 text-xs text-muted-foreground">
        {total} {etiqueta}
      </p>
    );
  }

  const ventana = 1;
  const paginas = new Set<number>([1, totalPages, page]);
  for (let i = page - ventana; i <= page + ventana; i++) {
    if (i >= 1 && i <= totalPages) paginas.add(i);
  }
  const ordenadas = Array.from(paginas).sort((a, b) => a - b);

  return (
    <nav
      aria-label="Paginación"
      className="flex flex-col gap-3 border-t border-border px-1 pt-3 text-xs sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-muted-foreground" aria-live="polite">
        Mostrando {desde}–{hasta} de {total} {etiqueta}
      </p>
      <div className="flex items-center gap-1">
        <Link
          href={construirHref(basePath, searchParams, Math.max(1, page - 1))}
          aria-disabled={page === 1}
          tabIndex={page === 1 ? -1 : undefined}
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
            page === 1 && "pointer-events-none opacity-40",
          )}
          aria-label="Página anterior"
        >
          <ChevronLeft className="size-4" />
        </Link>
        {ordenadas.map((numero, indice) => {
          const anterior = ordenadas[indice - 1];
          const separador = anterior !== undefined && numero - anterior > 1;
          return (
            <span key={numero} className="flex items-center gap-1">
              {separador ? <span className="px-1 text-muted-foreground">…</span> : null}
              <Link
                href={construirHref(basePath, searchParams, numero)}
                aria-current={numero === page ? "page" : undefined}
                className={cn(
                  "inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                  numero === page && "border-primary/40 bg-primary/10 font-medium text-foreground",
                )}
              >
                {numero}
              </Link>
            </span>
          );
        })}
        <Link
          href={construirHref(basePath, searchParams, Math.min(totalPages, page + 1))}
          aria-disabled={page === totalPages}
          tabIndex={page === totalPages ? -1 : undefined}
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
            page === totalPages && "pointer-events-none opacity-40",
          )}
          aria-label="Página siguiente"
        >
          <ChevronRight className="size-4" />
        </Link>
      </div>
    </nav>
  );
}
