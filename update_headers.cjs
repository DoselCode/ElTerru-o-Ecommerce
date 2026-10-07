const fs = require('fs');
let content = fs.readFileSync('src/admin/Stock.tsx', 'utf8');

const headersOld = /<tr>\s*<th>C\ufffd?ódigo<\/th>[\s\S]*?<th style=\{\{\s*textAlign:\s*'right'\s*\}\}>Acciones<\/th>\s*<\/tr>/i;
// Fallback regex to just match from <tr> to </tr> in the thead
const headersFallback = /<thead>\s*<tr>[\s\S]*?<\/tr>\s*<\/thead>/i;

const headersNew = `<thead>
              <tr>
                {renderSortableHeader('Código', 'code')}
                {renderSortableHeader('Producto', 'name')}
                {renderSortableHeader('Categoría', 'category')}
                {renderSortableHeader('Proveedor', 'provider')}
                {renderSortableHeader('Precio', 'price')}
                {renderSortableHeader('Stock', 'stock')}
                {renderSortableHeader('Estado', 'status')}
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>`;

content = content.replace(headersFallback, headersNew);
fs.writeFileSync('src/admin/Stock.tsx', content, 'utf8');
