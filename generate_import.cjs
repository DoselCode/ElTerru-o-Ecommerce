const fs = require('fs');
const products = JSON.parse(fs.readFileSync('parsed_products.json', 'utf8'));

let sql = '';
let addProviders = new Set();

for (const p of products) {
  addProviders.add(p.provider);
}

sql += '-- 1. Insert missing providers\n';
for (const prov of addProviders) {
  sql += `INSERT INTO public.providers (name) VALUES ('${prov}') ON CONFLICT DO NOTHING;\n`;
}

sql += '\n-- 2. Import\n';
for (const p of products) {
  const safeName = p.name.replace(/'/g, "''");
  const safeProv = p.provider.replace(/'/g, "''");
  
  sql += `UPDATE public.products 
          SET price = ${p.price}, name = '${safeName}', provider_id = (SELECT id FROM public.providers WHERE name = '${safeProv}' LIMIT 1)
          WHERE code = '${p.code}';\n`;
          
  sql += `INSERT INTO public.products (code, name, category, category_id, price, image, description, provider_id)
          SELECT '${p.code}', '${safeName}', 'Almacén', (SELECT id FROM public.categories WHERE name = 'Almacén' LIMIT 1), ${p.price}, '', 'Producto importado', (SELECT id FROM public.providers WHERE name = '${safeProv}' LIMIT 1)
          WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE code = '${p.code}');\n`;
}

fs.writeFileSync('migrations/20261001212644_import-data.sql', sql, 'utf8');
