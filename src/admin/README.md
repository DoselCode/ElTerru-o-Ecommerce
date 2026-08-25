# Módulo B: Dashboard Administrador (Panel Privado)

Esta carpeta define la estructura base para el panel de administración interno.

## Estructura de Integración Futura

- `types.ts`: Define las interfaces de autenticación, el DTO de producto y las operaciones CRUD requeridas por la interfaz de usuario.
- `components/`: Aquí se desarrollarán los componentes del panel (Login, Dashboard Layout, Tabla CRUD de Productos, Modal de Edición/Creación) cuando el backend esté disponible.

## Operaciones CRUD requeridas:
1. **Autenticación**: Login con usuario y contraseña.
2. **Productos**:
   - Creación de nuevos ítems con campos: `name`, `category`, `price`, `originalPrice`, `description`, `winery`, `pairing`, `stock`, `image`, `isFeatured`, `isVisible`.
   - Modificación y guardado de productos existentes.
   - Conmutación de visibilidad (Ocultar/Mostrar).
   - Eliminación de productos.
   - Marcado de "Producto Destacado" para la sección hero destacada.
