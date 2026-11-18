import { Activity, BarChart3, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { LoginForm } from "./login-form";
import { EMPRESA_NOMBRE, supabaseConfigurado } from "@/lib/env";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-card/40 p-12 lg:flex">
        <div className="surface-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Activity className="size-5" />
            </div>
            <div>
              <p className="text-base font-semibold">{EMPRESA_NOMBRE}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Control operativo
              </p>
            </div>
          </div>
        </div>

        <div className="relative space-y-8">
          <div>
            <h2 className="max-w-md text-balance text-3xl font-semibold leading-tight tracking-tight">
              Desempeño técnico, cuadrillas y equipos en una sola plataforma.
            </h2>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Trazabilidad histórica por técnico y cuadrilla, evaluación diaria de actitud,
              control operativo y reportes formales listos para descargar.
            </p>
          </div>

          <div className="grid max-w-md gap-3 sm:grid-cols-2">
            {[
              { icon: BarChart3, label: "Analítica y reportes PDF" },
              { icon: Users, label: "Reasignación de técnicos" },
              { icon: ShieldCheck, label: "Incumplimientos y seguridad" },
              { icon: Activity, label: "Trazabilidad de equipos" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-2.5 text-xs text-muted-foreground"
              >
                <item.icon className="size-4 text-primary" />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} {EMPRESA_NOMBRE}. Uso interno.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Activity className="size-4" />
              </div>
              <p className="text-sm font-semibold">{EMPRESA_NOMBRE}</p>
            </div>
          </div>

          <h1 className="text-xl font-semibold tracking-tight">Acceso administrador</h1>
          <p className="mb-6 mt-1 text-xs text-muted-foreground">
            Ingresa con las credenciales del usuario administrador
            {supabaseConfigurado ? " de Supabase Auth." : " o explora la demostración."}
          </p>

          <LoginForm />

          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            <Link href="/recuperar" className="underline-offset-4 hover:text-foreground hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </p>

          <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground">
            Solo usuarios autenticados. Las rutas y políticas RLS están protegidas.
          </p>
        </div>
      </div>
    </div>
  );
}
