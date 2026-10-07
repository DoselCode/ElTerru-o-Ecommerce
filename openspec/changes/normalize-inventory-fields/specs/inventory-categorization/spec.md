# Spec: Inventory Categorization

## Objective

Estructurar los datos de inventario para que cada producto esté asociado a una categoría (ej. Vinos, Almacén, Fiambres) y a un proveedor, permitiendo una organización escalable del catálogo y una mejor presentación visual en el panel de control.

## Requirements

1. **Estructura de Base de Datos:**
   - La base de datos debe contener una tabla `categories` con al menos: `id` (UUID o serial), `name` (text), `created_at`.
   - La base de datos debe contener una tabla `providers` con al menos: `id` (UUID o serial), `name` (text), `created_at`.
   - La tabla `products` debe tener claves foráneas nulas o no nulas (`category_id`, `provider_id`) apuntando a estas tablas.
   - Datos iniciales (semilla) deben ser inyectados para poder probar el sistema inmediatamente (Categorías: Vinos, Almacén, Fiambres, Regalos. Proveedores: Proveedor General, Bodega X).

2. **Visualización en Tabla de Stock (`Stock.tsx`):**
   - El listado de inventario debe sumar dos columnas nuevas: "PROVEEDOR" y "CATEGORÍA" (o combinarlas según dicte el diseño). Según el mockup, se deben mostrar *badges* (pastillas con fondo tenue y texto en negrita/mayúsculas) para representar estos datos (ej. badge naranja/marrón claro para Vinos).
   - Si un producto no tiene categoría o proveedor, se debe mostrar un indicador vacío (ej. "---" o badge gris "Sin asignar").

3. **Formulario de Producto (`ProductForm.tsx`):**
   - El formulario de creación y edición debe permitir seleccionar la Categoría y el Proveedor desde un `<select>` o componente equivalente.
   - Las opciones de los selectores deben provenir directamente de la base de datos (fetch a las tablas `categories` y `providers`).
   - El guardado del formulario debe enviar correctamente los UUIDs o IDs seleccionados a la base de datos (mediante actualización del payload de la tabla `products`).

## Edge Cases

- **Productos existentes:** Si el script SQL agrega claves foráneas estrictas (no-nulas), fallará para productos existentes. Por lo tanto, el script debe: crear las tablas, insertar un registro "Por Defecto" o "Sin Clasificar" y asignar su ID a los productos existentes, o bien dejar las columnas como anulables (nullable). Preferible: anulables temporalmente, para mayor compatibilidad, pero mostrando "Sin Asignar" en la UI.
- **Latencia de red:** La carga de opciones en el formulario (`ProductForm`) debe manejar estados de carga si las tablas de categorías tardan en responder (ej. spinners).

## Out of Scope
- No se requiere desarrollar pantallas de administración CRUD para crear/editar categorías nuevas, se asume que por ahora se manejan en BD o con un script.

