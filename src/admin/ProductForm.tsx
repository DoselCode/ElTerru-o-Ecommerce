import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Loader2, Image as ImageIcon, CheckCircle2, PlusCircle } from 'lucide-react';
import { productService } from '../services/productService';
import { storageService } from '../services/storageService';
import { FormField } from './productForm/FormField';
import { useProductImage } from './productForm/useProductImage';
import {
  CATEGORIES, EMPTY_PRODUCT_FORM, FormErrors, ProductFormValues,
  productFormFromRow, productFormToPayload, validateProductForm, withAutoDiscountBadge,
} from './productForm/productFormUtils';

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-lg font-medium text-terruno-brown border-b border-terruno-border pb-2">{children}</h2>
);

export const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedProductName, setSavedProductName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [form, setForm] = useState<ProductFormValues>(EMPTY_PRODUCT_FORM);

  const { imageFile, imagePreview, handleImageChange, reset: resetImage } = useProductImage(
    (message) => setErrors(prev => ({ ...prev, image: message })),
    () => setErrors(prev => ({ ...prev, image: '' }))
  );

  useEffect(() => {
    if (!isEditing) return;
    productService.getProduct(id as string)
      .then((row) => {
        if (!row) return;
        setForm(productFormFromRow(row));
        resetImage(row.image || '');
      })
      .catch((err: any) => {
        console.error('Error fetching product:', err);
        setErrorMsg(err.message || 'Error al cargar el producto');
      })
      .finally(() => setFetching(false));
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const nextValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setForm(prev => withAutoDiscountBadge(prev, { ...prev, [name]: nextValue }, name));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCreateAnother = () => {
    setForm(EMPTY_PRODUCT_FORM);
    resetImage();
    setErrors({});
    setErrorMsg('');
    setShowSuccessModal(false);
    navigate('/admin/products/new');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateProductForm(form, Boolean(imageFile || form.image), isEditing);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setErrorMsg('Por favor revisá los campos marcados en rojo.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      const image = imageFile ? await storageService.uploadProductImage(imageFile) : form.image;
      const payload = productFormToPayload(form, image);

      if (isEditing) await productService.updateProduct(id as string, payload);
      else await productService.createProduct(payload);

      setSavedProductName(form.name.trim());
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error('Error saving product:', err);
      setErrorMsg(err.message || 'Error al guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-terruno-burgundy animate-spin" />
      </div>
    );
  }

  const categoryOptions = CATEGORIES.includes(form.category) ? CATEGORIES : [form.category, ...CATEGORIES];
  const fieldProps = (name: keyof ProductFormValues & string) => ({
    name, value: form[name] as string, error: errors[name], onChange: handleChange,
  });

  return (
    <div className="view-section active">
      <div className="max-w-6xl mx-auto space-y-6 pb-12 pr-4">
        <div className="flex items-center gap-4">
          <Link to="/admin/stock" className="p-2 text-terruno-muted hover:bg-terruno-border rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-serif font-bold text-terruno-brown">
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </h1>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium">{errorMsg}</div>
        )}

        <form onSubmit={handleSubmit} noValidate className="bg-white rounded-2xl shadow-sm border border-terruno-border p-6 md:p-8 space-y-8">
          <div className="space-y-4">
            <SectionTitle>Información Básica</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField label="Código" placeholder="Automático si se deja vacío" maxLength={6} {...fieldProps('code')} />
              <div className="md:col-span-2">
                <FormField label="Nombre *" placeholder="ej: Malbec Reserva 2021" maxLength={100} {...fieldProps('name')} />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-terruno-muted mb-1">Categoría *</label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-terruno-border bg-terruno-bg focus:outline-none focus:ring-2 focus:ring-terruno-burgundy/20 focus:border-terruno-burgundy transition-all"
                >
                  {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField label="Precio de lista (PSP) *" type="number" step="0.01" max={999999999} placeholder="ej: 12700" {...fieldProps('price')} />
              <FormField label="Precio Efectivo (opcional)" type="number" step="0.01" max={999999999} placeholder="Automático: -10%" {...fieldProps('price_efectivo')} />
              <FormField label="Precio Transferencia (opcional)" type="number" step="0.01" max={999999999} placeholder="Automático: -5%" {...fieldProps('price_transferencia')} />
              <FormField label="Precio Original (oferta)" type="number" step="0.01" max={999999999} placeholder="ej: 15000" {...fieldProps('original_price')} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <FormField label="Proveedor (opcional)" placeholder="ej: DANKON" maxLength={60} {...fieldProps('supplier')} />
              </div>
              <FormField label="Stock *" type="number" max={999999} placeholder="0" {...fieldProps('stock')} />
            </div>

            <FormField label="Descripción *" rows={4} maxLength={1000} placeholder="Describí las características, notas de cata o detalles del producto..." {...fieldProps('description')} />
          </div>

          <div className="space-y-4">
            <SectionTitle>Detalles del Producto</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Bodega / Productor (opcional)" placeholder="ej: Catena Zapata" maxLength={100} {...fieldProps('winery')} />
              <FormField label="Año / Cosecha (opcional)" placeholder="ej: 2021" maxLength={4} {...fieldProps('year')} />
            </div>
            <FormField label="Maridaje sugerido (opcional)" placeholder="ej: Carnes rojas, quesos duros y pastas con salsas intensas" maxLength={250} {...fieldProps('pairing')} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Etiqueta Especial (opc.)" placeholder="ej: Novedad, Destacado" maxLength={30} {...fieldProps('badge')} />
              <FormField label="Desc. Etiqueta (autocompleta %)" placeholder="ej: -20%" maxLength={20} {...fieldProps('discount_badge')} />
            </div>

            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                id="is_visible"
                name="is_visible"
                checked={form.is_visible}
                onChange={handleChange}
                className="w-4 h-4 text-terruno-burgundy bg-terruno-bg border-terruno-border rounded focus:ring-terruno-burgundy"
              />
              <label htmlFor="is_visible" className="text-sm font-medium text-terruno-brown">Visible en la tienda</label>
            </div>
          </div>

          <div className="space-y-4">
            <SectionTitle>Imagen del Producto</SectionTitle>
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-1 w-full space-y-3">
                <label className="block text-sm font-medium text-terruno-muted">
                  Seleccionar Imagen {!imageFile && !form.image && '*'}
                </label>
                <label className={`flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-xl cursor-pointer bg-terruno-bg hover:bg-terruno-border/60 transition-all text-center min-h-[125px] ${errors.image ? 'border-red-500' : 'border-terruno-border'}`}>
                  <Upload className="w-6 h-6 text-terruno-muted" />
                  <span className="text-sm font-medium text-terruno-brown block">Subir de este equipo</span>
                  <span className="text-[11px] text-terruno-muted">JPG, PNG, WebP</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
                {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
              </div>

              <div className="flex flex-col items-center sm:items-start self-center md:self-start">
                <span className="text-xs font-medium text-terruno-muted mb-2">Vista Previa</span>
                {imagePreview ? (
                  <div className="w-32 h-32 rounded-xl border border-terruno-border overflow-hidden bg-terruno-bg shadow-xs">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-xl border border-terruno-border border-dashed bg-terruno-bg flex flex-col items-center justify-center text-terruno-muted text-center p-2">
                    <ImageIcon className="w-8 h-8 opacity-40 mb-1" />
                    <span className="text-[10px]">Sin imagen</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-terruno-border flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/stock')}
              disabled={saving}
              className="px-6 py-3 rounded-xl border border-terruno-border text-terruno-brown hover:bg-terruno-bg transition-colors font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-terruno-burgundy text-white px-6 py-3 rounded-xl hover:bg-terruno-burgundy-light transition-colors disabled:opacity-70 disabled:cursor-not-allowed font-medium shadow-sm cursor-pointer"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>{saving ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Producto')}</span>
            </button>
          </div>
        </form>

        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-terruno-border text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif font-bold text-terruno-brown">
                  {isEditing ? '¡Producto Actualizado!' : '¡Producto Creado con Éxito!'}
                </h3>
                <p className="text-sm text-terruno-muted leading-relaxed">
                  El producto <strong className="text-terruno-brown">&ldquo;{savedProductName}&rdquo;</strong> se guardó correctamente y ya está actualizado en el catálogo.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/admin/stock')}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-terruno-burgundy text-white font-medium hover:bg-terruno-burgundy-light transition-all shadow-sm cursor-pointer"
                >
                  Volver al listado
                </button>
                {isEditing ? (
                  <button
                    type="button"
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-terruno-bg border border-terruno-border text-terruno-brown font-medium hover:bg-terruno-border/60 transition-all cursor-pointer"
                  >
                    Continuar editando
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCreateAnother}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-terruno-bg border border-terruno-border text-terruno-brown font-medium hover:bg-terruno-border/60 transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-terruno-olive" />
                    <span>Crear otro</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductForm;
