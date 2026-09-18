import React, { useState } from 'react';
import { useAdmin } from './AdminContext';
import { PencilSimple, Trash, UploadSimple } from '@phosphor-icons/react';
import { supabase } from '../lib/supabase';

export const Stock: React.FC = () => {
  const { state, addMerma, createProduct, updateProduct, deleteProduct, showToast } = useAdmin();
  const [search, setSearch] = useState('');
  const [showMerma, setShowMerma] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', type: 'Vinos', stock: 10, price: 1000, image: '' });
  const [mermaData, setMermaData] = useState({ prodId: '', qty: 1 });
  const [uploading, setUploading] = useState(false);

  const filteredProducts = state.products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleOpenProduct = (prod?: any) => {
    if (prod) {
      setEditingId(prod.id);
      setFormData({ name: prod.name, type: prod.category, stock: prod.stock, price: prod.price, image: prod.image || '' });
    } else {
      setEditingId(null);
      setFormData({ name: '', type: 'Vinos', stock: 10, price: 1000, image: '' });
    }
    setShowProductForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // C-3a: Verify session before upload
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      showToast('No autorizado para subir archivos', 'error');
      return;
    }

    // C-3b: Validate file type against allowlist
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast('Tipo de archivo no permitido. Solo JPG, PNG, WEBP o GIF.', 'error');
      return;
    }

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    // M-7: Use crypto.randomUUID() to avoid filename collisions
    const fileName = `products/${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file);
    if (uploadError) {
      showToast('Error al subir la imagen', 'error');
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
    setFormData(prev => ({ ...prev, image: data.publicUrl }));
    setUploading(false);
    showToast('Imagen subida exitosamente', 'success');
  };

  const handleSaveProduct = async () => {
    if (!formData.name) {
      showToast('El nombre es requerido', 'error');
      return;
    }
    if (editingId) {
      await updateProduct(editingId, { name: formData.name, category: formData.type as any, stock: formData.stock, price: formData.price, image: formData.image });
      showToast('Producto actualizado', 'success');
    } else {
      await createProduct({ 
        name: formData.name, 
        category: formData.type as any, 
        stock: formData.stock, 
        price: formData.price,
        image: formData.image,
        description: '',
        isVisible: true
      });
      showToast('Producto creado', 'success');
    }
    setShowProductForm(false);
  };

  const executeDeleteProduct = async () => {
    if (deleteConfirmId) {
      await deleteProduct(deleteConfirmId);
      showToast('Producto eliminado', 'success');
      setDeleteConfirmId(null);
    }
  };

  const handleSaveMerma = async () => {
    if (!mermaData.prodId || mermaData.qty <= 0) return;
    const prod = state.products.find(p => p.id === mermaData.prodId);
    if (!prod || prod.stock < mermaData.qty) {
      showToast('Cantidad inválida o stock insuficiente.', 'error');
      return;
    }
    await updateProduct(prod.id, { stock: prod.stock - mermaData.qty });
    addMerma(mermaData.qty);
    setShowMerma(false);
    showToast('Merma registrada', 'success');
  };

  return (
    <section className="view-section active flex-col">
      <div className="section-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <h2 className="section-title">Control de Stock</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input 
            type="text" 
            className="filter-input"
            placeholder="Buscar nombre..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn-secondary" style={{ color: 'var(--danger)', background: '#ffeeee', border: 'none', borderRadius: '50px', padding: '0.65rem 1rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }} onClick={() => setShowMerma(true)}>
            - Reducciones
          </button>
          <button className="btn-accent" style={{ padding: '0.65rem 1.5rem' }} onClick={() => handleOpenProduct()}>
            + Nuevo Producto
          </button>
        </div>
      </div>

      <div className="card p-0" style={{ flex: 1, overflowY: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Tipo/Categoría</th>
              <th>Stock</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => {
              const badgeClass = p.stock > 5 ? 'success' : 'warning';
              const statusText = p.stock > 5 ? 'Óptimo' : 'Bajo Stock';
              return (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td><span style={{ textTransform: 'capitalize' }}>{p.category}</span></td>
                  <td>{p.stock}</td>
                  <td>${p.price.toLocaleString()}</td>
                  <td><span className={`badge ${badgeClass}`}>{statusText}</span></td>
                  <td>
                    <button className="btn-icon" onClick={() => handleOpenProduct(p)}><PencilSimple /></button>
                    <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => setDeleteConfirmId(p.id)}><Trash /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showProductForm && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <div className="form-group">
              <label>Nombre del Producto</label>
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Categoría</label>
              <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                <option value="Vinos">Vinos</option>
                <option value="Almacén">Almacén</option>
                <option value="Fiambres">Fiambres</option>
                <option value="Regalos">Regalos</option>
              </select>
            </div>
            <div className="form-group">
              <label>Stock Inicial</label>
              <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Precio Unitario</label>
              <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Imagen del Producto</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {formData.image && (
                  <img src={formData.image} alt="Vista previa" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                )}
                <div style={{ flex: 1 }}>
                  <label className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem 1rem' }}>
                    <UploadSimple /> {uploading ? 'Subiendo...' : 'Subir Foto'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading} />
                  </label>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowProductForm(false)}>Cancelar</button>
              <button className="btn-accent" onClick={handleSaveProduct}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {showMerma && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Registrar Baja por Reducción</h2>
            <div className="form-group">
              <label>Producto</label>
              <select value={mermaData.prodId} onChange={e => setMermaData({ ...mermaData, prodId: e.target.value })}>
                <option value="">Seleccionar...</option>
                {state.products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Disp: {p.stock})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Cantidad</label>
              <input type="number" value={mermaData.qty} onChange={e => setMermaData({ ...mermaData, qty: Number(e.target.value) })} min={1} />
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowMerma(false)}>Cancelar</button>
              <button className="btn-accent" onClick={handleSaveMerma}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ maxWidth: '400px' }}>
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>Confirmar Acción</h2>
            <p style={{ fontSize: '1.1rem', textAlign: 'center', padding: '1rem 0' }}>¿Seguro que querés eliminar este producto?</p>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setDeleteConfirmId(null)}>Cancelar</button>
              <button className="btn-accent" onClick={executeDeleteProduct} style={{ background: 'var(--danger)' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Stock;
