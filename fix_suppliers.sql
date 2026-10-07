INSERT INTO public.providers (name) VALUES ('JUCAMAR'), ('DANKON') ON CONFLICT DO NOTHING;
UPDATE public.products p
SET provider_id = (SELECT id FROM public.providers pr WHERE pr.name = p.supplier)
WHERE p.supplier IS NOT NULL AND p.supplier != '';
