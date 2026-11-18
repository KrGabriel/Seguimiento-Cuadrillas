import { AppShell } from "@/components/app-shell";
import { supabaseConfigurado } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { getPerfilActual } from "@/lib/queries";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let userEmail: string | null = null;
  let perfil = null;

  if (supabaseConfigurado) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;
    perfil = await getPerfilActual();
  }

  return (
    <AppShell
      userEmail={userEmail}
      rol={perfil?.rol}
      nombre={perfil?.nombre}
      demo={!supabaseConfigurado}
    >
      {children}
    </AppShell>
  );
}
