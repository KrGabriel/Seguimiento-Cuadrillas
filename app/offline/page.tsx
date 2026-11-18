import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sin conexión · Cuadrillas OS",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-5 rounded-xl border border-border bg-card p-8 text-center shadow-xl">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
          <WifiOff className="size-6" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-lg font-semibold tracking-tight">Sin conexión</h1>
          <p className="text-sm text-muted-foreground">
            No pudimos contactar al servidor. Revisa tu red; los datos se sincronizarán al reconectar.
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href="/dashboard">Reintentar</Link>
        </Button>
        <p className="text-[11px] text-muted-foreground">
          Si el problema persiste, cierra sesión y vuelve a ingresar.
        </p>
      </div>
    </main>
  );
}
