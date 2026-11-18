"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FormMessage } from "@/components/forms/form-field";
import { createClient } from "@/lib/supabase/client";
import { supabaseConfigurado } from "@/lib/env";

export default function ActualizarPasswordPage() {
  const [listo, setListo] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actualizada, setActualizada] = useState(false);

  useEffect(() => {
    let activo = true;
    async function verificar() {
      if (!supabaseConfigurado) {
        if (activo) {
          setError("El proyecto está en modo demostración; no hay sesión de Supabase.");
          setVerificando(false);
        }
        return;
      }
      const supabase = createClient();
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (activo) {
          if (exchangeError) setError("El enlace expiró o no es válido. Solicita uno nuevo.");
          else setListo(true);
          setVerificando(false);
        }
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (activo) {
        if (!data.session) setError("Abre el enlace del correo para validar tu identidad.");
        else setListo(true);
        setVerificando(false);
      }
    }
    verificar();
    return () => {
      activo = false;
    };
  }, []);

  async function actualizar(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setCargando(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.updateUser({ password });
      if (authError) {
        setError(authError.message);
        return;
      }
      setActualizada(true);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <KeyRound className="size-5" />
          </div>
          <CardTitle>Nueva contraseña</CardTitle>
          <CardDescription>Define una contraseña segura para tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {actualizada ? (
            <div className="space-y-4">
              <p className="flex items-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                Contraseña actualizada. Ya puedes ingresar con tus nuevas credenciales.
              </p>
              <Button asChild className="w-full">
                <Link href="/dashboard">
                  <ShieldCheck /> Ir al dashboard
                </Link>
              </Button>
            </div>
          ) : verificando ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Validando enlace…
            </p>
          ) : listo ? (
            <form onSubmit={actualizar} className="space-y-4">
              <Field label="Nueva contraseña">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  autoFocus
                />
              </Field>
              <Field label="Confirmar contraseña">
                <Input
                  type="password"
                  value={confirmacion}
                  onChange={(e) => setConfirmacion(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                />
              </Field>
              {error ? <FormMessage tipo="error" texto={error} /> : null}
              <Button type="submit" className="w-full" disabled={cargando}>
                {cargando ? <Loader2 className="animate-spin" /> : <KeyRound />}
                Guardar contraseña
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              {error ? <FormMessage tipo="error" texto={error} /> : null}
              <Button asChild className="w-full">
                <Link href="/recuperar">Solicitar un enlace nuevo</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="w-full">
                <Link href="/login">Volver al inicio de sesión</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
