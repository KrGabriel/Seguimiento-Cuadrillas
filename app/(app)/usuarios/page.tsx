import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UsuariosPanel } from "@/components/usuarios-panel";
import { getPerfilActual, getPerfiles } from "@/lib/queries";
import { supabaseConfigurado } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const perfil = await getPerfilActual();

  if (perfil && perfil.rol !== "Administrador") {
    return (
      <>
        <PageHeader title="Usuarios y roles" description="Gestión de accesos al sistema." />
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <ShieldAlert className="size-8 text-amber-400" />
            <p className="text-sm font-medium">Acceso restringido</p>
            <p className="max-w-md text-xs text-muted-foreground">
              Solo los usuarios con rol Administrador pueden invitar personas o cambiar roles.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard">Volver al dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  const perfiles = await getPerfiles();

  return (
    <>
      <PageHeader
        title="Usuarios y roles"
        description="Administra quién puede entrar y con qué nivel de permisos. Requiere supabase/usuarios-roles.sql y SUPABASE_SERVICE_ROLE_KEY."
      />
      <UsuariosPanel perfiles={perfiles} demo={!supabaseConfigurado} />
    </>
  );
}
