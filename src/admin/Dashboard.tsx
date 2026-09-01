import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types/product';
import { Plus, Edit, Trash2, Eye, EyeOff, Star, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Pagination } from '../components/ui/Pagination';

export const Dashboard: React.FC = () => {
  const [products, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Search, Modal & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Reset pagination on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchProductos = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;

      const mappedData: Product[] = (data || []).map((item) => ({
        id: item.id,
        name: item.name,
        year: item.year,
        category: item.category,
        price: Number(item.price),
        originalPrice: item.original_price ? Number(item.original_price) : undefined,
        discountBadge: item.discount_badge,
        badge: item.badge,
        image: item.image,
        description: item.description,
        winery: item.winery,
        pairing: item.pairing,
        stock: item.stock,
        isFeatured: item.is_featured,
        isVisible: item.is_visible,
      }));
      setProductos(mappedData);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setErrorMsg(err.message || 'Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const toggleVisibility = async (id: number, currentVisibility: boolean) => {
    try {
      const { error } = await supabase.from('products').update({ is_visible: !currentVisibility }).eq('id', id);
      if (error) throw error;
      fetchProductos();
    } catch (err) {
      console.error('Error updating visibility:', err);
    }
  };
  
  const setFeatured = async (id: number) => {
    try {
      const { error } = await supabase.from('products').update({ is_featured: true }).eq('id', id);
      if (error) throw error;
      fetchProductos();
    } catch (err) {
      console.error('Error setting featured product:', err);
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', productToDelete);
      if (error) throw error;
      setProductToDelete(null);
      fetchProductos();
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  // Filter & Pagination logic
  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return products;
    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(query) ||
        (product.winery && product.winery.toLowerCase().includes(query)) ||
        product.category.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query))
      );
    });
  }, [products, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terruno-burgundy"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-serif font-bold text-terruno-brown">Productos</h1>
          <span className="text-xs bg-terruno-border text-terruno-burgundy font-semibold px-2.5 py-0.5 rounded-full">
            {products.length}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Bar */}
          <div className="relative min-w-[240px] sm:min-w-[280px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-terruno-muted w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, bodega, categoría..."
              maxLength={100}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-terruno-border text-sm text-terruno-brown placeholder-terruno-muted focus:outline-none focus:ring-2 focus:ring-terruno-burgundy/20 focus:border-terruno-burgundy transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-terruno-muted hover:text-terruno-brown p-1"
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <Link
            to="/admin/products/new"
            className="flex items-center justify-center gap-2 bg-terruno-burgundy text-white px-4 py-2 rounded-xl hover:bg-terruno-burgundy-light transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
          {errorMsg}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-terruno-border overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-terruno-bg border-b border-terruno-border text-terruno-muted">
                <th className="p-4 font-medium text-sm">Producto</th>
                <th className="p-4 font-medium text-sm">Categoría</th>
                <th className="p-4 font-medium text-sm">Precio</th>
                <th className="p-4 font-medium text-sm">Stock</th>
                <th className="p-4 font-medium text-sm">Estado</th>
                <th className="p-4 font-medium text-sm text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-terruno-border">
              {currentProducts.map((product) => (
                <tr key={product.id} className="hover:bg-terruno-bg/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-terruno-border">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">Sin img</div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-terruno-brown flex items-center gap-2">
                          {product.name}
                          {product.isFeatured && (
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          )}
                        </div>
                        {product.winery && <div className="text-sm text-terruno-muted">{product.winery}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-terruno-border text-terruno-burgundy">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-terruno-brown">
                    ${product.price.toLocaleString()}
                  </td>
                  <td className="p-4 text-terruno-muted">
                    {product.stock ?? 0}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleVisibility(product.id, product.isVisible)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        product.isVisible
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {product.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {product.isVisible ? 'Visible' : 'Oculto'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!product.isFeatured && (
                        <button
                          onClick={() => setFeatured(product.id)}
                          className="p-2 text-terruno-muted hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Marcar como destacado"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <Link
                        to={`/admin/products/edit/${product.id}`}
                        className="p-2 text-terruno-muted hover:text-terruno-burgundy hover:bg-terruno-bg rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setProductToDelete(product.id)}
                        className="p-2 text-terruno-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-terruno-muted">
                    {searchQuery ? (
                      <div className="space-y-2">
                        <p>No se encontraron productos que coincidan con &ldquo;{searchQuery}&rdquo;.</p>
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="text-xs text-terruno-burgundy font-medium hover:underline cursor-pointer"
                        >
                          Limpiar búsqueda
                        </button>
                      </div>
                    ) : (
                      <p>No se encontraron productos. Agregá tu primer producto para empezar.</p>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="p-4 border-t border-terruno-border bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs sm:text-sm text-terruno-muted">
            Mostrando {filteredProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} de {filteredProducts.length} productos {searchQuery && `(filtrados de ${products.length})`}
          </span>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            variant="footer"
            hideOnSinglePage={false}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-terruno-border animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-terruno-brown mb-2">Eliminar Producto</h3>
            <p className="text-terruno-muted mb-6 text-sm">
              ¿Estás seguro que querés eliminar este producto? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setProductToDelete(null)} 
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete} 
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 font-medium shadow-sm transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
