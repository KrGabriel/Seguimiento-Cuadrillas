"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabaseConfigurado } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!supabaseConfigurado) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setCargando(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setCargando(false);

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "Credenciales inválidas. Verifica tu correo y contraseña."
          : "No se pudo iniciar sesión. Intenta nuevamente.",
      );
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Correo electrónico</Label>
        <div className="relative">
          <Mail className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required={supabaseConfigurado}
            placeholder="admin@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <div className="relative">
          <Lock className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required={supabaseConfigurado}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {error ? (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      ) : null}

      {!supabaseConfigurado ? (
        <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          Supabase aún no está configurado. Puedes ingresar en modo demostración con datos de
          ejemplo.
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={cargando}>
        {cargando ? <Loader2 className="animate-spin" /> : null}
        {supabaseConfigurado ? "Iniciar sesión" : "Entrar en modo demostración"}
      </Button>
    </form>
  );
}
