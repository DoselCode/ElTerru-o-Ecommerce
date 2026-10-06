import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSimple, Trash, Star, Eye, EyeSlash } from '@phosphor-icons/react';
import { useAdmin } from './AdminContext';
import { formatMoney } from './posUtils';
import type { Product } from '../types/product';
import { Paginator, usePaginator } from './Paginator';

const PAGE_SIZE = 15;

const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%2240%22 height%3D%2240%22 viewBox%3D%220 0 40 40%22%3E%3Crect width%3D%2240%22 height%3D%2240%22 fill%3D%22%23e8e3d9%22%2F%3E%3Ctext x%3D%2250%25%22 y%3D%2255%25%22 text-anchor%3D%22middle%22 fill%3D%22%23a09070%22 font-size%3D%2218%22%3E%3F%3C%2Ftext%3E%3C%2Fsvg%3E';

export const Stock: React.FC = () => {
  const navigate = useNavigate();
  const { state, updateProduct, deleteProduct, showToast } = useAdmin();
  const [search, setSearch] = useState('');
  const [supplier, setSupplier] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const suppliers = useMemo(
    () => [...new Set(state.products.map(p => p.supplier).filter(Boolean))].sort() as string[],
    [state.products]
  );

  const query = search.trim().toLowerCase();
  const filteredProducts = state.products.filter(p => {
    if (supplier && p.supplier !== supplier) return false;
    return !query || p.name.toLowerCase().includes(query) || p.code.includes(query);
  });

  const { page, totalPages, setPage, slice: pageProducts } = usePaginator(filteredProducts, PAGE_SIZE);

  const handleToggleFeatured = async (product: Product) => {
    if (!product.isFeatured) {
      const currentlyFeatured = state.products.filter(p => p.isFeatured && p.id !== product.id);
      for (const p of currentlyFeatured) {
        await updateProduct(p.id, { isFeatured: false });
      }
    }
    await updateProduct(product.id, { isFeatured: !product.isFeatured });
  };

  const executeDeleteProduct = async () => {
    if (!deleteConfirmId) return;
    await deleteProduct(deleteConfirmId);
    showToast('Producto eliminado', 'success');
    setDeleteConfirmId(null);
  };

  return (
    <section className="view-section active flex-col">
      <div className="section-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <h2 className="section-title">Control de Stock</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="filter-input"
            placeholder="Buscar código o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="filter-input" style={{ minWidth: '190px' }} value={supplier} onChange={(e) => setSupplier(e.target.value)} aria-label="Filtrar por proveedor">
            <option value="">Todos los proveedores</option>
            {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn-accent" style={{ padding: '0.65rem 1.5rem' }} onClick={() => navigate('/admin/products/new')}>
            + Nuevo Producto
          </button>
        </div>
      </div>

      <div className="card p-0" style={{ flex: 1, overflowY: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Proveedor</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pageProducts.map(p => (
              <tr key={p.id}>
                <td style={{ fontFamily: 'monospace' }}>{p.code}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src={p.image || PLACEHOLDER_IMAGE} alt={p.name} className="stock-thumb" />
                    <strong>{p.name}</strong>
                  </div>
                </td>
                <td><span className="badge warning">{p.supplier || '—'}</span></td>
                <td>{p.category || '—'}</td>
                <td><strong>{formatMoney(p.price)}</strong></td>
                <td style={{ color: p.stock <= 5 ? 'var(--danger)' : 'inherit' }}>{p.stock}</td>
                <td>
                  <span className={`badge ${p.isVisible ? 'success' : 'danger'} badge-icon`}>
                    {p.isVisible ? <Eye weight="bold" /> : <EyeSlash weight="bold" />}
                    {p.isVisible ? 'Visible' : 'Oculto'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button className="btn-icon" title={p.isFeatured ? 'Quitar Best Seller' : 'Marcar Best Seller'} aria-label={p.isFeatured ? 'Quitar Best Seller' : 'Marcar Best Seller'} onClick={() => handleToggleFeatured(p)} style={{ color: p.isFeatured ? 'var(--accent-color)' : 'var(--text-muted)' }}>
                      <Star weight={p.isFeatured ? 'fill' : 'regular'} />
                    </button>
                    <button className="btn-icon" aria-label={`Editar producto ${p.name}`} onClick={() => navigate(`/admin/products/edit/${p.id}`)}><PencilSimple /></button>
                    <button className="btn-icon" aria-label={`Eliminar producto ${p.name}`} style={{ color: 'var(--danger)' }} onClick={() => setDeleteConfirmId(p.id)}><Trash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Paginator page={page} totalPages={totalPages} onPageChange={setPage} />

      {deleteConfirmId && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ maxWidth: '400px' }}>
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>Confirmar Acción</h2>
            <p style={{ fontSize: '1.1rem', textAlign: 'center', padding: '1rem 0' }}>¿Seguro que querés eliminar este producto?</p>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setDeleteConfirmId(null)}>Cancelar</button>
              <button className="btn-accent btn-danger" onClick={executeDeleteProduct}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Stock;
