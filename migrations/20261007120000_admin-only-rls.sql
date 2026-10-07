-- Restringe la escritura (y la lectura de ventas/caja) a los usuarios listados en public.admins.
-- Antes cualquier usuario autenticado tenía acceso total, y el registro público está habilitado.

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

-- Administradores (ids de Dashboard de InsForge > Authentication > Users)
INSERT INTO public.admins (user_id) VALUES
  ('3c1396f8-dd4f-44ec-a252-3a435aeef9b3'),
  ('dafc0e11-4535-43a9-ac0f-440928808c29'),
  ('f5bf3d52-b66a-4b67-9943-7e1272b1206c')
ON CONFLICT DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admins) THEN
    RAISE EXCEPTION 'public.admins está vacía: cargá el user_id del administrador antes de aplicar esta migración, o nadie podrá operar el panel.';
  END IF;
END $$;

-- store_info: lectura pública, escritura solo admins
DROP POLICY IF EXISTS "Admins can update store_info" ON public.store_info;
DROP POLICY IF EXISTS "Admins can insert store_info" ON public.store_info;
CREATE POLICY "Admins can update store_info" ON public.store_info
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can insert store_info" ON public.store_info
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

-- products: lectura pública, escritura solo admins (decrement_stock hereda esta política)
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- orders y registers: sin acceso público
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
CREATE POLICY "Admins can manage orders" ON public.orders
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage registers" ON public.registers;
CREATE POLICY "Admins can manage registers" ON public.registers
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- categories y providers: lectura pública, escritura solo admins
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.providers;
DROP POLICY IF EXISTS "Admins can manage providers" ON public.providers;
CREATE POLICY "Admins can manage providers" ON public.providers
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
