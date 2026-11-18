"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { supabaseConfigurado } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPerfilActual } from "@/lib/queries";
import type { RolUsuario } from "@/lib/types";

type ResultadoUsuario = { ok: boolean; error?: string; demo?: boolean; mensaje?: string };

const ROLES: RolUsuario[] = ["Administrador", "Supervisor"];

async function verificarAdministrador(): Promise<ResultadoUsuario | null> {
  if (!supabaseConfigurado) return null;
  const perfil = await getPerfilActual();
  if (!perfil || perfil.rol !== "Administrador") {
    return { ok: false, error: "Solo un Administrador puede gestionar usuarios." };
  }
  return null;
}

export async function invitarUsuario(data: {
  email: string;
  nombre?: string;
  rol: RolUsuario;
}): Promise<ResultadoUsuario> {
  const permiso = await verificarAdministrador();
  if (permiso) return permiso;

  const email = data.email?.trim().toLowerCase() ?? "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Ingresa un correo válido." };
  }
  if (!ROLES.includes(data.rol)) return { ok: false, error: "Rol inválido." };

  if (!supabaseConfigurado) {
    revalidatePath("/usuarios");
    return { ok: true, demo: true, mensaje: "Invitación simulada en modo demostración." };
  }

  const admin = createAdminClient();
  if (!admin) {
    return {
      ok: false,
      error: "Falta SUPABASE_SERVICE_ROLE_KEY en el servidor para invitar usuarios.",
    };
  }

  const headerList = await headers();
  const origin = headerList.get("origin");

  const { data: invitado, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: origin ? `${origin}/actualizar-password` : undefined,
  });
  if (error || !invitado.user) {
    return { ok: false, error: error?.message ?? "No se pudo enviar la invitación." };
  }

  const { error: perfilError } = await admin.from("perfiles").upsert({
    id: invitado.user.id,
    email,
    nombre: data.nombre?.trim() || email,
    rol: data.rol,
    activo: true,
  });
  if (perfilError) {
    return { ok: false, error: `Usuario invitado, pero no se guardó el perfil: ${perfilError.message}` };
  }

  revalidatePath("/usuarios");
  return { ok: true, mensaje: `Invitación enviada a ${email}.` };
}

export async function cambiarRolUsuario(data: {
  id: string;
  rol: RolUsuario;
  activo: boolean;
}): Promise<ResultadoUsuario> {
  const permiso = await verificarAdministrador();
  if (permiso) return permiso;
  if (!ROLES.includes(data.rol)) return { ok: false, error: "Rol inválido." };

  const perfilActual = await getPerfilActual();
  if (perfilActual && perfilActual.id === data.id && (data.rol !== "Administrador" || !data.activo)) {
    return { ok: false, error: "No puedes quitarte tu propio rol ni desactivar tu cuenta." };
  }

  if (!supabaseConfigurado) {
    revalidatePath("/usuarios");
    return { ok: true, demo: true, mensaje: "Cambio simulado en modo demostración." };
  }

  const admin = createAdminClient();
  if (!admin) {
    return { ok: false, error: "Falta SUPABASE_SERVICE_ROLE_KEY en el servidor." };
  }

  const { error } = await admin
    .from("perfiles")
    .update({ rol: data.rol, activo: data.activo })
    .eq("id", data.id);
  if (error) return { ok: false, error: error.message };

  const { error: authError } = await admin.auth.admin.updateUserById(data.id, {
    ban_duration: data.activo ? "none" : "876000h",
  });
  if (authError) {
    return { ok: false, error: `Rol guardado, pero no se pudo actualizar el acceso: ${authError.message}` };
  }

  revalidatePath("/usuarios");
  return { ok: true, mensaje: "Usuario actualizado." };
}

export async function eliminarUsuario(id: string): Promise<ResultadoUsuario> {
  const permiso = await verificarAdministrador();
  if (permiso) return permiso;

  const perfilActual = await getPerfilActual();
  if (perfilActual && perfilActual.id === id) {
    return { ok: false, error: "No puedes eliminar tu propia cuenta." };
  }

  if (!supabaseConfigurado) {
    revalidatePath("/usuarios");
    return { ok: true, demo: true, mensaje: "Eliminación simulada en modo demostración." };
  }

  const admin = createAdminClient();
  if (!admin) {
    return { ok: false, error: "Falta SUPABASE_SERVICE_ROLE_KEY en el servidor." };
  }

  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/usuarios");
  return { ok: true, mensaje: "Usuario eliminado." };
}
