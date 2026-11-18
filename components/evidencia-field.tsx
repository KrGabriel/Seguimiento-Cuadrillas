"use client";

import { useRef, useState } from "react";
import { ExternalLink, Loader2, Paperclip, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { supabaseConfigurado } from "@/lib/env";

function nombreSeguro(nombre: string) {
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .slice(-80);
}

export function EvidenciaField({
  value,
  onChange,
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function subir(event: React.ChangeEvent<HTMLInputElement>) {
    const archivo = event.target.files?.[0];
    event.target.value = "";
    if (!archivo) return;
    setError(null);

    if (!supabaseConfigurado) {
      setError("Modo demostración: la evidencia no se puede subir.");
      return;
    }
    if (archivo.size > 5 * 1024 * 1024) {
      setError("El archivo supera 5 MB.");
      return;
    }

    setCargando(true);
    try {
      const supabase = createClient();
      const ruta = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${nombreSeguro(archivo.name)}`;
      const { error: uploadError } = await supabase.storage
        .from("evidencias")
        .upload(ruta, archivo, { contentType: archivo.type, upsert: false });
      if (uploadError) {
        setError(uploadError.message);
        return;
      }
      const { data } = supabase.storage.from("evidencias").getPublicUrl(ruta);
      onChange(data.publicUrl);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={subir}
          aria-label="Adjuntar evidencia"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={cargando}
        >
          {cargando ? <Loader2 className="animate-spin" /> : <Paperclip />}
          {value ? "Reemplazar evidencia" : "Adjuntar evidencia"}
        </Button>
        {value ? (
          <>
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-primary underline-offset-4 hover:underline"
            >
              <ExternalLink className="size-3" /> Ver evidencia
            </a>
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
              <X /> Quitar
            </Button>
          </>
        ) : null}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Imagen o PDF de hasta 5 MB. Requiere el bucket público “evidencias” (supabase/evidencias.sql).
      </p>
      {error ? <p className="text-[11px] text-red-400">{error}</p> : null}
    </div>
  );
}
