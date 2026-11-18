import { AppShell } from "@/components/app-shell";
import { supabaseConfigurado } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let userEmail: string | null = null;

  if (supabaseConfigurado) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;
  }

  return (
    <AppShell userEmail={userEmail} demo={!supabaseConfigurado}>
      {children}
    </AppShell>
  );
}
