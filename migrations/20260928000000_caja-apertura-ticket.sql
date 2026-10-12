-- Apertura/cierre de caja con saldo inicial y numeración de tickets

ALTER TABLE registers ADD COLUMN IF NOT EXISTS efectivo_inicial numeric DEFAULT 0;
ALTER TABLE registers ADD COLUMN IF NOT EXISTS opened_at timestamp with time zone;
ALTER TABLE registers ADD COLUMN IF NOT EXISTS numero integer DEFAULT 0;
-- Efectivo que se deja al cerrar; se propone como monto inicial en la próxima apertura
ALTER TABLE registers ADD COLUMN IF NOT EXISTS saldo_proxima numeric DEFAULT 0;
-- Ingresos/egresos manuales de la caja abierta: [{ id, type, amount, reason, createdAt }]
ALTER TABLE registers ADD COLUMN IF NOT EXISTS movimientos jsonb DEFAULT '[]'::jsonb;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS ticket_number integer;
