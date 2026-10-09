-- Habilitar RLS explícitamente en TODAS las tablas, para que las políticas surtan efecto.
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registers ENABLE ROW LEVEL SECURITY;

-- Asegurar políticas de SELECT para el usuario anónimo (y público en general) donde corresponda
-- Si RLS se habilita y no hay política de SELECT, falla la lectura para anon.
DROP POLICY IF EXISTS "Public can read products" ON public.products;
CREATE POLICY "Public can read products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read categories" ON public.categories;
CREATE POLICY "Public can read categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read providers" ON public.providers;
CREATE POLICY "Public can read providers" ON public.providers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read store_info" ON public.store_info;
CREATE POLICY "Public can read store_info" ON public.store_info FOR SELECT USING (true);

-- CHECK constraints para stock y precio en `products`
ALTER TABLE public.products 
  ADD CONSTRAINT stock_non_negative CHECK (stock >= 0),
  ADD CONSTRAINT price_positive CHECK (price > 0);

-- Arreglar `decrement_stock` para que no falle en silencio si no encuentra la fila o no tiene permisos
CREATE OR REPLACE FUNCTION public.decrement_stock(product_id integer, qty integer)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  -- Intentamos actualizar. Si no se actualizó nada (ej. producto no existe o RLS lo bloqueó), lanzamos error.
  UPDATE public.products
  SET stock = stock - qty
  WHERE id = product_id AND stock >= qty;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No se pudo descontar el stock. Producto inexistente, falta de permisos o stock insuficiente.';
  END IF;
END;
$$;
