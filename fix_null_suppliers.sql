UPDATE public.products p
SET provider_id = NULL
WHERE p.supplier IS NULL OR p.supplier = '';
