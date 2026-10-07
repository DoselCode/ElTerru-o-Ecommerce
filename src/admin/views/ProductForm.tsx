import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, FloppyDisk, CircleNotch } from '@phosphor-icons/react';
import { productService } from '../../services/productService';
import { storageService } from '../../services/storageService';
import { FormField, SelectField } from '../productForm/FormField';
import { ProductDetailsSection } from '../productForm/ProductDetailsSection';
import { useProductImage } from '../productForm/useProductImage';
import { ProductImageSection } from '../productForm/ProductImageSection';
import { ProductSavedModal } from '../productForm/ProductSavedModal';
import {
  CATEGORIES, EMPTY_PRODUCT_FORM, FormErrors, ProductFormValues,
  productFormFromRow, productFormToPayload, validateProductForm, withAutoDiscountBadge,
} from '../productForm/productFormUtils';

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
  const [categories, setCategories] = useState<{id:string, name:string}[]>([]);
  const [providers, setProviders] = useState<{id:string, name:string}[]>([]);

  const { imageFile, imagePreview, handleImageChange, reset: resetImage } = useProductImage(
    (message) => setErrors(prev => ({ ...prev, image: message })),
    () => setErrors(prev => ({ ...prev, image: '' }))
  );

  useEffect(() => {
    productService.getCategories().then(setCategories).catch((err: unknown) => console.error('Error loading categories:', err));
    productService.getProviders().then(setProviders).catch((err: unknown) => console.error('Error loading providers:', err));
  }, []);

  useEffect(() => {
    if (!isEditing) return;
    productService.getProduct(id as string)
      .then((row) => {
        if (!row) return;
        setForm(productFormFromRow(row));
        resetImage(row.image || '');
      })
      .catch((err: unknown) => {
        console.error('Error fetching product:', err);
        setErrorMsg(err instanceof Error && err.message ? err.message : 'Error al cargar el producto');
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
    } catch (err: unknown) {
      console.error('Error saving product:', err);
      setErrorMsg(err instanceof Error && err.message ? err.message : 'Error al guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <CircleNotch className="w-8 h-8 text-terruno-burgundy animate-spin" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Código" placeholder="Automático si se deja vacío" maxLength={6} {...fieldProps('code')} />
              <div className="md:col-span-2">
                <FormField label="Nombre *" placeholder="ej: Malbec Reserva 2021" maxLength={100} {...fieldProps('name')} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField label="Categoría *" name="category_id" value={form.category_id} error={errors.category_id} onChange={handleChange} options={categories} placeholder={{ label: 'Seleccioná una categoría', disabled: true }} />
              <SelectField label="Proveedor (opcional)" name="provider_id" value={form.provider_id} onChange={handleChange} options={providers} placeholder={{ label: 'Ninguno' }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField label="Precio de lista (PSP) *" type="number" step="0.01" max={999999999} placeholder="ej: 12700" {...fieldProps('price')} />
              <FormField label="Precio Efectivo (opcional)" type="number" step="0.01" max={999999999} placeholder="Automático: -10%" {...fieldProps('price_efectivo')} />
              <FormField label="Precio Transferencia (opcional)" type="number" step="0.01" max={999999999} placeholder="Automático: -5%" {...fieldProps('price_transferencia')} />
              <FormField label="Precio Original (oferta)" type="number" step="0.01" max={999999999} placeholder="ej: 15000" {...fieldProps('original_price')} />
            </div>

            <FormField label="Descripción *" rows={4} maxLength={1000} placeholder="Describí las características, notas de cata o detalles del producto..." {...fieldProps('description')} />
          </div>

          <ProductDetailsSection
            title={<SectionTitle>Detalles del Producto</SectionTitle>}
            form={form}
            errors={errors}
            fieldProps={fieldProps}
            onChange={handleChange}
          />

          <ProductImageSection
            title={<SectionTitle>Imagen del Producto</SectionTitle>}
            required={!imageFile && !form.image}
            error={errors.image}
            preview={imagePreview}
            onChange={handleImageChange}
          />

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
              {saving ? <CircleNotch className="w-5 h-5 animate-spin" /> : <FloppyDisk className="w-5 h-5" />}
              <span>{saving ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Producto')}</span>
            </button>
          </div>
        </form>

        {showSuccessModal && (
          <ProductSavedModal
            isEditing={isEditing}
            productName={savedProductName}
            onClose={() => setShowSuccessModal(false)}
            onGoToList={() => navigate('/admin/stock')}
            onCreateAnother={handleCreateAnother}
          />
        )}
      </div>
    </div>
  );
};

export default ProductForm;
