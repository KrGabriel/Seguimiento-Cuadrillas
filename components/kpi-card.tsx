import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "primary",
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  accent?: "primary" | "success" | "warning" | "destructive" | "info";
  className?: string;
}) {
  const accents: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-emerald-500/10 text-emerald-400",
    warning: "bg-amber-500/10 text-amber-400",
    destructive: "bg-red-500/10 text-red-400",
    info: "bg-sky-500/10 text-sky-400",
  };

  return (
    <Card className={cn("group relative overflow-hidden p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
        </div>
        <div className={cn("rounded-md p-2", accents[accent])}>
          <Icon className="size-4" />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </Card>
  );
}
