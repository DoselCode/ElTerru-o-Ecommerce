const fs = require('fs');
let content = fs.readFileSync('src/admin/Stock.tsx', 'utf8');

const toggleFeaturedStr = `const handleToggleFeatured = async (product: Product) => {`;
const toggleVisibilityStr = `const handleToggleVisibility = async (product: Product) => {
    try {
      await updateProduct(product.id, { isVisible: !product.isVisible });
    } catch (err) {
      console.error(err);
      showToast('Error al actualizar visibilidad', 'error');
    }
  };

  `;

content = content.replace(toggleFeaturedStr, toggleVisibilityStr + toggleFeaturedStr);

const spanStr = `<span className={\`badge \${p.isVisible ? 'success' : 'danger'} badge-icon\`}>`;
const spanNewStr = `<span 
                      className={\`badge \${p.isVisible ? 'success' : 'danger'} badge-icon\`} 
                      style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                      onClick={() => handleToggleVisibility(p)}
                      title={p.isVisible ? "Ocultar producto" : "Hacer visible"}
                    >`;

content = content.replace(spanStr, spanNewStr);

fs.writeFileSync('src/admin/Stock.tsx', content, 'utf8');
