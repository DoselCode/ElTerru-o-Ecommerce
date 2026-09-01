import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Save, Upload, Loader2, Image as ImageIcon, FolderDown, CheckCircle2, PlusCircle } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { openGoogleDrivePicker } from '../lib/googleDrivePicker';

const GoogleDriveIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.9 2.5 3.2 3.3l12.3-21.3H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
    <path d="M43.65 25 29.8 1H15.95c-1.4 0-2.75.4-4 1.15L25.8 25z" fill="#00ac47"/>
    <path d="M73.55 76.8c1.3-.8 2.4-1.9 3.2-3.3l1.2-2.1c.8-1.4 1.2-2.95 1.2-4.5H53.3l7.95 13.8c1.3-.8 2.4-1.9 3.2-3.3z" fill="#ea4335"/>
    <path d="M43.65 25 57.5 1H29.8l13.85 24z" fill="#00832d"/>
    <path d="M59.8 55.5H26.05L13.75 76.8h59.8z" fill="#2684fc"/>
    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.9-2.5-3.2-3.3L43.65 25l16.15 28h25.9c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
  </svg>
);

export const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [loadingDrive, setLoadingDrive] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedProductName, setSavedProductName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    name: '',
    year: '',
    category: 'Vinos',
    price: '',
    original_price: '',
    discount_badge: '',
    badge: '',
    description: '',
    winery: '',
    pairing: '',
    stock: '0',
    is_visible: true,
    image: '',
  });

  const [imageFile, setImageFile] = useState<File | Blob | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (isEditing) {
      const fetchProduct = async () => {
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;
          if (data) {
            setFormData({
              name: data.name || '',
              year: data.year || '',
              category: data.category || 'Vinos',
              price: data.price ? String(data.price) : '',
              original_price: data.original_price ? String(data.original_price) : '',
              discount_badge: data.discount_badge || '',
              badge: data.badge || '',
              description: data.description || '',
              winery: data.winery || '',
              pairing: data.pairing || '',
              stock: data.stock !== null ? String(data.stock) : '0',
              is_visible: data.is_visible,
              image: data.image || '',
            });
            setImagePreview(data.image || '');
          }
        } catch (err: any) {
          console.error('Error fetching product:', err);
          setErrorMsg(err.message || 'Error al cargar el producto');
        } finally {
          setFetching(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let nextValue: any = value;
    if (type === 'checkbox') {
      nextValue = (e.target as HTMLInputElement).checked;
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: nextValue };

      // Autocalcular el porcentaje de descuento en discount_badge cuando se modifican price u original_price
      if (name === 'price' || name === 'original_price') {
        const currentPrice = parseFloat(name === 'price' ? nextValue : prev.price);
        const origPrice = parseFloat(name === 'original_price' ? nextValue : prev.original_price);

        if (!isNaN(origPrice) && !isNaN(currentPrice) && origPrice > 0 && currentPrice > 0 && origPrice > currentPrice) {
          const discountPercent = Math.round(((origPrice - currentPrice) / origPrice) * 100);
          updated.discount_badge = `-${discountPercent}%`;
        } else if (name === 'original_price' && (!nextValue || isNaN(origPrice) || origPrice <= 0)) {
          // Si se vacía o anula el precio original y el badge actual era un porcentaje, limpiarlo
          if (prev.discount_badge.startsWith('-') && prev.discount_badge.endsWith('%')) {
            updated.discount_badge = '';
          }
        }
      }

      return updated;
    });

    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const processAndSetImage = async (file: File, customPreviewUrl?: string) => {
    try {
      // Intentar compresión automática para formatos estándar
      if (file.type.includes('jpeg') || file.type.includes('png') || file.type.includes('webp')) {
        try {
          const options = {
            maxSizeMB: 0.2, // ~200kb
            maxWidthOrHeight: 1200,
            useWebWorker: true,
          };
          const compressedFile = await imageCompression(file, options);
          setImageFile(compressedFile);
          setImagePreview(customPreviewUrl || URL.createObjectURL(compressedFile));
          if (errors.image) setErrors((prev) => ({ ...prev, image: '' }));
          return;
        } catch (compressErr) {
          console.warn('Compresión automática omitida, usando imagen original:', compressErr);
        }
      }

      // Si no es comprimible directamente o la compresión falla, usamos el archivo original
      setImageFile(file);
      setImagePreview(customPreviewUrl || URL.createObjectURL(file));
      if (errors.image) setErrors((prev) => ({ ...prev, image: '' }));
    } catch (error) {
      console.warn('Procesamiento de imagen directo:', error);
      setImageFile(file);
      setImagePreview(customPreviewUrl || URL.createObjectURL(file));
      if (errors.image) setErrors((prev) => ({ ...prev, image: '' }));
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processAndSetImage(e.target.files[0]);
    }
  };

  /* Próximamente: Integración con Google Drive 
  const handleGoogleDrivePick = async () => {
    try {
      setLoadingDrive(true);
      setErrorMsg('');
      const result = await openGoogleDrivePicker();
      if (result) {
        await processAndSetImage(result.file, result.previewUrl);
        // Si el nombre está vacío, sugerir el nombre del archivo limpio
        if (!formData.name.trim() && result.name) {
          const cleanName = result.name
            .replace(/\.[^/.]+$/, '')
            .replace(/[-_]/g, ' ')
            .trim();
          setFormData((prev) => ({ ...prev, name: cleanName }));
        }
      }
    } catch (err: any) {
      console.error('Error picking from Google Drive:', err);
      setErrorMsg(err.message || 'Error al conectar con Google Drive. Verifica las credenciales configuradas.');
    } finally {
      setLoadingDrive(false);
    }
  };
  */

  const uploadImage = async (file: File | Blob): Promise<string> => {
    const ext = file instanceof File ? file.name.split('.').pop() : 'jpg';
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // 1. Nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del producto es obligatorio.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe contener al menos 2 caracteres.';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'El nombre no puede superar los 100 caracteres.';
    }

    // 2. Categoría
    if (!formData.category) {
      newErrors.category = 'Seleccioná una categoría.';
    }

    // 3. Precio
    if (!formData.price || formData.price.trim() === '') {
      newErrors.price = 'El precio es obligatorio.';
    } else {
      const numPrice = Number(formData.price);
      if (isNaN(numPrice) || numPrice <= 0) {
        newErrors.price = 'Ingresá un precio válido mayor a 0.';
      } else if (numPrice > 999999999) {
        newErrors.price = 'El precio excede el límite permitido.';
      }
    }

    // 4. Precio Original (Opcional pero validado si se ingresa)
    if (formData.original_price && formData.original_price.trim() !== '') {
      const numOriginal = Number(formData.original_price);
      const numPrice = Number(formData.price);
      if (isNaN(numOriginal) || numOriginal <= 0) {
        newErrors.original_price = 'El precio original debe ser mayor a 0.';
      } else if (!isNaN(numPrice) && numOriginal <= numPrice) {
        newErrors.original_price = 'El precio original debe ser mayor al precio con descuento.';
      } else if (numOriginal > 999999999) {
        newErrors.original_price = 'El precio original excede el límite permitido.';
      }
    }

    // 5. Stock
    if (formData.stock === '' || formData.stock.trim() === '') {
      newErrors.stock = 'El stock es obligatorio (usá 0 si no hay stock).';
    } else {
      const numStock = Number(formData.stock);
      if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
        newErrors.stock = 'El stock debe ser un número entero mayor o igual a 0.';
      } else if (numStock > 999999) {
        newErrors.stock = 'El stock no puede superar las 999.999 unidades.';
      }
    }

    // 6. Año (Opcional pero validado de 4 dígitos)
    if (formData.year && formData.year.trim() !== '') {
      const numYear = Number(formData.year.trim());
      const currentYear = new Date().getFullYear();
      if (!/^\d{4}$/.test(formData.year.trim()) || isNaN(numYear) || numYear < 1900 || numYear > currentYear + 2) {
        newErrors.year = `Ingresá un año válido de 4 dígitos (1900 - ${currentYear + 2}).`;
      }
    }

    // 7. Descripción
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción del producto es obligatoria.';
    } else if (formData.description.trim().length < 5) {
      newErrors.description = 'La descripción debe tener al menos 5 caracteres.';
    } else if (formData.description.trim().length > 1000) {
      newErrors.description = 'La descripción no puede superar los 1000 caracteres.';
    }

    // 8. Campos opcionales adicionales
    if (formData.winery && formData.winery.trim().length > 100) {
      newErrors.winery = 'La bodega no puede superar los 100 caracteres.';
    }
    if (formData.pairing && formData.pairing.trim().length > 250) {
      newErrors.pairing = 'El maridaje no puede superar los 250 caracteres.';
    }
    if (formData.badge && formData.badge.trim().length > 30) {
      newErrors.badge = 'La etiqueta no puede superar los 30 caracteres.';
    }
    if (formData.discount_badge && formData.discount_badge.trim().length > 20) {
      newErrors.discount_badge = 'El badge de descuento no puede superar los 20 caracteres.';
    }

    // 8. Imagen
    if (!isEditing && !imageFile && !formData.image) {
      newErrors.image = 'Debés subir o seleccionar una imagen desde Google Drive.';
    } else if (isEditing && !imageFile && !formData.image) {
      newErrors.image = 'El producto debe tener una imagen asignada.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateAnother = () => {
    setFormData({
      name: '',
      year: '',
      category: 'Vinos',
      price: '',
      original_price: '',
      discount_badge: '',
      badge: '',
      description: '',
      winery: '',
      pairing: '',
      stock: '0',
      is_visible: true,
      image: '',
    });
    setImageFile(null);
    setImagePreview('');
    setErrors({});
    setErrorMsg('');
    setShowSuccessModal(false);
    navigate('/admin/products/new');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setErrorMsg('Por favor revisá los campos marcados en rojo.');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');

    try {
      let finalImageUrl = formData.image;

      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      if (!finalImageUrl && !isEditing) {
        throw new Error('La imagen es obligatoria');
      }

      const payload = {
        name: formData.name.trim(),
        year: formData.year ? formData.year.trim() : null,
        category: formData.category,
        price: Number(formData.price),
        original_price: formData.original_price ? Number(formData.original_price) : null,
        discount_badge: formData.discount_badge ? formData.discount_badge.trim() : null,
        badge: formData.badge ? formData.badge.trim() : null,
        description: formData.description.trim(),
        winery: formData.winery ? formData.winery.trim() : null,
        pairing: formData.pairing ? formData.pairing.trim() : null,
        stock: parseInt(formData.stock) || 0,
        is_visible: formData.is_visible,
        image: finalImageUrl,
      };

      if (isEditing) {
        const { error } = await supabase.from('products').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
      }

      setSavedProductName(formData.name.trim());
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error('Error saving product:', err);
      setErrorMsg(err.message || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-terruno-burgundy animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin" className="p-2 text-terruno-muted hover:bg-terruno-border rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-serif font-bold text-terruno-brown">
          {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
        </h1>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="bg-white rounded-2xl shadow-sm border border-terruno-border p-6 md:p-8 space-y-8">
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-terruno-brown border-b border-terruno-border pb-2">Información Básica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-terruno-muted">Nombre *</label>
                <span className="text-[11px] text-terruno-muted">{formData.name.length}/100</span>
              </div>
              <input
                type="text"
                name="name"
                maxLength={100}
                value={formData.name}
                onChange={handleChange}
                placeholder="ej: Malbec Reserva 2021"
                className={`w-full p-3 rounded-xl border bg-terruno-bg focus:outline-none focus:ring-2 focus:ring-terruno-burgundy/20 focus:border-terruno-burgundy transition-all ${errors.name ? 'border-red-500' : 'border-terruno-border'}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-terruno-muted mb-1">Categoría *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full p-3 rounded-xl border bg-terruno-bg focus:outline-none focus:ring-2 focus:ring-terruno-burgundy/20 focus:border-terruno-burgundy transition-all ${errors.category ? 'border-red-500' : 'border-terruno-border'}`}
              >
                <option value="Vinos">Vinos</option>
                <option value="Almacén">Almacén</option>
                <option value="Fiambres">Fiambres</option>
                <option value="Regalos">Regalos</option>
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-terruno-muted mb-1">Precio *</label>
              <input
                type="number"
                step="0.01"
                name="price"
                max={999999999}
                value={formData.price}
                onChange={handleChange}
                placeholder="ej: 12500"
                className={`w-full p-3 rounded-xl border bg-terruno-bg focus:outline-none focus:ring-2 focus:ring-terruno-burgundy/20 focus:border-terruno-burgundy transition-all ${errors.price ? 'border-red-500' : 'border-terruno-border'}`}
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-terruno-muted mb-1">Precio Original (opcional para oferta)</label>
              <input
                type="number"
                step="0.01"
                name="original_price"
                max={999999999}
                value={formData.original_price}
                onChange={handleChange}
                placeholder="ej: 15000 (mayor al precio actual)"
                className={`w-full p-3 rounded-xl border bg-terruno-bg focus:outline-none focus:ring-2 focus:ring-terruno-burgundy/20 focus:border-terruno-burgundy transition-all ${errors.original_price ? 'border-red-500' : 'border-terruno-border'}`}
              />
              {errors.original_price && <p className="text-red-500 text-xs mt-1">{errors.original_price}</p>}
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-terruno-muted">Descripción *</label>
              <span className="text-[11px] text-terruno-muted">{formData.description.length}/1000</span>
            </div>
            <textarea
              rows={4}
              name="description"
              maxLength={1000}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describí las características, notas de cata o detalles del producto..."
              className={`w-full p-3 rounded-xl border bg-terruno-bg focus:outline-none focus:ring-2 focus:ring-terruno-burgundy/20 focus:border-terruno-burgundy transition-all ${errors.description ? 'border-red-500' : 'border-terruno-border'}`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-terruno-brown border-b border-terruno-border pb-2">Detalles del Producto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-terruno-muted">Bodega / Productor (opcional)</label>
                <span className="text-[11px] text-terruno-muted">{formData.winery.length}/100</span>
              </div>
              <input
                type="text"
                name="winery"
                maxLength={100}
                value={formData.winery}
                onChange={handleChange}
                placeholder="ej: Catena Zapata"
                className={`w-full p-3 rounded-xl border bg-terruno-bg focus:outline-none focus:ring-2 focus:ring-terruno-burgundy/20 focus:border-terruno-burgundy transition-all ${errors.winery ? 'border-red-500' : 'border-terruno-border'}`}
              />
              {errors.winery && <p className="text-red-500 text-xs mt-1">{errors.winery}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-terruno-muted mb-1">Año / Cosecha (opcional)</label>
              <input
                type="text"
                name="year"
                maxLength={4}
                value={formData.year}
                onChange={handleChange}
                placeholder="ej: 2021"
                className={`w-full p-3 rounded-xl border bg-terruno-bg focus:outline-none focus:ring-2 focus:ring-terruno-burgundy/20 focus:border-terruno-burgundy transition-all ${errors.year ? 'border-red-500' : 'border-terruno-border'}`}
              />
              {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-terruno-muted">Maridaje sugerido (opcional)</label>
              <span className="text-[11px] text-terruno-muted">{formData.pairing.length}/250</span>
            </div>
            <input
              type="text"
              name="pairing"
              maxLength={250}
              value={formData.pairing}
              onChange={handleChange}
              placeholder="ej: Carnes rojas, quesos duros y pastas con salsas intensas"
              className={`w-full p-3 rounded-xl border bg-terruno-bg focus:outline-none focus:ring-2 focus:ring-terruno-burgundy/20 focus:border-terruno-burgundy transition-all ${errors.pairing ? 'border-red-500' : 'border-terruno-border'}`}
            />
            {errors.pairing && <p className="text-red-500 text-xs mt-1">{errors.pairing}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-terruno-muted mb-1">Stock *</label>
              <input
                type="number"
                name="stock"
                max={999999}
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                className={`w-full p-3 rounded-xl border bg-terruno-bg focus:outline-none focus:ring-2 focus:ring-terruno-burgundy/20 focus:border-terruno-burgundy transition-all ${errors.stock ? 'border-red-500' : 'border-terruno-border'}`}
              />
              {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-terruno-muted mb-1">Etiqueta Especial (opc.)</label>
              <input
                type="text"
                name="badge"
                maxLength={30}
                value={formData.badge}
                onChange={handleChange}
                placeholder="ej: Novedad, Destacado"
                className={`w-full p-3 rounded-xl border bg-terruno-bg focus:outline-none focus:ring-2 focus:ring-terruno-burgundy/20 focus:border-terruno-burgundy transition-all ${errors.badge ? 'border-red-500' : 'border-terruno-border'}`}
              />
              {errors.badge && <p className="text-red-500 text-xs mt-1">{errors.badge}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-terruno-muted mb-1">
                Desc. Etiqueta (autocompleta %)
              </label>
              <input
                type="text"
                name="discount_badge"
                maxLength={20}
                value={formData.discount_badge}
                onChange={handleChange}
                placeholder="ej: -20%"
                className={`w-full p-3 rounded-xl border bg-terruno-bg focus:outline-none focus:ring-2 focus:ring-terruno-burgundy/20 focus:border-terruno-burgundy transition-all ${errors.discount_badge ? 'border-red-500' : 'border-terruno-border'}`}
              />
              {errors.discount_badge && <p className="text-red-500 text-xs mt-1">{errors.discount_badge}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="is_visible"
              name="is_visible"
              checked={formData.is_visible}
              onChange={handleChange}
              className="w-4 h-4 text-terruno-burgundy bg-terruno-bg border-terruno-border rounded focus:ring-terruno-burgundy"
            />
            <label htmlFor="is_visible" className="text-sm font-medium text-terruno-brown">
              Visible en la tienda
            </label>
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-terruno-brown border-b border-terruno-border pb-2">Imagen del Producto</h2>
          
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-1 w-full space-y-3">
              <label className="block text-sm font-medium text-terruno-muted">
                Seleccionar Imagen {(!isEditing && !imageFile && !formData.image) && '*'}
              </label>

              <div className="grid grid-cols-1 gap-3">
                {/* Próximamente: Integración con Google Drive
                <button
                  type="button"
                  onClick={handleGoogleDrivePick}
                  disabled={loadingDrive || loading}
                  className="flex flex-col items-center justify-center p-5 rounded-xl border border-terruno-border bg-white hover:bg-terruno-bg hover:border-terruno-brown/30 transition-all cursor-pointer shadow-xs group text-center min-h-[125px]"
                >
                  {loadingDrive ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 text-terruno-burgundy animate-spin" />
                      <span className="text-xs text-terruno-muted font-medium">Descargando de Drive...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <GoogleDriveIcon className="w-7 h-7 group-hover:scale-110 transition-transform" />
                      <div>
                        <span className="text-sm font-medium text-terruno-brown block">Elegir de Google Drive</span>
                        <span className="text-[11px] text-terruno-muted">Explorar carpetas en la nube</span>
                      </div>
                    </div>
                  )}
                </button>
                */}

                {/* Subida Local */}
                <label className={`flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-xl cursor-pointer bg-terruno-bg hover:bg-terruno-border/60 transition-all text-center min-h-[125px] ${errors.image ? 'border-red-500' : 'border-terruno-border'}`}>
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-6 h-6 text-terruno-muted" />
                    <div>
                      <span className="text-sm font-medium text-terruno-brown block">Subir de este equipo</span>
                      <span className="text-[11px] text-terruno-muted">JPG, PNG, WebP</span>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
            </div>

            {/* Vista previa */}
            <div className="flex flex-col items-center sm:items-start self-center md:self-start">
              <span className="text-xs font-medium text-terruno-muted mb-2">Vista Previa</span>
              {imagePreview ? (
                <div className="w-32 h-32 rounded-xl border border-terruno-border overflow-hidden bg-terruno-bg flex-shrink-0 shadow-xs relative group">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-xl border border-terruno-border border-dashed bg-terruno-bg flex-shrink-0 flex flex-col items-center justify-center text-terruno-muted text-center p-2">
                  <ImageIcon className="w-8 h-8 opacity-40 mb-1" />
                  <span className="text-[10px] text-terruno-muted">Sin imagen</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-terruno-border flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            disabled={loading}
            className="px-6 py-3 rounded-xl border border-terruno-border text-terruno-brown hover:bg-terruno-bg transition-colors font-medium cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-terruno-burgundy text-white px-6 py-3 rounded-xl hover:bg-terruno-burgundy-light transition-colors disabled:opacity-70 disabled:cursor-not-allowed font-medium shadow-sm cursor-pointer"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>{loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Producto')}</span>
          </button>
        </div>
      </form>

      {/* Success Modal */}
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
                onClick={() => navigate('/admin')}
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
  );
};

export default ProductForm;
