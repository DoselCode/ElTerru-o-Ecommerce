-- Alinea el esquema de producción (Supabase) con el de dev (InsForge) para el panel POS/admin.
-- Idempotente: agrega tablas/columnas y restringe la escritura a los usuarios de public.admins.
-- Lo único que borra es la tabla mermas (sin uso), y aborta si tiene datos.
--
-- ANTES DE APLICAR: revisá Authentication > Users; todos los usuarios existentes quedan como admin.
-- Si auth.users está vacía, la migración aborta (así nadie queda sin acceso).

-- 1. products: columnas del catálogo POS
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS code text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS supplier text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price_efectivo numeric;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price_transferencia numeric;

-- 2. Categorías y proveedores
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS provider_id uuid REFERENCES public.providers(id) ON DELETE SET NULL;

-- Categorías a partir del texto existente, y vínculo de cada producto (solo donde falta)
INSERT INTO public.categories (name)
SELECT DISTINCT category FROM public.products WHERE category IS NOT NULL AND category <> ''
ON CONFLICT (name) DO NOTHING;

UPDATE public.products p
SET category_id = c.id
FROM public.categories c
WHERE p.category_id IS NULL AND p.category = c.name;

-- 3. Ventas y caja
CREATE TABLE IF NOT EXISTS public.orders (
  id text PRIMARY KEY,
  client text,
  total numeric,
  neto numeric,
  iva numeric,
  descuento numeric,
  payment_method text,
  date text,
  status text,
  items jsonb,
  ticket_number integer,
  observacion text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.registers (
  id text PRIMARY KEY DEFAULT 'global',
  status text,
  efectivo_inicial numeric DEFAULT 0,
  opened_at timestamptz,
  numero integer DEFAULT 0,
  saldo_proxima numeric DEFAULT 0,
  movimientos jsonb DEFAULT '[]'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- En producción orders y registers ya existen con el esquema anterior: el CREATE TABLE
-- de arriba no hace nada, así que las columnas que usa el POS se agregan explícitamente.
-- Las columnas viejas (paid_*, efectivo, transferencia, tarjeta) se conservan, igual que en dev.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS neto numeric;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS iva numeric;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS descuento numeric;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paid_efectivo numeric;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paid_transferencia numeric;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paid_tarjeta numeric;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS ticket_number integer;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS observacion text;

ALTER TABLE public.registers ADD COLUMN IF NOT EXISTS efectivo numeric;
ALTER TABLE public.registers ADD COLUMN IF NOT EXISTS transferencia numeric;
ALTER TABLE public.registers ADD COLUMN IF NOT EXISTS tarjeta numeric;
ALTER TABLE public.registers ADD COLUMN IF NOT EXISTS efectivo_inicial numeric DEFAULT 0;
ALTER TABLE public.registers ADD COLUMN IF NOT EXISTS opened_at timestamptz;
ALTER TABLE public.registers ADD COLUMN IF NOT EXISTS numero integer DEFAULT 0;
ALTER TABLE public.registers ADD COLUMN IF NOT EXISTS saldo_proxima numeric DEFAULT 0;
ALTER TABLE public.registers ADD COLUMN IF NOT EXISTS movimientos jsonb DEFAULT '[]'::jsonb;

-- Mermas se eliminó del sistema (igual que en dev). Aborta si la tabla tiene datos.
DO $$
BEGIN
  IF to_regclass('public.mermas') IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.mermas) THEN
      RAISE EXCEPTION 'public.mermas tiene datos: respaldalos antes de eliminar la tabla.';
    END IF;
    DROP TABLE public.mermas;
  END IF;
END $$;
DROP FUNCTION IF EXISTS public.get_total_mermas();

-- 4. Validaciones de products: NOT VALID no revisa las filas existentes (solo las nuevas escrituras)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stock_non_negative' AND conrelid = 'public.products'::regclass) THEN
    ALTER TABLE public.products ADD CONSTRAINT stock_non_negative CHECK (stock >= 0) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'price_positive' AND conrelid = 'public.products'::regclass) THEN
    ALTER TABLE public.products ADD CONSTRAINT price_positive CHECK (price > 0) NOT VALID;
  END IF;
END $$;

-- 5. Descuento de stock atómico: falla si el producto no existe, no hay permisos o no alcanza el stock
CREATE OR REPLACE FUNCTION public.decrement_stock(product_id integer, qty integer)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  UPDATE public.products
  SET stock = stock - qty
  WHERE id = product_id AND stock >= qty;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No se pudo descontar el stock. Producto inexistente, falta de permisos o stock insuficiente.';
  END IF;
END;
$$;

-- 6. Administradores
CREATE TABLE IF NOT EXISTS public.admins (
  user_id uuid PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read own row" ON public.admins;
CREATE POLICY "Admins can read own row" ON public.admins
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- SECURITY DEFINER: lee public.admins sin depender de sus propias políticas
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid());
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Los usuarios que existen hoy en auth.users de producción son los administradores actuales
-- (hoy cualquier usuario autenticado ya puede escribir), así que se cargan todos.
-- Usuarios que se registren después NO quedan como admin: se suman a mano a public.admins.
INSERT INTO public.admins (user_id)
SELECT id FROM auth.users
ON CONFLICT DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admins) THEN
    RAISE EXCEPTION 'public.admins está vacía: no hay usuarios en auth.users. Creá el usuario administrador antes de aplicar esta migración, o nadie podrá operar el panel.';
  END IF;
END $$;

-- 7. RLS: lectura pública del catálogo, escritura solo admins; ventas y caja sin acceso público
ALTER TABLE public.store_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registers ENABLE ROW LEVEL SECURITY;

-- store_info
DROP POLICY IF EXISTS "Public can read store_info" ON public.store_info;
CREATE POLICY "Public can read store_info" ON public.store_info FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can update store_info" ON public.store_info;
CREATE POLICY "Admins can update store_info" ON public.store_info
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can insert store_info" ON public.store_info;
CREATE POLICY "Admins can insert store_info" ON public.store_info
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

-- products
DROP POLICY IF EXISTS "Public can read products" ON public.products;
CREATE POLICY "Public can read products" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- categories y providers
DROP POLICY IF EXISTS "Public can read categories" ON public.categories;
CREATE POLICY "Public can read categories" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can read providers" ON public.providers;
CREATE POLICY "Public can read providers" ON public.providers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage providers" ON public.providers;
CREATE POLICY "Admins can manage providers" ON public.providers
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- orders y registers
-- Políticas abiertas (USING true) que solo existen en producción: se combinan con OR,
-- así que si quedan, cualquier usuario autenticado mantiene acceso total.
DROP POLICY IF EXISTS "Allow authenticated full access to orders" ON public.orders;
DROP POLICY IF EXISTS "Admins manage orders" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated full access to registers" ON public.registers;
DROP POLICY IF EXISTS "Admins manage registers" ON public.registers;

DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
CREATE POLICY "Admins can manage orders" ON public.orders
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage registers" ON public.registers;
CREATE POLICY "Admins can manage registers" ON public.registers
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 8. Storage: bucket público; solo admins suben, modifican o borran imágenes.
-- Un bucket público sirve los archivos por URL sin política SELECT. Una SELECT amplia
-- sobre storage.objects permitiría listar todos los archivos, así que no se crea ninguna.
-- Si en el dashboard ya existen políticas propias sobre storage.objects (SELECT amplia o
-- escritura para cualquier usuario autenticado), eliminalas: las políticas se suman (OR).
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can read product images" ON storage.objects;

-- Políticas previas de producción que permiten escribir a cualquier usuario autenticado
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;

DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'product-images' AND public.is_admin());

NOTIFY pgrst, 'reload schema';
