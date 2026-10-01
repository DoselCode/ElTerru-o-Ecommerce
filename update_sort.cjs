const fs = require('fs');
let content = fs.readFileSync('src/admin/Stock.tsx', 'utf8');

// Add ChevronUp, ChevronDown to lucide-react imports if not there
if (!content.includes('ChevronUp') && content.includes('lucide-react')) {
  content = content.replace("import { Eye, EyeSlash", "import { ChevronUp, ChevronDown, Eye, EyeSlash");
}

// Add state
const stateReplacement = `const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  type SortKey = 'code' | 'name' | 'category' | 'provider' | 'price' | 'stock' | 'status';
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };`;

content = content.replace("const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);", stateReplacement);

// Add sorting logic
const filterEndStr = `return !query || p.name.toLowerCase().includes(query) || p.code.includes(query) || (p.providers?.name || '').toLowerCase().includes(query);
  });`;
  
const sortingLogic = `return !query || p.name.toLowerCase().includes(query) || p.code.includes(query) || (p.providers?.name || '').toLowerCase().includes(query);
  });

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    if (sortConfig) {
      sorted.sort((a, b) => {
        let aVal: any = a[sortConfig.key as keyof typeof a];
        let bVal: any = b[sortConfig.key as keyof typeof b];

        if (sortConfig.key === 'category') {
          aVal = a.categories?.name || '';
          bVal = b.categories?.name || '';
        } else if (sortConfig.key === 'provider') {
          aVal = a.providers?.name || '';
          bVal = b.providers?.name || '';
        } else if (sortConfig.key === 'status') {
          aVal = a.isVisible ? 1 : 0;
          bVal = b.isVisible ? 1 : 0;
        } else if (sortConfig.key === 'price') {
          aVal = a.price || 0;
          bVal = b.price || 0;
        } else if (sortConfig.key === 'stock') {
          aVal = a.stock || 0;
          bVal = b.stock || 0;
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredProducts, sortConfig]);`;

content = content.replace(filterEndStr, sortingLogic);

// Map sortedProducts instead of filteredProducts
content = content.replace("<tbody>\n              {filteredProducts.map(p => (", "<tbody>\n              {sortedProducts.map(p => (");
// in case it uses \r\n
content = content.replace("<tbody>\r\n              {filteredProducts.map(p => (", "<tbody>\n              {sortedProducts.map(p => (");

// Helper for sorting headers
const sortHeaderHelper = `
  const renderSortableHeader = (label: string, key: SortKey) => {
    const isActive = sortConfig?.key === key;
    return (
      <th 
        onClick={() => handleSort(key)} 
        style={{ cursor: 'pointer', userSelect: 'none' }}
        className="group hover:bg-terruno-brown/5 transition-colors"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {label}
          <span style={{ 
            display: 'inline-flex', 
            flexDirection: 'column', 
            opacity: isActive ? 1 : 0.2,
            transition: 'opacity 0.2s'
          }} className="group-hover:opacity-100">
            {(!isActive || sortConfig.direction === 'asc') && <ChevronUp size={12} style={{ marginBottom: '-4px', opacity: isActive && sortConfig.direction === 'asc' ? 1 : 0.5 }} />}
            {(!isActive || sortConfig.direction === 'desc') && <ChevronDown size={12} style={{ opacity: isActive && sortConfig.direction === 'desc' ? 1 : 0.5 }} />}
          </span>
        </div>
      </th>
    );
  };
`;

content = content.replace("const executeDeleteProduct", sortHeaderHelper + "\n  const executeDeleteProduct");

// Replace the th elements
const headersOld = `              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Proveedor</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>`;

const headersNew = `              <tr>
                {renderSortableHeader('Código', 'code')}
                {renderSortableHeader('Producto', 'name')}
                {renderSortableHeader('Categoría', 'category')}
                {renderSortableHeader('Proveedor', 'provider')}
                {renderSortableHeader('Precio', 'price')}
                {renderSortableHeader('Stock', 'stock')}
                {renderSortableHeader('Estado', 'status')}
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>`;

content = content.replace(/              <tr>\s*<th>C.digo<\/th>[\s\S]*?<th style=\{\{ textAlign: 'right' \}\}>Acciones<\/th>\s*<\/tr>/, headersNew);

fs.writeFileSync('src/admin/Stock.tsx', content, 'utf8');
