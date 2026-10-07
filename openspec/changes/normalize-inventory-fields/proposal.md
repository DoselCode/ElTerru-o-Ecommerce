# Proposal: Normalize Inventory Fields (Categoria & Proveedor)

## Intent

Normalizar la estructura de datos del inventario para extraer los conceptos de Categoría y Proveedor hacia sus propias tablas. Actualmente el sistema carece de esta clasificación estructurada. Esto permitirá organizar mejor el stock, filtrar productos en el futuro y mostrar información clara en la tabla de Inventario y Stock, según el mockup provisto. 

## Scope

### In Scope
- Creación de tablas `categories` y `providers` en InsForge (vía migraciones o SQL script).
- Añadir relaciones (Foreign Keys) en la tabla `products` (`category_id`, `provider_id`).
- Poblar las nuevas tablas con datos de ejemplo (ej. Categorías: Vinos, Almacén, Fiambres; Proveedores: Genérico).
- Actualizar los tipos de TypeScript desde InsForge.
- Modificar la vista de `Inventario y Stock` (`Stock.tsx`) para agregar las columnas "PROVEEDOR" y "CATEGORIA", con estilos de *badges* según el diseño.
- Modificar `ProductForm.tsx` para permitir seleccionar la categoría y el proveedor al crear/editar.

### Out of Scope
- Interfaz (ABM/CRUD) completa para crear, editar o eliminar Categorías y Proveedores desde el panel de administración (se usarán los precargados temporalmente o se requerirá carga manual en DB por ahora).
- Filtros avanzados por proveedor/categoría en la tabla (solo visualización, a menos que el componente ya lo soporte fácilmente).

## Capabilities

### New Capabilities
- `inventory-categorization`: Gestión de categorías y proveedores vinculados a los productos en el catálogo.

### Modified Capabilities
- None

## Approach

1. **Database:** Escribir y ejecutar un script SQL en InsForge para crear las tablas `categories` y `providers` (id, name, created_at). Alterar la tabla `products` para agregar `category_id` y `provider_id`.
2. **Types:** Regenerar tipos de InsForge (`types/InsForge.ts`) o actualizar manualmente la interfaz `Product`.
3. **UI:** Actualizar `Stock.tsx` para mostrar ambas columnas. Usar etiquetas redondeadas (badges) para las categorías (como se ve en el mockup que dice "VINOS", "ALMACEN").
4. **Form:** Incorporar `<select>` en `ProductForm.tsx` alimentado por consultas a `categories` y `providers`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `InsForge/` | New | Script de migración SQL para estructura y datos de ejemplo |
| `src/types/` | Modified | Actualización del tipo `Product` y adición de `Category`/`Provider` |
| `src/admin/Stock.tsx` | Modified | Agregadas nuevas columnas visuales |
| `src/admin/ProductForm.tsx` | Modified | Nuevos campos de formulario para asociar IDs |
| `src/services/` | Modified | Lógica de obtención de categorías/proveedores y asociación al producto |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Productos existentes quedan huérfanos de categoría | High | El script SQL debe asignar una categoría y proveedor "Por defecto" a los registros existentes para mantener consistencia. |
| Romper el guardado actual | Low | Asegurar que `productFormUtils` se actualice con los nuevos campos opcionales o requeridos. |

## Rollback Plan

- Revertir las modificaciones en el UI y frontend.
- Correr script SQL inverso: hacer `ALTER TABLE products DROP COLUMN category_id, provider_id`, y luego hacer `DROP TABLE categories, providers`.

## Dependencies

- Ninguna dependencia externa, solo acceso administrativo a InsForge para ejecutar SQL.

## Success Criteria

- [ ] La tabla de Inventario muestra correctamente los *badges* de categoría y proveedor por producto.
- [ ] Es posible guardar un nuevo producto eligiendo su categoría y proveedor.
- [ ] La estructura en InsForge está correctamente normalizada con FKs.

