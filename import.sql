-- 1. Insert missing providers
INSERT INTO public.providers (name) VALUES ('JUCAMAR') ON CONFLICT DO NOTHING;
INSERT INTO public.providers (name) VALUES ('DANKON') ON CONFLICT DO NOTHING;
INSERT INTO public.providers (name) VALUES ('VINOS') ON CONFLICT DO NOTHING;
INSERT INTO public.providers (name) VALUES ('FINCA LA AGUADA') ON CONFLICT DO NOTHING;
INSERT INTO public.providers (name) VALUES ('NUTRIDIET') ON CONFLICT DO NOTHING;
INSERT INTO public.providers (name) VALUES ('ALCARAZ') ON CONFLICT DO NOTHING;

-- 2. Import
UPDATE public.products 
          SET price = 8900, name = 'Pasta de Tomates Secos al Malbec', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0101';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0101', 'Pasta de Tomates Secos al Malbec', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 8900, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0101');
UPDATE public.products 
          SET price = 42800, name = 'Molinillo Automtico Mix Pimienta', provider_id = (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE code = '0060';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0060', 'Molinillo Automtico Mix Pimienta', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 42800, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0060');
UPDATE public.products 
          SET price = 10900, name = 'Salsa Pepper Sauce Original', provider_id = (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE code = '0029';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0029', 'Salsa Pepper Sauce Original', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 10900, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0029');
UPDATE public.products 
          SET price = 12000, name = 'Hojas de Parra', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0131';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0131', 'Hojas de Parra', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 12000, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0131');
UPDATE public.products 
          SET price = 7900, name = 'Jalea de Membrillo', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0133';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0133', 'Jalea de Membrillo', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 7900, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0133');
UPDATE public.products 
          SET price = 8400, name = 'sazon fajita', provider_id = (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE code = '0053';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0053', 'sazon fajita', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 8400, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0053');
UPDATE public.products 
          SET price = 8900, name = 'Pasta Aceitunas Negras con Roquefort', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0100';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0100', 'Pasta Aceitunas Negras con Roquefort', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 8900, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0100');
UPDATE public.products 
          SET price = 13600, name = 'Langostinos al Ajillo', provider_id = (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE code = '0023';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0023', 'Langostinos al Ajillo', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 13600, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0023');
UPDATE public.products 
          SET price = 4400, name = 'Limonada Orgnica c/Jengibre y Miel', provider_id = (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE code = '0080';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0080', 'Limonada Orgnica c/Jengibre y Miel', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 4400, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0080');
UPDATE public.products 
          SET price = 10800, name = 'Simonassi Roble Malbec', provider_id = (SELECT id FROM public.providers WHERE name = 'VINOS' LIMIT 1)
          WHERE code = '0189';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0189', 'Simonassi Roble Malbec', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 10800, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'VINOS' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0189');
UPDATE public.products 
          SET price = 8500, name = 'Aceitunas Verdes Rellenas c/Almendras', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0123';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0123', 'Aceitunas Verdes Rellenas c/Almendras', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 8500, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0123');
UPDATE public.products 
          SET price = 10800, name = 'Pistacho con Chocolate Leche', provider_id = (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE code = '0072';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0072', 'Pistacho con Chocolate Leche', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 10800, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0072');
UPDATE public.products 
          SET price = 8100, name = 'Jalea Picante Maracuy', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0096';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0096', 'Jalea Picante Maracuy', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 8100, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0096');
UPDATE public.products 
          SET price = 18000, name = 'Halawa Pistacho', provider_id = (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE code = '0084';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0084', 'Halawa Pistacho', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 18000, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0084');
UPDATE public.products 
          SET price = 9100, name = 'Aceitunas Negras Griegas Preparadas', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0122';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0122', 'Aceitunas Negras Griegas Preparadas', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 9100, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0122');
UPDATE public.products 
          SET price = 9200, name = 'Aceitunas confitadas c/almendras', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0085';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0085', 'Aceitunas confitadas c/almendras', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 9200, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0085');
UPDATE public.products 
          SET price = 12100, name = 'Trucha Ahumada al Natural', provider_id = (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE code = '0001';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0001', 'Trucha Ahumada al Natural', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 12100, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0001');
UPDATE public.products 
          SET price = 11700, name = 'Trufas 70% Chocolate', provider_id = (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE code = '0071';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0071', 'Trufas 70% Chocolate', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 11700, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0071');
UPDATE public.products 
          SET price = 3200, name = 'Azafrn Molido Puro', provider_id = (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE code = '0057';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0057', 'Azafrn Molido Puro', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 3200, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0057');
UPDATE public.products 
          SET price = 12900, name = 'Ciervo en Escabeche', provider_id = (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE code = '0006';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0006', 'Ciervo en Escabeche', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 12900, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0006');
UPDATE public.products 
          SET price = 11000, name = 'Dulce de Leche Artesanal', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0132';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0132', 'Dulce de Leche Artesanal', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 11000, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0132');
UPDATE public.products 
          SET price = 5700, name = 'Aderezo Caesar', provider_id = (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE code = '0025';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0025', 'Aderezo Caesar', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 5700, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0025');
UPDATE public.products 
          SET price = 10800, name = 'Arndano Chocolate Negro', provider_id = (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE code = '0073';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0073', 'Arndano Chocolate Negro', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 10800, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0073');
UPDATE public.products 
          SET price = 8400, name = 'Risotto Porcini', provider_id = (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE code = '0044';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0044', 'Risotto Porcini', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 8400, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0044');
UPDATE public.products 
          SET price = 14700, name = 'Mix Frutos Secos al Vaco', provider_id = (SELECT id FROM public.providers WHERE name = 'FINCA LA AGUADA' LIMIT 1)
          WHERE code = '0164';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0164', 'Mix Frutos Secos al Vaco', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 14700, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'FINCA LA AGUADA' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0164');
UPDATE public.products 
          SET price = 5000, name = 'Arndanos Secos 250 g', provider_id = (SELECT id FROM public.providers WHERE name = 'NUTRIDIET' LIMIT 1)
          WHERE code = '0171';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0171', 'Arndanos Secos 250 g', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 5000, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'NUTRIDIET' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0171');
UPDATE public.products 
          SET price = 8900, name = 'Aceitunas Verdes Rellenas c/Salame', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0126';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0126', 'Aceitunas Verdes Rellenas c/Salame', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 8900, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0126');
UPDATE public.products 
          SET price = 8900, name = 'Quesitos Saborizados', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0106';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0106', 'Quesitos Saborizados', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 8900, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0106');
UPDATE public.products 
          SET price = 2400, name = 'Garbanzos Fritos Original', provider_id = (SELECT id FROM public.providers WHERE name = 'NUTRIDIET' LIMIT 1)
          WHERE code = '0175';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0175', 'Garbanzos Fritos Original', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 2400, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'NUTRIDIET' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0175');
UPDATE public.products 
          SET price = 21300, name = 'Aceite de pepitas de uva', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0121';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0121', 'Aceite de pepitas de uva', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 21300, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0121');
UPDATE public.products 
          SET price = 8100, name = 'Berenjenas Asadas al Tomillo en Oliva', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0089';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0089', 'Berenjenas Asadas al Tomillo en Oliva', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 8100, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0089');
UPDATE public.products 
          SET price = 8500, name = 'Tomates Secos al Malbec en Aceite', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0107';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0107', 'Tomates Secos al Malbec en Aceite', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 8500, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0107');
UPDATE public.products 
          SET price = 11200, name = 'Grgolas en Aceite de Oliva', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0094';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0094', 'Grgolas en Aceite de Oliva', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 11200, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0094');
UPDATE public.products 
          SET price = 9300, name = 'Crema de Ajo Negro', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0088';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0088', 'Crema de Ajo Negro', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 9300, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0088');
UPDATE public.products 
          SET price = 8900, name = 'Tapenade (Pasta Ac. Negras c/Anchoas)', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0105';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0105', 'Tapenade (Pasta Ac. Negras c/Anchoas)', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 8900, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0105');
UPDATE public.products 
          SET price = 8600, name = 'Mostaza Dijon GP', provider_id = (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE code = '0013';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0013', 'Mostaza Dijon GP', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 8600, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0013');
UPDATE public.products 
          SET price = 7100, name = 'Dos Makilas Malbec', provider_id = (SELECT id FROM public.providers WHERE name = 'VINOS' LIMIT 1)
          WHERE code = '0177';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0177', 'Dos Makilas Malbec', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 7100, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'VINOS' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0177');
UPDATE public.products 
          SET price = 7600, name = 'Dulce de Membrillo 12u?40g', provider_id = (SELECT id FROM public.providers WHERE name = 'FINCA LA AGUADA' LIMIT 1)
          WHERE code = '0166';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0166', 'Dulce de Membrillo 12u?40g', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 7600, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'FINCA LA AGUADA' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0166');
UPDATE public.products 
          SET price = 9300, name = 'Aros de Jalapeo', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0087';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0087', 'Aros de Jalapeo', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 9300, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0087');
UPDATE public.products 
          SET price = 11200, name = 'Grgolas en Escabeche', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0093';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0093', 'Grgolas en Escabeche', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 11200, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0093');
UPDATE public.products 
          SET price = 10000, name = 'Salsa Jalapea', provider_id = (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE code = '0031';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0031', 'Salsa Jalapea', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 10000, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0031');
UPDATE public.products 
          SET price = 8500, name = 'Pasta Ac. Verdes con Pistacho', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0108';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0108', 'Pasta Ac. Verdes con Pistacho', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 8500, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0108');
UPDATE public.products 
          SET price = 8500, name = 'Hummus', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0110';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0110', 'Hummus', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 8500, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0110');
UPDATE public.products 
          SET price = 8500, name = 'Mermelada Diet Frutilla (apta diabticos)', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0135';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0135', 'Mermelada Diet Frutilla (apta diabticos)', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 8500, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0135');
UPDATE public.products 
          SET price = 8100, name = 'Pasta Picante de Morrones', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0098';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0098', 'Pasta Picante de Morrones', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 8100, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0098');
UPDATE public.products 
          SET price = 11300, name = 'Manjar Mendocino', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0153';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0153', 'Manjar Mendocino', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 11300, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0153');
UPDATE public.products 
          SET price = 8500, name = 'Aceitunas Verdes Rellenas c/Tomate', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0128';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0128', 'Aceitunas Verdes Rellenas c/Tomate', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 8500, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0128');
UPDATE public.products 
          SET price = 10700, name = 'Argana Pinot Noir', provider_id = (SELECT id FROM public.providers WHERE name = 'VINOS' LIMIT 1)
          WHERE code = '0184';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0184', 'Argana Pinot Noir', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 10700, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'VINOS' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0184');
UPDATE public.products 
          SET price = 15100, name = 'Argana Cabernet Franc', provider_id = (SELECT id FROM public.providers WHERE name = 'VINOS' LIMIT 1)
          WHERE code = '0185';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0185', 'Argana Cabernet Franc', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 15100, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'VINOS' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0185');
UPDATE public.products 
          SET price = 11300, name = 'RUMTOPF (cerezas al ron 1 ao)', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0156';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0156', 'RUMTOPF (cerezas al ron 1 ao)', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 11300, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0156');
UPDATE public.products 
          SET price = 12200, name = 'Makila Reserva Blend', provider_id = (SELECT id FROM public.providers WHERE name = 'VINOS' LIMIT 1)
          WHERE code = '0182';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0182', 'Makila Reserva Blend', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 12200, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'VINOS' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0182');
UPDATE public.products 
          SET price = 12800, name = 'Makila Reserva Malbec', provider_id = (SELECT id FROM public.providers WHERE name = 'VINOS' LIMIT 1)
          WHERE code = '0181';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0181', 'Makila Reserva Malbec', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 12800, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'VINOS' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0181');
UPDATE public.products 
          SET price = 13500, name = 'Lima Pepper', provider_id = (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE code = '0049';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0049', 'Lima Pepper', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 13500, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0049');
UPDATE public.products 
          SET price = 10700, name = 'Pimienta Roja Cayenna', provider_id = (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE code = '0050';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0050', 'Pimienta Roja Cayenna', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 10700, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0050');
UPDATE public.products 
          SET price = 13500, name = 'Lemon Pepper', provider_id = (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE code = '0048';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0048', 'Lemon Pepper', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 13500, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0048');
UPDATE public.products 
          SET price = 7900, name = 'Eneldo', provider_id = (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE code = '0054';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0054', 'Eneldo', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 7900, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0054');
UPDATE public.products 
          SET price = 8100, name = 'Sal Marina de Malbec', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0115';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0115', 'Sal Marina de Malbec', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 8100, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0115');
UPDATE public.products 
          SET price = 8600, name = 'Caviar de Mostaza', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0111';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0111', 'Caviar de Mostaza', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 8600, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0111');
UPDATE public.products 
          SET price = 10500, name = 'Abismal Malbec', provider_id = (SELECT id FROM public.providers WHERE name = 'VINOS' LIMIT 1)
          WHERE code = '0198';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0198', 'Abismal Malbec', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 10500, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'VINOS' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0198');
UPDATE public.products 
          SET price = 6600, name = 'Castaas de Caj w4 250g', provider_id = (SELECT id FROM public.providers WHERE name = 'NUTRIDIET' LIMIT 1)
          WHERE code = '0169';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0169', 'Castaas de Caj w4 250g', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 6600, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'NUTRIDIET' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0169');
UPDATE public.products 
          SET price = 6600, name = 'Mermelada de Damasco al Sol', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0137';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0137', 'Mermelada de Damasco al Sol', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 6600, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0137');
UPDATE public.products 
          SET price = 8600, name = 'Sal Marina de Mandarina', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0114';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0114', 'Sal Marina de Mandarina', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 8600, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0114');
UPDATE public.products 
          SET price = 18200, name = 'AOVE Extra Virgen Vidrio 500ml', provider_id = (SELECT id FROM public.providers WHERE name = 'FINCA LA AGUADA' LIMIT 1)
          WHERE code = '0157';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0157', 'AOVE Extra Virgen Vidrio 500ml', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 18200, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'FINCA LA AGUADA' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0157');
UPDATE public.products 
          SET price = 4800, name = 'Aceite de Coco Neutro 200g', provider_id = (SELECT id FROM public.providers WHERE name = 'NUTRIDIET' LIMIT 1)
          WHERE code = '0172';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0172', 'Aceite de Coco Neutro 200g', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 4800, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'NUTRIDIET' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0172');
UPDATE public.products 
          SET price = 8500, name = 'Mermelada Diet Damasco (apta diabticos)', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0136';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0136', 'Mermelada Diet Damasco (apta diabticos)', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 8500, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0136');
UPDATE public.products 
          SET price = 9200, name = 'Mermelada de Frambuesa al Sol', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0139';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0139', 'Mermelada de Frambuesa al Sol', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 9200, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0139');
UPDATE public.products 
          SET price = 52200, name = 'AOVE Extra Virgen PET 2L', provider_id = (SELECT id FROM public.providers WHERE name = 'FINCA LA AGUADA' LIMIT 1)
          WHERE code = '0159';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0159', 'AOVE Extra Virgen PET 2L', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 52200, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'FINCA LA AGUADA' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0159');
UPDATE public.products 
          SET price = 15800, name = 'Pistacho Pelado Natural 200g', provider_id = (SELECT id FROM public.providers WHERE name = 'NUTRIDIET' LIMIT 1)
          WHERE code = '0168';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0168', 'Pistacho Pelado Natural 200g', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 15800, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'NUTRIDIET' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0168');
UPDATE public.products 
          SET price = 6200, name = 'Dtiles de Argelia s/carozo 250g', provider_id = (SELECT id FROM public.providers WHERE name = 'NUTRIDIET' LIMIT 1)
          WHERE code = '0170';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0170', 'Dtiles de Argelia s/carozo 250g', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 6200, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'NUTRIDIET' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0170');
UPDATE public.products 
          SET price = 8100, name = 'Salsa Cesar Alcaraz', provider_id = (SELECT id FROM public.providers WHERE name = 'ALCARAZ' LIMIT 1)
          WHERE code = '0218';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0218', 'Salsa Cesar Alcaraz', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 8100, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'ALCARAZ' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0218');
UPDATE public.products 
          SET price = 7650, name = 'Mostaza Dijon Alcaraz', provider_id = (SELECT id FROM public.providers WHERE name = 'ALCARAZ' LIMIT 1)
          WHERE code = '0209';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0209', 'Mostaza Dijon Alcaraz', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 7650, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'ALCARAZ' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0209');
UPDATE public.products 
          SET price = 16000, name = 'Nueces Mix Blancas al Vaco', provider_id = (SELECT id FROM public.providers WHERE name = 'FINCA LA AGUADA' LIMIT 1)
          WHERE code = '0162';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0162', 'Nueces Mix Blancas al Vaco', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 16000, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'FINCA LA AGUADA' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0162');
UPDATE public.products 
          SET price = 6500, name = 'Alcaparras en Vinagre', provider_id = (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE code = '0021';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0021', 'Alcaparras en Vinagre', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 6500, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0021');
UPDATE public.products 
          SET price = 10800, name = 'Passata Di Pomodoro', provider_id = (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE code = '0036';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0036', 'Passata Di Pomodoro', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 10800, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'DANKON' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0036');
UPDATE public.products 
          SET price = 8100, name = 'Mermelada Inglesa (naranja/limn)', provider_id = (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE code = '0143';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0143', 'Mermelada Inglesa (naranja/limn)', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 8100, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'JUCAMAR' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0143');
UPDATE public.products 
          SET price = 6700, name = 'Mostaza en granos con miel', provider_id = (SELECT id FROM public.providers WHERE name = 'ALCARAZ' LIMIT 1)
          WHERE code = '0210';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0210', 'Mostaza en granos con miel', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 6700, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'ALCARAZ' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0210');
UPDATE public.products 
          SET price = 7000, name = 'Berenjenas en escabeche', provider_id = (SELECT id FROM public.providers WHERE name = 'ALCARAZ' LIMIT 1)
          WHERE code = '0201';
INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '0201', 'Berenjenas en escabeche', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), 7000, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = 'ALCARAZ' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '0201');
