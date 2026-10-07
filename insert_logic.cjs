const fs = require('fs');
let content = fs.readFileSync('src/admin/Stock.tsx', 'utf8');

const anchor = "const handleToggleFeatured = async (product: Product) => {";

const sortingLogic = `
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    if (sortConfig) {
      sorted.sort((a, b) => {
        let aVal = a[sortConfig.key as keyof typeof a];
        let bVal = b[sortConfig.key as keyof typeof b];

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
  }, [filteredProducts, sortConfig]);

`;

content = content.replace(anchor, sortingLogic + anchor);
fs.writeFileSync('src/admin/Stock.tsx', content, 'utf8');
