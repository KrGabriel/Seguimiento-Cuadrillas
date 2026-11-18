import { cn } from "@/lib/utils";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="text-[11px] text-muted-foreground/80">{hint}</p> : null}
      {error ? <p className="text-[11px] text-red-400">{error}</p> : null}
    </div>
  );
}

export function FormMessage({ tipo, texto }: { tipo: "ok" | "error"; texto: string }) {
  return (
    <div
      className={cn(
        "rounded-md border px-3 py-2 text-xs",
        tipo === "ok"
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-red-500/30 bg-red-500/10 text-red-300",
      )}
    >
      {texto}
    </div>
  );
}
