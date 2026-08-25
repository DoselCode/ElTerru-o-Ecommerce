import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types/product';
import { Plus, Edit, Trash2, Eye, EyeOff, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [products, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Modal & Pagination State
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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

  // Pagination logic
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const currentProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#70232B]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-serif font-bold text-[#3D2C23]">Productos</h1>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 bg-[#70232B] text-white px-4 py-2 rounded-xl hover:bg-[#8b2b35] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto</span>
        </Link>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
          {errorMsg}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-[#EBE6D8] overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F7F5EE] border-b border-[#EBE6D8] text-[#8C7A70]">
                <th className="p-4 font-medium text-sm">Producto</th>
                <th className="p-4 font-medium text-sm">Categoría</th>
                <th className="p-4 font-medium text-sm">Precio</th>
                <th className="p-4 font-medium text-sm">Stock</th>
                <th className="p-4 font-medium text-sm">Estado</th>
                <th className="p-4 font-medium text-sm text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE6D8]">
              {currentProducts.map((product) => (
                <tr key={product.id} className="hover:bg-[#F7F5EE]/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-[#EBE6D8]">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">Sin img</div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-[#3D2C23] flex items-center gap-2">
                          {product.name}
                          {product.isFeatured && (
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          )}
                        </div>
                        {product.winery && <div className="text-sm text-[#8C7A70]">{product.winery}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EBE6D8] text-[#70232B]">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-[#3D2C23]">
                    ${product.price.toLocaleString()}
                  </td>
                  <td className="p-4 text-[#8C7A70]">
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
                          className="p-2 text-[#8C7A70] hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Marcar como destacado"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <Link
                        to={`/admin/products/edit/${product.id}`}
                        className="p-2 text-[#8C7A70] hover:text-[#70232B] hover:bg-[#F7F5EE] rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setProductToDelete(product.id)}
                        className="p-2 text-[#8C7A70] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#8C7A70]">
                    No se encontraron productos. Agregá tu primer producto para empezar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-[#EBE6D8] bg-white">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[#70232B] hover:bg-[#F7F5EE] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <span className="text-sm text-[#8C7A70]">
              Página {currentPage} de {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[#70232B] hover:bg-[#F7F5EE] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-[#EBE6D8] animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-[#3D2C23] mb-2">Eliminar Producto</h3>
            <p className="text-[#8C7A70] mb-6 text-sm">
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
