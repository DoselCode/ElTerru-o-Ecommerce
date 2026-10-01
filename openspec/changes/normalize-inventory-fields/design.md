# Design: Normalize Inventory Fields (Categoria & Proveedor)

## Architecture

El cambio involucra todo el stack vertical:
- **Base de Datos (InsForge):** Script SQL en migraciones o raw SQL. Tablas `categories`, `providers`. Claves foráneas en `products`.
- **Servicios:** Actualización del tipo `Product` y `ProductInput` en `src/types/product.ts`. Nuevas funciones en `productService.ts` (ej. `getCategories()`, `getProviders()`) o un nuevo servicio `taxonomyService.ts` para abstraerlo.
- **UI de Tabla (`Stock.tsx`):**
  - Agregar al `<thead>` las cabeceras `CATEGORÍA` y `PROVEEDOR`.
  - Agregar al `<tbody>` las celdas. Para las celdas de clasificación usaremos un componente interno o estilo en `admin.css` tipo `.badge-category` con color cálido (ej. fondo `#fef3c7`, texto `#92400e`).
- **UI de Formulario (`ProductForm.tsx`):**
  - Usar `useEffect` para cargar la lista de categorías y proveedores desde InsForge.
  - Implementar nuevos `FormField` para cada uno con un tag `<select>`.

## State & Data Flow

1. Al montar `Stock.tsx`:
   - El listado de productos debe venir con las relaciones cargadas. En InsForge, esto se hace usando el operador de select con inner joins: `InsForge.from('products').select('*, category:categories(name), provider:providers(name)')`.
   - Si no se usa join, se deberán recuperar los IDs y mapearlos, pero el `join` nativo es la mejor forma. Modificaremos la query principal de `productService.getProducts()`.
2. Al montar `ProductForm.tsx`:
   - Se carga el estado local: `categories: Category[]`, `providers: Provider[]`.
   - Se mapean los estados al UI.
   - El objeto `formData` incluye `category_id` y `provider_id`.

## Database Schema (InsForge SQL)

```sql
-- Create providers table
CREATE TABLE public.providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Alter products to add FKs
ALTER TABLE public.products
ADD COLUMN provider_id UUID REFERENCES public.providers(id) ON DELETE SET NULL,
ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Add RLS policies (assuming public read, authenticated write for admin)
CREATE POLICY "Enable read access for all users" ON public.providers FOR SELECT USING (true);
CREATE POLICY "Enable all access for authenticated users" ON public.providers FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Enable all access for authenticated users" ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert dummy data
INSERT INTO public.categories (name) VALUES ('Vinos'), ('Almacén'), ('Fiambres'), ('Regalos');
INSERT INTO public.providers (name) VALUES ('Bodega López'), ('Distribuidora Central'), ('Proveedor General');
```

## UI Details

- **Badge de Categoría/Proveedor:**
  ```css
  .badge-tag {
    display: inline-flex;
    align-items: center;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    background: #fdf6e3;
    color: #92400e;
    letter-spacing: 0.5px;
  }
  ```
- **Tabla:** El mockup muestra las columnas en este orden: `CÓDIGO`, `PRODUCTO`, `CATEGORÍA/PROVEEDOR`, `PRECIO`, `STOCK`, `ESTADO`, `ACCIONES`. Modificaremos `Stock.tsx` para encajar.

## Edge Cases Mitigated

- **Compatibilidad Hacia Atrás:** Al no forzar `NOT NULL` en las claves foráneas, los productos que ya estaban en la base de datos no arrojarán errores y simplemente no tendrán un badge hasta que sean editados.
- **Optimización de consultas:** Usaremos el inner join nativo de PostgREST en InsForge: `select('*, categories(name), providers(name)')` para no incurrir en N+1 queries.

