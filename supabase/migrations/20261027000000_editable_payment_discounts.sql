-- Descuentos por método de pago editables desde el admin (en porcentaje, 10 = 10%).
-- Son el respaldo para los productos sin precio propio por método; los defaults mantienen el 10% previo.
-- El precio por método de cada producto se recalcula desde su formulario (no hay recálculo masivo).
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
