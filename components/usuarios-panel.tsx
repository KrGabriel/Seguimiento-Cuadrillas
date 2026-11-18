"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MailPlus, Save, Trash2, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Field, FormMessage } from "@/components/forms/form-field";
import { cambiarRolUsuario, eliminarUsuario, invitarUsuario } from "@/lib/user-actions";
import type { Perfil, RolUsuario } from "@/lib/types";

function FilaUsuario({ perfil, demo }: { perfil: Perfil; demo: boolean }) {
  const router = useRouter();
  const [rol, setRol] = useState<RolUsuario>(perfil.rol);
  const [activo, setActivo] = useState(perfil.activo);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; error: boolean } | null>(null);

  async function guardar() {
    setCargando(true);
    setMensaje(null);
    const resultado = await cambiarRolUsuario({ id: perfil.id, rol, activo });
    setCargando(false);
    setMensaje({ texto: resultado.ok ? resultado.mensaje ?? "Guardado." : resultado.error ?? "Error", error: !resultado.ok });
    if (resultado.ok && !demo) router.refresh();
  }

  async function borrar() {
    if (!window.confirm(`¿Eliminar definitivamente a ${perfil.email}? Esta acción no se puede deshacer.`)) return;
    setCargando(true);
    const resultado = await eliminarUsuario(perfil.id);
    setCargando(false);
    setMensaje({ texto: resultado.ok ? resultado.mensaje ?? "Eliminado." : resultado.error ?? "Error", error: !resultado.ok });
    if (resultado.ok && !demo) router.refresh();
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border/70 p-3 lg:flex-row lg:items-center">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{perfil.nombre || perfil.email}</p>
        <p className="truncate text-[11px] text-muted-foreground">{perfil.email}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={rol}
          onChange={(e) => setRol(e.target.value as RolUsuario)}
          aria-label={`Rol de ${perfil.email}`}
          className="h-8 w-[150px]"
        >
          <option value="Administrador">Administrador</option>
          <option value="Supervisor">Supervisor</option>
        </Select>
        <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <input
            type="checkbox"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
            className="size-3.5 accent-primary"
          />
          Activo
        </label>
        <Button type="button" size="sm" variant="outline" onClick={guardar} disabled={cargando}>
          {cargando ? <Loader2 className="animate-spin" /> : <Save />} Guardar
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={borrar} disabled={cargando}>
          <Trash2 />
        </Button>
      </div>
      {mensaje ? (
        <p className={mensaje.error ? "text-[11px] text-red-400 lg:w-full" : "text-[11px] text-emerald-400 lg:w-full"}>
          {mensaje.texto}
        </p>
      ) : null}
    </div>
  );
}

export function UsuariosPanel({ perfiles, demo }: { perfiles: Perfil[]; demo: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState<RolUsuario>("Supervisor");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; error: boolean } | null>(null);

  async function invitar(event: React.FormEvent) {
    event.preventDefault();
    setCargando(true);
    setMensaje(null);
    const resultado = await invitarUsuario({ email, nombre, rol });
    setCargando(false);
    setMensaje({ texto: resultado.ok ? resultado.mensaje ?? "Invitación enviada." : resultado.error ?? "Error", error: !resultado.ok });
    if (resultado.ok) {
      setEmail("");
      setNombre("");
      if (!demo) router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invitar usuario</CardTitle>
          <CardDescription>
            Se envía un correo de invitación. El usuario define su contraseña desde el enlace.
            {demo ? " En modo demostración no se envían correos." : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={invitar} className="grid gap-3 md:grid-cols-4">
            <Field label="Correo">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="persona@empresa.com"
                required
              />
            </Field>
            <Field label="Nombre">
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre completo" />
            </Field>
            <Field label="Rol">
              <Select value={rol} onChange={(e) => setRol(e.target.value as RolUsuario)}>
                <option value="Supervisor">Supervisor</option>
                <option value="Administrador">Administrador</option>
              </Select>
            </Field>
            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={cargando}>
                {cargando ? <Loader2 className="animate-spin" /> : <MailPlus />} Invitar
              </Button>
            </div>
            {mensaje ? (
              <div className="md:col-span-4">
                <FormMessage tipo={mensaje.error ? "error" : "ok"} texto={mensaje.texto} />
              </div>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Equipo con acceso</CardTitle>
            <CardDescription>Los cambios de rol y estado se aplican al instante.</CardDescription>
          </div>
          <Badge variant="outline">
            <UserCog className="mr-1 size-3" /> {perfiles.length}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-2">
          {perfiles.length === 0 ? (
            <p className="text-xs text-muted-foreground">Aún no hay usuarios en perfiles.</p>
          ) : (
            perfiles.map((perfil) => <FilaUsuario key={perfil.id} perfil={perfil} demo={demo} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
