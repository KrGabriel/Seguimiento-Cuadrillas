"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FormMessage } from "@/components/forms/form-field";
import { createClient } from "@/lib/supabase/client";
import { supabaseConfigurado } from "@/lib/env";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  async function enviar(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!supabaseConfigurado) {
      setError("El proyecto está en modo demostración; configura Supabase para enviar correos.");
      return;
    }
    if (!email.trim()) {
      setError("Ingresa tu correo.");
      return;
    }
    setCargando(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/actualizar-password`,
      });
      if (authError) {
        setError(authError.message);
        return;
      }
      setEnviado(true);
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
          <CardTitle>Recuperar acceso</CardTitle>
          <CardDescription>
            Te enviaremos un enlace para crear una nueva contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {enviado ? (
            <div className="space-y-4 text-sm">
              <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-300">
                Si el correo está registrado, recibirás un enlace para restablecer la contraseña.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">
                  <ArrowLeft /> Volver al inicio de sesión
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={enviar} className="space-y-4">
              <Field label="Correo electrónico">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@empresa.com"
                  autoComplete="email"
                  autoFocus
                />
              </Field>
              {error ? <FormMessage tipo="error" texto={error} /> : null}
              <Button type="submit" className="w-full" disabled={cargando}>
                {cargando ? <Loader2 className="animate-spin" /> : <Mail />}
                {cargando ? "Enviando…" : "Enviar enlace"}
              </Button>
              <Button asChild variant="ghost" size="sm" className="w-full">
                <Link href="/login">
                  <ArrowLeft /> Volver
                </Link>
              </Button>
            </form>
          )}
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            El envío requiere que configures SMTP en Supabase (Authentication → Emails).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
