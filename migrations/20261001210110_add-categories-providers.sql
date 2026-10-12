-- 1. Create providers table
CREATE TABLE public.providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.providers FOR SELECT USING (true);
CREATE POLICY "Enable all access for authenticated users" ON public.providers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Create categories table
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Enable all access for authenticated users" ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Add example providers and categories (plus existing ones)
INSERT INTO public.categories (name) VALUES ('Vinos'), ('Almacén'), ('Fiambres'), ('Regalos') ON CONFLICT DO NOTHING;

INSERT INTO public.categories (name)
SELECT DISTINCT category FROM public.products WHERE category IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO public.providers (name) VALUES ('Bodega López'), ('Distribuidora Central'), ('Proveedor General');

-- 4. Add columns to products
ALTER TABLE public.products
ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
ADD COLUMN provider_id UUID REFERENCES public.providers(id) ON DELETE SET NULL;

-- 5. Map existing category text to category_id
UPDATE public.products p
SET category_id = c.id
FROM public.categories c
WHERE p.category = c.name;

-- 6. Assign default provider to existing products
UPDATE public.products
SET provider_id = (SELECT id FROM public.providers WHERE name = 'Proveedor General' LIMIT 1);
