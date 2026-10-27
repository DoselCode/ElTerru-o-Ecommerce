-- Descuentos por método de pago editables desde el admin (en porcentaje, 10 = 10%).
-- Son el respaldo para los productos sin precio propio por método; los defaults mantienen el 10% previo.
ALTER TABLE public.store_info ADD COLUMN IF NOT EXISTS discount_efectivo numeric NOT NULL DEFAULT 10;
ALTER TABLE public.store_info ADD COLUMN IF NOT EXISTS discount_transferencia numeric NOT NULL DEFAULT 10;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'discount_efectivo_range' AND conrelid = 'public.store_info'::regclass) THEN
    ALTER TABLE public.store_info ADD CONSTRAINT discount_efectivo_range CHECK (discount_efectivo >= 0 AND discount_efectivo <= 100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'discount_transferencia_range' AND conrelid = 'public.store_info'::regclass) THEN
    ALTER TABLE public.store_info ADD CONSTRAINT discount_transferencia_range CHECK (discount_transferencia >= 0 AND discount_transferencia <= 100);
  END IF;
END $$;

-- Reescribe el precio por método de todos los productos con el porcentaje guardado en store_info:
-- precio de lista × (1 − %), redondeado a $100 (o al peso si quedaría en $0) y nunca mayor al de lista.
-- SECURITY INVOKER: el UPDATE respeta la RLS de products; el chequeo explícito evita que un no-admin
-- reciba un "0 filas" silencioso.
CREATE OR REPLACE FUNCTION public.recalculate_method_prices(method text)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  rate numeric;
  updated integer;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo un administrador puede recalcular precios';
  END IF;

  IF method = 'efectivo' THEN
    SELECT discount_efectivo INTO rate FROM public.store_info WHERE id = 1;
  ELSIF method = 'transferencia' THEN
    SELECT discount_transferencia INTO rate FROM public.store_info WHERE id = 1;
  ELSE
    RAISE EXCEPTION 'Método de pago inválido: %', method;
  END IF;

  rate := COALESCE(rate, 10);

  WITH calc AS (
    SELECT id, price, price * (1 - rate / 100) AS raw FROM public.products
  ), rounded AS (
    SELECT id, LEAST(price, CASE WHEN round(raw / 100) * 100 > 0 THEN round(raw / 100) * 100 ELSE round(raw) END) AS value
    FROM calc
  )
  UPDATE public.products p
  SET price_efectivo = CASE WHEN method = 'efectivo' THEN r.value ELSE p.price_efectivo END,
      price_transferencia = CASE WHEN method = 'transferencia' THEN r.value ELSE p.price_transferencia END
  FROM rounded r
  WHERE p.id = r.id;

  GET DIAGNOSTICS updated = ROW_COUNT;
  RETURN updated;
END;
$$;

REVOKE ALL ON FUNCTION public.recalculate_method_prices(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.recalculate_method_prices(text) TO authenticated;
