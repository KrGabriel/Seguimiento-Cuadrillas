export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const supabaseConfigurado = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const EMPRESA_NOMBRE = process.env.NEXT_PUBLIC_EMPRESA_NOMBRE ?? "Cuadrillas OS";
export const EMPRESA_LOGO_URL = process.env.NEXT_PUBLIC_EMPRESA_LOGO_URL ?? "";
export const RESPONSABLE_NOMBRE =
  process.env.NEXT_PUBLIC_RESPONSABLE_NOMBRE ?? "Supervisión de Operaciones";
