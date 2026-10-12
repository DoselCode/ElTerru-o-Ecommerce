import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSimple, Trash, Star, Eye, EyeSlash, CaretUp, CaretDown } from '@phosphor-icons/react';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';
import { formatMoney } from '../utils/posUtils';
import { ConfirmModal } from './ConfirmModal';
import type { Product } from '../../types/product';
import { Paginator, usePaginator } from '../Paginator';

const PAGE_SIZE = 15;
const LOW_STOCK_THRESHOLD = 5;

const StockBadge: React.FC<{ stock: number }> = ({ stock }) => {
  if (stock <= 0) {
    return (
      <span className="badge-tag" style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', fontWeight: 600 }} role="status">
        ⛔ Agotado
      </span>
    );
  }
  if (stock <= LOW_STOCK_THRESHOLD) {
    return (
      <span className="badge-tag" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', fontWeight: 600 }} role="status">
        ⚠️ Crítico ({stock})
      </span>
    );
  }
  return <span>{stock}</span>;
};

const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%2240%22 height%3D%2240%22 viewBox%3D%220 0 40 40%22%3E%3Crect width%3D%2240%22 height%3D%2240%22 fill%3D%22%23e8e3d9%22%2F%3E%3Ctext x%3D%2250%25%22 y%3D%2255%25%22 text-anchor%3D%22middle%22 fill%3D%22%23a09070%22 font-size%3D%2218%22%3E%3F%3C%2Ftext%3E%3C%2Fsvg%3E';

type SortKey = 'code' | 'name' | 'category' | 'provider' | 'price' | 'stock' | 'status';

const getSortValue = (p: Product, key: SortKey): string | number => {
  if (key === 'category') return p.categories?.name || '';
  if (key === 'provider') return p.providers?.name || '';
  if (key === 'status') return p.isVisible ? 1 : 0;
  if (key === 'price') return p.price || 0;
  if (key === 'stock') return p.stock || 0;
  return (p[key as keyof Product] as string) || '';
};

interface SortConfig {
  key: SortKey;
  direction: 'asc' | 'desc';
}

interface SortableHeaderProps {
  label: string;
  sortKey: SortKey;
  sortConfig: SortConfig | null;
  onSort: (key: SortKey) => void;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({ label, sortKey, sortConfig, onSort }) => {
  const isActive = sortConfig?.key === sortKey;
  const dir = sortConfig?.direction;
  return (
    <th onClick={() => onSort(sortKey)} style={{ cursor: 'pointer', userSelect: 'none' }} className="group hover:bg-terruno-brown/5 transition-colors">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {label}
        <span style={{ display: 'inline-flex', flexDirection: 'column', opacity: isActive ? 1 : 0.2, transition: 'opacity 0.2s' }} className="group-hover:opacity-100">
          {(!isActive || dir === 'asc') && <CaretUp size={12} style={{ marginBottom: '-4px', opacity: isActive && dir === 'asc' ? 1 : 0.5 }} />}
          {(!isActive || dir === 'desc') && <CaretDown size={12} style={{ opacity: isActive && dir === 'desc' ? 1 : 0.5 }} />}
        </span>
      </div>
    </th>
  );
};

const UNDO_WINDOW_MS = 5000;

interface PendingVisibility {
  timer: ReturnType<typeof setTimeout>;
  original: boolean;
  next: boolean;
}

/** Inventario: grilla ordenable con filtros; permite ocultar/mostrar, marcar best seller, editar y eliminar productos. */
export const Stock: React.FC = () => {
  const navigate = useNavigate();
  const { state, updateProduct, updateProductLocal, deleteProduct } = useAdmin();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [supplier, setSupplier] = useState('');
  const [category, setCategory] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [featuringId, setFeaturingId] = useState<string | null>(null);

  const categories = useMemo(
    () => [...new Set(state.products.map(p => p.categories?.name).filter(Boolean))].sort() as string[],
    [state.products]
  );

  const suppliers = useMemo(
    () => [...new Set(state.products.map(p => p.providers?.name).filter(Boolean))].sort() as string[],
    [state.products]
  );

  const query = search.trim().toLowerCase();
  const filteredProducts = useMemo(() => {
    return state.products.filter(p => {
      if (category && p.categories?.name !== category) return false;
      if (supplier && p.providers?.name !== supplier) return false;
      return !query || p.name.toLowerCase().includes(query) || p.code.includes(query) || (p.providers?.name || '').toLowerCase().includes(query);
    });
  }, [state.products, category, supplier, query]);

  const sortedProducts = useMemo(() => {
    if (!sortConfig) return filteredProducts;
    return [...filteredProducts].sort((a, b) => {
      const aVal = getSortValue(a, sortConfig.key);
      const bVal = getSortValue(b, sortConfig.key);
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredProducts, sortConfig]);

  const { page, totalPages, setPage, slice: pageProducts } = usePaginator(sortedProducts, PAGE_SIZE);

  const handleSort = useCallback((key: SortKey) => {
    setSortConfig(prev =>
      prev?.key === key && prev.direction === 'asc'
        ? { key, direction: 'desc' }
        : { key, direction: 'asc' }
    );
  }, []);

  // Visibility changes are applied locally right away and persisted after an undo window
  const pendingVisibility = useRef(new Map<string, PendingVisibility>());
  const updateProductRef = useRef(updateProduct);
  updateProductRef.current = updateProduct;

  const persistVisibility = useCallback(async (id: string, next: boolean) => {
    pendingVisibility.current.delete(id);
    try {
      await updateProductRef.current(id, { isVisible: next });
    } catch {
      updateProductLocal(id, { isVisible: !next });
      showToast('Error al actualizar visibilidad', 'error');
    }
  }, [showToast, updateProductLocal]);

  const handleToggleVisibility = useCallback((product: Product) => {
    const pending = pendingVisibility.current.get(product.id);
    if (pending) {
      clearTimeout(pending.timer);
      pendingVisibility.current.delete(product.id);
      updateProductLocal(product.id, { isVisible: pending.original });
      return;
    }

    const original = Boolean(product.isVisible);
    const next = !original;
    updateProductLocal(product.id, { isVisible: next });

    const timer = setTimeout(() => persistVisibility(product.id, next), UNDO_WINDOW_MS);
    pendingVisibility.current.set(product.id, { timer, original, next });

    showToast(next ? 'Producto visible' : 'Producto ocultado', 'warning', {
      duration: UNDO_WINDOW_MS,
      action: {
        label: 'Deshacer',
        onClick: () => {
          const current = pendingVisibility.current.get(product.id);
          if (!current) return;
          clearTimeout(current.timer);
          pendingVisibility.current.delete(product.id);
          updateProductLocal(product.id, { isVisible: current.original });
        },
      },
    });
  }, [persistVisibility, showToast, updateProductLocal]);

  // Leaving the screen inside the undo window must not drop the change
  useEffect(() => {
    const pendingMap = pendingVisibility.current;
    return () => {
      pendingMap.forEach((pending, id) => {
        clearTimeout(pending.timer);
        updateProductRef.current(id, { isVisible: pending.next }).catch(() => undefined);
      });
      pendingMap.clear();
    };
  }, []);

  const handleToggleFeatured = useCallback(async (product: Product) => {
    if (featuringId) return;
    setFeaturingId(product.id);
    try {
      if (!product.isFeatured) {
        const currentlyFeatured = state.products.filter(p => p.isFeatured && p.id !== product.id);
        for (const p of currentlyFeatured) await updateProduct(p.id, { isFeatured: false });
      }
      await updateProduct(product.id, { isFeatured: !product.isFeatured });
    } catch {
      showToast('Error al actualizar producto destacado', 'error');
    } finally {
      setFeaturingId(null);
    }
  }, [featuringId, showToast, state.products, updateProduct]);

  const executeDeleteProduct = useCallback(async () => {
    if (!deleteConfirmId) return;
    await deleteProduct(deleteConfirmId);
    showToast('Producto eliminado', 'success');
    setDeleteConfirmId(null);
  }, [deleteConfirmId, deleteProduct, showToast]);
  return (
    <section className="view-section active flex-col">
      <div className="section-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <h2 className="section-title">Control de Stock</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <label htmlFor="stock-search" className="sr-only">Buscar productos</label>
          <input id="stock-search" type="text" className="filter-input" placeholder="Buscar código o nombre..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="filter-input" style={{ minWidth: '160px' }} value={category} onChange={e => setCategory(e.target.value)} aria-label="Filtrar por categoría">
            <option value="">Todas las categorías</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="filter-input" style={{ minWidth: '190px' }} value={supplier} onChange={e => setSupplier(e.target.value)} aria-label="Filtrar por proveedor">
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
              <SortableHeader label="Código" sortKey="code" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Producto" sortKey="name" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Categoría" sortKey="category" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Proveedor" sortKey="provider" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Precio" sortKey="price" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Stock" sortKey="stock" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader label="Estado" sortKey="status" sortConfig={sortConfig} onSort={handleSort} />
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
                <td>
                  {(p.categories?.name || p.category)
                    ? <span className="badge-tag">{p.categories?.name || p.category}</span>
                    : <span style={{ color: '#94a3b8' }}>-</span>}
                </td>
                <td>
                  {(p.providers?.name || p.supplier)
                    ? <span className="badge-tag" style={{ background: '#334155', color: 'white' }}>{p.providers?.name || p.supplier}</span>
                    : <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>Sin proveedor</span>}
                </td>
                <td><strong>{formatMoney(p.price)}</strong></td>
                <td><StockBadge stock={p.stock} /></td>
                <td>
                  <span
                    className={`badge ${p.isVisible ? 'success' : 'danger'} badge-icon`}
                    style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                    role="button"
                    tabIndex={0}
                    aria-label={p.isVisible ? `Ocultar producto ${p.name}` : `Hacer visible el producto ${p.name}`}
                    onClick={() => handleToggleVisibility(p)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleToggleVisibility(p); } }}
                    title={p.isVisible ? 'Ocultar producto' : 'Hacer visible'}
                  >
                    {p.isVisible ? <Eye weight="bold" /> : <EyeSlash weight="bold" />}
                    {p.isVisible ? 'Visible' : 'Oculto'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button className="btn-icon" disabled={featuringId !== null} title={p.isFeatured ? 'Quitar Best Seller' : 'Marcar Best Seller'} aria-label={p.isFeatured ? 'Quitar Best Seller' : 'Marcar Best Seller'} onClick={() => handleToggleFeatured(p)} style={{ color: p.isFeatured ? 'var(--accent-color)' : 'var(--text-muted)' }}>
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
        <ConfirmModal
          message="¿Seguro que querés eliminar este producto?"
          confirmLabel="Eliminar"
          isDestructive
          onConfirm={executeDeleteProduct}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}
    </section>
  );
};

export default Stock;
