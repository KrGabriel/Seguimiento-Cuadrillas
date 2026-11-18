# Cuadrillas OS

Aplicación web de gestión de cuadrillas, seguimiento de desempeño técnico y trazabilidad de equipos.
Construida con **Next.js 15 (App Router)**, TypeScript, Tailwind CSS, Supabase, Recharts y jsPDF.

## Funcionalidades

- Dashboard ejecutivo con KPIs, tendencia mensual, comparativo por cuadrilla y selector de mes.
- CRUD completo de técnicos y cuadrillas, con reasignación, baja lógica y bloqueo de baja si la
  cuadrilla tiene técnicos activos asignados.
- Registros de carga diaria (parte de técnico, incumplimientos, control operativo y movimiento de
  equipos) con edición, eliminación y **evidencias adjuntas** (foto o PDF en Supabase Storage).
- Listados globales de **Incumplimientos** y **Control operativo** para auditar todos los registros
  del período, independientes del módulo de carga.
- Informes con filtros, tablas ordenables, desglose por técnico/incumplimientos y exportación a PDF
  con logo, gráficos vectoriales, firma del responsable y pie de página.
- Sincronización automática del estado del vehículo de la cuadrilla al registrar el control
  operativo diario.
- Validaciones de negocio: sin fechas futuras, órdenes finalizadas/pendientes no pueden superar las
  asignadas, serie de equipo única y edición de partes diarios sin duplicar `(fecha, técnico)`.
- Autenticación con Supabase Auth y RLS para usuarios autenticados.
- **Roles y usuarios**: panel de administración para invitar usuarios, cambiar rol
  (Administrador, Supervisor, Técnico) y eliminarlos, con protección contra auto-bloqueo.
- **Auditoría**: triggers registran altas, cambios y bajas en las tablas principales; vista con
  filtros, KPIs, paginación y exportación CSV.
- **Alertas operativas** en el dashboard (reincidencias, reclamos, incumplimientos graves).
- Exportación CSV y paginación en los listados e informes.
- **PWA** instalable con manifest, ícono y página offline; service worker en producción.
- Eliminación definitiva de técnicos/cuadrillas solo sin historial (si lo tienen, baja lógica).
- **Modo demostración**: si no hay variables de Supabase, la app funciona con datos de ejemplo
  en memoria, sin persistir cambios.

## Puesta en marcha

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Crea un proyecto en [supabase.com](https://supabase.com) y ejecuta en el **SQL Editor**, en este
   orden, los scripts de [`supabase/`](./supabase):
   - `schema.sql` — tablas, enums, índices, RLS y datos iniciales.
   - `fix-permisos.sql` — `GRANT` para el rol `authenticated`.
   - `usuarios-roles.sql` — perfiles, roles y políticas.
   - `auditoria.sql` — tabla de auditoría y triggers.
   - `evidencias.sql` — columnas y bucket público `evidencias`.

3. Crea el usuario administrador en **Authentication → Users** (email + contraseña). Si el trigger
   no le asignó rol, actualízalo a `Administrador` en la tabla `perfiles`.

4. Copia `.env.example` a `.env.local` y completa:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=TU-ANON-KEY
   NEXT_PUBLIC_EMPRESA_NOMBRE=Nombre de tu empresa
   NEXT_PUBLIC_EMPRESA_LOGO_URL=https://tu-dominio.com/logo.png
   NEXT_PUBLIC_RESPONSABLE_NOMBRE=Nombre del responsable
   SUPABASE_SERVICE_ROLE_KEY=TU-SERVICE-ROLE-KEY
   ```

   `NEXT_PUBLIC_EMPRESA_LOGO_URL` y `NEXT_PUBLIC_RESPONSABLE_NOMBRE` son opcionales: se usan en
   el encabezado y la firma de los PDF. Si el logo externo no permite CORS, el PDF usa un monograma
   con las iniciales de la empresa. `SUPABASE_SERVICE_ROLE_KEY` solo es necesaria para invitar y
   eliminar usuarios desde el panel; nunca debe exponerse al cliente. `SUPABASE_SERVICE_ROLE_KEY` solo es necesaria para invitar y
   eliminar usuarios desde el panel; nunca debe exponerse al cliente.

5. Ejecuta:

   ```bash
   npm run dev
   ```

### Datos de prueba

Para ver la aplicación con información realista antes de cargar datos reales:

1. Ejecuta [`supabase/datos-prueba.sql`](./supabase/datos-prueba.sql) en el SQL Editor de
   Supabase. Crea 4 cuadrillas, 8 técnicos, ~3 meses de partes diarios, incumplimientos,
   controles operativos y movimientos de equipos. Es re-ejecutable y solo reemplaza sus propios
   datos (prefijos `PRUEBA ` / `TEST-`).
2. Inicia sesión con tu usuario administrador y navega el dashboard, listados e informes.
3. Cuando termines, ejecuta [`supabase/limpiar-datos-prueba.sql`](./supabase/limpiar-datos-prueba.sql)
   para borrar únicamente esos datos.

### Despliegue en Vercel

Importa el repositorio, agrega las variables de entorno (`SUPABASE_SERVICE_ROLE_KEY` es opcional,
solo para gestionar usuarios) y despliega. La autenticación y las políticas RLS se aplican
automáticamente en producción.

## Estructura del proyecto

```text
app/
  layout.tsx                  Layout raíz (dark mode)
  page.tsx                    Redirección a /dashboard
  login/                      Acceso administrador
  (app)/                      Rutas protegidas con shell de navegación
    layout.tsx
    dashboard/                KPIs, gráficos y resumen ejecutivo
    auditoria/                Bitácora de cambios con filtros y CSV
    usuarios/                 Administración de usuarios y roles
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
  evidencia-field.tsx         Adjuntar foto/PDF a un registro
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
  usuarios-roles.sql          Perfiles, roles y políticas
  auditoria.sql               Bitácora y triggers
  evidencias.sql              Bucket de evidencias
  datos-prueba.sql            Dataset de prueba re-ejecutable
tests/                        Pruebas unitarias (Vitest)
.github/workflows/ci.yml      Typecheck, tests y build en CI
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
npm run test       # pruebas unitarias (Vitest)
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
