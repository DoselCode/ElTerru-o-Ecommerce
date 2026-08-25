-- Supabase Schema Contracts

CREATE TABLE store_info (
  id integer PRIMARY KEY DEFAULT 1,
  name text,
  tagline text,
  logo text,
  phone text,
  whatsapp_number text,
  email text,
  address text,
  hours_weekdays text,
  hours_saturday text,
  hours_sunday text,
  hero_badge text,
  hero_title text,
  hero_subtitle text,
  hero_bg_image text,
  about_title text,
  about_quote text,
  about_quote_author text,
  about_paragraph_1 text,
  about_paragraph_2 text,
  about_paragraph_3 text,
  about_main_image text,
  about_sub_image text,
  stat_years text,
  stat_producers text,
  stat_products text
);

CREATE TABLE products (
  id serial PRIMARY KEY,
  name text NOT NULL,
  year text,
  category text NOT NULL,
  price numeric NOT NULL,
  original_price numeric,
  discount_badge text,
  badge text,
  image text NOT NULL,
  description text NOT NULL,
  winery text,
  pairing text,
  stock integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_visible boolean DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE store_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policies for store_info
-- Everyone can read
CREATE POLICY "Public can read store_info"
  ON store_info FOR SELECT
  USING (true);

-- Only authenticated users (admins) can update
CREATE POLICY "Admins can update store_info"
  ON store_info FOR UPDATE
  TO authenticated
  USING (true);

-- Only authenticated users (admins) can insert
CREATE POLICY "Admins can insert store_info"
  ON store_info FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies for products
-- Everyone can read
CREATE POLICY "Public can read products"
  ON products FOR SELECT
  USING (true);

-- Only authenticated users can insert/update/delete
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Single featured product trigger
CREATE OR REPLACE FUNCTION ensure_single_featured_product()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_featured = true THEN
    UPDATE products SET is_featured = false WHERE id != NEW.id AND is_featured = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER single_featured_product_trigger
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION ensure_single_featured_product();
