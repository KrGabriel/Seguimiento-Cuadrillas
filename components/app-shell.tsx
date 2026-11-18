"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  Building2,
  ClipboardCheck,
  ClipboardList,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageSearch,
  ShieldAlert,
  Truck,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { cerrarSesion } from "@/lib/actions";

const grupos = [
  {
    titulo: "Panel",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    titulo: "Operación",
    items: [
      { href: "/carga", label: "Carga diaria", icon: ClipboardList },
      { href: "/tecnicos", label: "Técnicos", icon: Users },
      { href: "/cuadrillas", label: "Cuadrillas", icon: Truck },
      { href: "/incumplimientos", label: "Incumplimientos", icon: ShieldAlert },
      { href: "/operativo", label: "Control operativo", icon: ClipboardCheck },
    ],
  },
  {
    titulo: "Informes",
    items: [
      { href: "/informes/tecnicos", label: "Desempeño técnico", icon: FileBarChart },
      { href: "/informes/cuadrillas", label: "Cuadrillas", icon: Building2 },
      { href: "/informes/equipos", label: "Equipos", icon: PackageSearch },
    ],
  },
];

export function AppShell({
  children,
  userEmail,
  demo,
}: {
  children: React.ReactNode;
  userEmail?: string | null;
  demo: boolean;
}) {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);

  const nav = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Activity className="size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">Cuadrillas OS</p>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            Control operativo
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {grupos.map((grupo) => (
          <div key={grupo.titulo}>
            <p className="mb-2 px-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
              {grupo.titulo}
            </p>
            <ul className="space-y-1">
              {grupo.items.map((item) => {
                const activo =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setAbierto(false)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                        activo && "bg-accent text-foreground",
                      )}
                    >
                      <Icon className={cn("size-4", activo && "text-primary")} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        {demo ? (
          <Badge variant="warning" className="mb-3 w-full justify-center py-1">
            Modo demostración
          </Badge>
        ) : null}
        <div className="flex items-center gap-2 rounded-md p-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
            {(userEmail ?? "AD").slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{userEmail ?? "Administrador"}</p>
            <p className="text-[10px] text-muted-foreground">Administrador</p>
          </div>
          <form action={cerrarSesion}>
            <button
              type="submit"
              title="Cerrar sesión"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-border bg-card/40 backdrop-blur lg:block">
        {nav}
      </aside>

      {abierto ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setAbierto(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-border bg-card">
            <button
              onClick={() => setAbierto(false)}
              className="absolute right-3 top-4 rounded-md p-1 text-muted-foreground hover:bg-accent"
            >
              <X className="size-4" />
            </button>
            {nav}
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAbierto(true)}
              className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
            >
              <Menu className="size-4" />
            </button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="hidden sm:inline">Administración</span>
              <span className="hidden text-border sm:inline">/</span>
              <span className="text-foreground">
                {grupos.flatMap((g) => g.items).find((i) => pathname.startsWith(i.href) && i.href !== "/dashboard")?.label ??
                  "Dashboard"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {demo ? (
              <span className="hidden items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-medium text-amber-400 sm:flex">
                Datos de demostración · conecta Supabase
              </span>
            ) : (
              <span className="hidden items-center gap-1.5 text-[11px] text-muted-foreground sm:flex">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Supabase conectado
              </span>
            )}
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] space-y-6 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
