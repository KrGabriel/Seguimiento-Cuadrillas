# Cuadrillas OS

Aplicación web de gestión de cuadrillas, seguimiento de desempeño técnico y trazabilidad de equipos.
Construida con **Next.js 15 (App Router)**, TypeScript, Tailwind CSS, Supabase, Recharts y jsPDF.

## Funcionalidades

- Dashboard ejecutivo con KPIs, tendencia mensual, comparativo por cuadrilla y selector de mes.
- CRUD completo de técnicos y cuadrillas, con reasignación, baja lógica y bloqueo de baja si la
  cuadrilla tiene técnicos activos asignados.
- Registros de carga diaria (parte de técnico, incumplimientos, control operativo y movimiento de
  equipos) con edición y eliminación desde cada módulo.
- Listados globales de **Incumplimientos** y **Control operativo** para auditar todos los registros
  del período, independientes del módulo de carga.
- Informes con filtros, tablas ordenables, desglose por técnico/incumplimientos y exportación a PDF
  con logo, gráficos vectoriales, firma del responsable y pie de página.
- Sincronización automática del estado del vehículo de la cuadrilla al registrar el control
  operativo diario.
- Validaciones de negocio: sin fechas futuras, órdenes finalizadas/pendientes no pueden superar las
  asignadas, serie de equipo única y edición de partes diarios sin duplicar `(fecha, técnico)`.
- Autenticación con Supabase Auth y RLS para usuarios autenticados (rol Administrador).
- **Modo demostración**: si no hay variables de Supabase, la app funciona con datos de ejemplo
  en memoria, sin persistir cambios.

## Puesta en marcha

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Crea un proyecto en [supabase.com](https://supabase.com) y ejecuta el contenido de
   [`supabase/schema.sql`](./supabase/schema.sql) en el **SQL Editor**. El script crea tablas,
   enums, índices, vista de apoyo, políticas RLS y datos iniciales.

3. Crea el usuario administrador en **Authentication → Users** (email + contraseña).

4. Copia `.env.example` a `.env.local` y completa:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=TU-ANON-KEY
   NEXT_PUBLIC_EMPRESA_NOMBRE=Nombre de tu empresa
   NEXT_PUBLIC_EMPRESA_LOGO_URL=https://tu-dominio.com/logo.png
   NEXT_PUBLIC_RESPONSABLE_NOMBRE=Nombre del responsable
   ```

   `NEXT_PUBLIC_EMPRESA_LOGO_URL` y `NEXT_PUBLIC_RESPONSABLE_NOMBRE` son opcionales: se usan en
   el encabezado y la firma de los PDF. Si el logo externo no permite CORS, el PDF usa un monograma
   con las iniciales de la empresa.

5. Ejecuta:

   ```bash
   npm run dev
   ```

### Despliegue en Vercel

Importa el repositorio, agrega las cinco variables de entorno y despliega. La autenticación y las
políticas RLS se aplican automáticamente en producción.

## Estructura del proyecto

```text
app/
  layout.tsx                  Layout raíz (dark mode)
  page.tsx                    Redirección a /dashboard
  login/                      Acceso administrador
  (app)/                      Rutas protegidas con shell de navegación
    layout.tsx
    dashboard/                KPIs, gráficos y resumen ejecutivo
    tecnicos/                 Listado, alta y edición con reasignación
    cuadrillas/               Listado, alta y edición + estado de vehículo
    carga/                    Formularios de carga diaria (alta, edición y baja)
      parte-diario/
      incumplimiento/
      operativo/
      equipo/
    incumplimientos/          Listado global de incumplimientos
    operativo/                Listado global de control operativo
    informes/
      tecnicos/               Ficha individual + radar + PDF
      cuadrillas/             Comparativo de 8 ejes + desglose + PDF
      equipos/                Manifiesto con búsqueda + PDF
components/
  ui/                         Primitivas estilo shadcn/ui
  forms/                      Formularios react-hook-form + zod
  charts/                     Visualizaciones Recharts
  app-shell.tsx               Sidebar, topbar y navegación
  data-table.tsx              Tabla ordenable genérica
  filters-bar.tsx             Filtros globales (fechas, técnico, cuadrilla, etc.)
  export-pdf-button.tsx       Exportación PDF por tipo de informe
lib/
  supabase/                   Clientes browser/server/middleware
  actions.ts                  Server Actions (insert/update + auth)
  queries.ts                  Consultas con fallback a datos demo
  analytics.ts                Cálculo de KPIs, fichas y comparativos
  pdf.ts                      Generadores de PDF (jsPDF + autotable)
  schemas.ts                  Validaciones Zod
  demo.ts                     Dataset de demostración
  types.ts                    Tipos del dominio
supabase/
  schema.sql                  Esquema completo de base de datos
middleware.ts                 Protección de rutas y refresco de sesión
```

## Notas de negocio

- Cada registro histórico guarda `tecnico_id` y `cuadrilla_id` para preservar la trazabilidad
  aunque el técnico cambie de cuadrilla.
- `registros_diarios_tecnicos` es único por `(fecha, tecnico_id)`.
- `metricas_cuadrilla_diaria` es único por `(fecha, cuadrilla_id)`.
- `movimientos_equipos.numero_serie` es único.
- El control operativo diario sincroniza `cuadrillas.estado_vehiculo` con el estado reportado.
- La reincidencia cuenta eventos del mismo tipo repetidos por un mismo técnico (el primero no
  cuenta como reincidencia).
- El porcentaje de tareas finalizadas se calcula como
  `(instalaciones + reparaciones + bajas + cambios) / (eso + pendientes)`.

## Comandos

```bash
npm run dev        # desarrollo
npm run build      # build de producción
npm run start      # servidor de producción
npm run typecheck  # verificación de tipos
```

## Solución de problemas

**`permission denied for table ...`** — el rol `authenticated` no tiene `GRANT` sobre las tablas
(aunque las políticas RLS existan). Ejecuta [`supabase/fix-permisos.sql`](./supabase/fix-permisos.sql)
en el SQL Editor de Supabase. Luego cierra sesión y vuelve a entrar con el usuario administrador:
las políticas están definidas `to authenticated`, por lo que la petición debe llevar una sesión
válida (no sirve la anon key sin login). El script final imprime una verificación de RLS, políticas
y privilegios.

**`relation ... does not exist`** — el esquema no está creado; ejecuta
[`supabase/schema.sql`](./supabase/schema.sql).
