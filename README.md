# El Terruño

Sitio web y sistema de gestión de **El Terruño**, un almacén gourmet y vinos boutique de Jesús María, Córdoba (Argentina).

El proyecto tiene dos partes en una misma aplicación:

- **Tienda pública** (`/`): landing con catálogo de productos, producto destacado, historia del local, horarios y contacto. Los clientes consultan los productos y escriben por WhatsApp; no hay carrito ni pagos online.
- **Panel de administración** (`/admin`): herramienta interna para operar el local: punto de venta (POS), inventario, historial de ventas, caja y configuración de la landing.

## Propósito

Darle al local una presencia online que se administre sola (productos, textos, fotos y horarios editables sin tocar código) y, a la vez, reemplazar el control manual de ventas, stock y caja por un sistema simple que funcione aunque se corte internet.

## Funcionalidades

**Tienda pública**
- Catálogo con búsqueda, filtros por categoría y paginación.
- Producto destacado con etiquetas de descuento configurables.
- Contenido editable desde el panel: portada, historia, estadísticas, contacto y horarios.
- SEO (meta tags, Open Graph) generado con los datos de la tienda.

**Panel de administración**
- **Punto de venta:** catálogo con filtros, carrito, cobro y ticket imprimible (comprobante no válido como factura).
- **Descuentos por método de pago:** 10% en efectivo y en transferencia; sin descuento en tarjeta de crédito o débito.
- **Inventario:** grilla ordenable con categoría y proveedor, alta y edición de productos, visibilidad y "best seller".
- **Ventas:** historial con filtros por texto, método de pago y rango de fechas; detalle del ticket, cambio de método y anulación con reposición de stock.
- **Caja:** apertura, ingresos y egresos manuales, cierre con arqueo.
- **Modo offline:** las operaciones que fallan por falta de conexión se guardan en el navegador y se sincronizan al volver internet.
- **Acceso restringido:** solo ingresan los usuarios registrados como administradores.

## Stack

| Área | Tecnología |
| :--- | :--- |
| Frontend | React 19, TypeScript, Vite |
| Estilos | Tailwind CSS v4, Phosphor Icons |
| Ruteo y SEO | React Router, React Helmet Async |
| Backend | [InsForge](https://insforge.dev) (PostgreSQL, autenticación, storage) mediante `@insforge/sdk` |
| Tests | Vitest + React Testing Library, e2e |
| Hosting | Vercel |

## Estructura

```
src/
├── App.tsx / main.tsx     # Rutas y arranque (el admin se carga bajo demanda)
├── admin/                 # Panel de administración (ver src/admin/README.md)
├── components/            # Landing pública: navbar, secciones y piezas compartidas
├── hooks/                 # Hooks de la landing
├── services/              # Acceso a datos: productos, ventas, caja y storage
├── lib/insforge.ts        # Cliente único de InsForge
└── types/                 # Modelos de producto y de la tienda
migrations/                # Esquema de la base de datos y políticas RLS (SQL)
docs/                      # Documentación de diseño, animaciones y changelog
openspec/                  # Propuestas y especificaciones de cambios
tests/                     # Tests end-to-end
```

Más detalle en [src/README.md](src/README.md) y [src/admin/README.md](src/admin/README.md).

## Puesta en marcha

Requisitos: Node.js 20 o superior y un proyecto de InsForge.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Completá `.env.local` con los datos del proyecto (Dashboard de InsForge):

| Variable | Descripción |
| :--- | :--- |
| `VITE_INSFORGE_URL` | URL del backend, por ejemplo `https://tu-proyecto.us-east.insforge.app` |
| `VITE_INSFORGE_ANON_KEY` | Clave anónima (pública por diseño) |
| `INSFORGE_API_KEY` | Opcional. Clave de administrador, solo para scripts y CLI; **nunca** se expone al navegador ni se commitea |

## Scripts

| Comando | Qué hace |
| :--- | :--- |
| `npm run dev` | Servidor de desarrollo |
| `npm run typecheck` | Valida los tipos de TypeScript |
| `npm run build` | Typecheck y build de producción en `dist/` |
| `npm run preview` | Sirve el build localmente |
| `npm test` | Tests unitarios y de componentes |
| `npm run test:e2e` | Tests end-to-end |

## Base de datos y seguridad

- El esquema vive en `migrations/` y se aplica con `npx @insforge/cli db migrations up --all`.
- **Row Level Security** en todas las tablas: el público solo puede leer productos, categorías, proveedores y la configuración de la tienda. Ventas y caja no tienen acceso público.
- La escritura (y la lectura de ventas y caja) está limitada a los usuarios cargados en la tabla `admins`. Para sumar un administrador, agregá su `user_id` (Dashboard de InsForge, sección Authentication) a esa tabla.
- Se recomienda mantener el registro público de usuarios deshabilitado en la configuración de autenticación.
- `vercel.json` define los headers de seguridad (CSP, `X-Frame-Options`, HSTS, entre otros).

## Entornos

- **Desarrollo y testing:** InsForge (rama `develop`).
- **Producción:** el sitio publicado en `main` corre actualmente sobre Supabase; la migración a InsForge está pendiente.

## Documentación adicional

- [docs/Diseño.md](docs/Diseño.md): componentes y lineamientos UX/UI.
- [docs/Animaciones.md](docs/Animaciones.md): animaciones de scroll y levitación.
- [docs/Changelog.md](docs/Changelog.md): historial de cambios.
