# Sistema Integrado de Gestión Logística - ONG

Sistema frontend-only para gestión logística de una ONG validada por ONEMI, construido con Next.js 14, TypeScript, TailwindCSS y shadcn/ui.

## Características

- **Dashboard**: Panel con KPIs, gráficos y alertas de stock
- **Gestión de Cursos**: CRUD completo con checklists, participantes y facturas
- **Inventario**: Control de stock con alertas y movimientos
- **Participantes**: Gestión de alergias y tallas
- **Proveedores**: Administración de contactos
- **Reportes**: Análisis con gráficos exportables
- **Configuración**: Parámetros y gestión de roles

## Stack Tecnológico

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS v4
- shadcn/ui
- React Hook Form + Zod
- Chart.js
- date-fns

## Instalación

\`\`\`bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build

# Ejecutar en producción
npm start
\`\`\`

## Estructura del Proyecto

\`\`\`
├── app/
│   ├── auth/              # Página de autenticación
│   ├── app/               # Aplicación principal
│   │   ├── dashboard/     # Panel de control
│   │   ├── cursos/        # Gestión de cursos
│   │   ├── inventario/    # Control de inventario
│   │   ├── movimientos/   # Historial de movimientos
│   │   ├── participantes/ # Gestión de participantes
│   │   ├── proveedores/   # Gestión de proveedores
│   │   ├── reportes/      # Reportes y análisis
│   │   └── ajustes/       # Configuración
├── components/
│   ├── ui/                # Componentes de shadcn/ui
│   ├── dashboard/         # Componentes del dashboard
│   ├── cursos/            # Componentes de cursos
│   ├── inventario/        # Componentes de inventario
│   ├── proveedores/       # Componentes de proveedores
│   └── reportes/          # Componentes de reportes
├── lib/
│   ├── types.ts           # Tipos TypeScript
│   ├── mock.ts            # Servicio de datos mock
│   ├── utils.ts           # Utilidades
│   └── i18n/
│       └── es.ts          # Textos en español
└── public/                # Archivos estáticos
\`\`\`

## Datos Mock

El sistema utiliza datos simulados en `lib/mock.ts` con funciones async que imitan un backend real. Todos los datos se almacenan en memoria durante la sesión.

## Integración con Firebase (Futuro)

Para conectar con Firebase:

1. **Instalar Firebase**:
   \`\`\`bash
   npm install firebase
   \`\`\`

2. **Configurar Firebase**:
   Crear `lib/firebase.ts` con la configuración de tu proyecto.

3. **Colecciones de Firestore sugeridas**:
   - `cursos` - Datos de cursos
   - `checklist_items` - Items de checklists
   - `inventario` - Stock de materiales
   - `movimientos` - Historial de movimientos
   - `participantes` - Datos de participantes
   - `proveedores` - Información de proveedores
   - `facturas` - Facturas y documentos

4. **Reemplazar mock API**:
   Sustituir las funciones en `lib/mock.ts` con llamadas a Firestore.

## Características de Accesibilidad

- Diseño responsive mobile-first
- Contraste WCAG AA
- Labels asociadas a inputs
- Navegación por teclado
- Roles ARIA en componentes

## Roles de Usuario (Demo)

- **Administrador**: Acceso completo (CRUD)
- **Instructor**: Ver y editar cursos asignados, actualizar checklists
- **Lectura**: Solo visualización

El selector de rol en el topbar es solo para demostración. En producción, los roles se gestionarían con Firebase Authentication.

## Exportación de Datos

Todas las tablas principales incluyen funcionalidad de exportación a CSV (frontend-only).

## Notas Importantes

- Este es un sistema **frontend-only** sin backend real
- Los datos se pierden al recargar la página
- La autenticación es simulada (placeholder)
- Los uploads de archivos son simulados
- Para producción, integrar con Firebase o backend real

## Licencia

MIT
