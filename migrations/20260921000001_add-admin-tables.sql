CREATE TABLE IF NOT EXISTS mermas (
  id serial PRIMARY KEY,
  qty integer NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY,
  client text,
  total numeric,
  neto numeric,
  iva numeric,
  descuento numeric,
  paid_efectivo numeric,
  paid_transferencia numeric,
  paid_tarjeta numeric,
  payment_method text,
  date text,
  status text,
  items jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS registers (
  id text PRIMARY KEY DEFAULT 'global',
  status text,
  efectivo numeric,
  transferencia numeric,
  tarjeta numeric,
  updated_at timestamp with time zone DEFAULT now()
);

CREATE OR REPLACE FUNCTION decrement_stock(product_id int, qty int)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET stock = GREATEST(0, stock - qty)
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_total_mermas()
RETURNS bigint AS $$
BEGIN
  RETURN (SELECT COALESCE(SUM(qty), 0) FROM mermas);
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE mermas ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE registers ENABLE ROW LEVEL SECURITY;

-- Policies for admins
CREATE POLICY "Admins can manage mermas" ON mermas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage orders" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage registers" ON registers FOR ALL TO authenticated USING (true) WITH CHECK (true);
