import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Save, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
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
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const options = {
          maxSizeMB: 0.2, // ~200kb
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        setImageFile(compressedFile);
        setImagePreview(URL.createObjectURL(compressedFile));
        if (errors.image) setErrors((prev) => ({ ...prev, image: '' }));
      } catch (error) {
        console.error('Error compressing image:', error);
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      }
    }
  };

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
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!formData.category) newErrors.category = 'La categoría es obligatoria';
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'Debe ingresar un precio válido';
    if (!formData.description.trim()) newErrors.description = 'La descripción es obligatoria';
    if (!isEditing && !imageFile && !formData.image) newErrors.image = 'La imagen es obligatoria';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setErrorMsg('Por favor completá los campos obligatorios.');
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
        name: formData.name,
        year: formData.year || null,
        category: formData.category,
        price: Number(formData.price),
        original_price: formData.original_price ? Number(formData.original_price) : null,
        discount_badge: formData.discount_badge || null,
        badge: formData.badge || null,
        description: formData.description,
        winery: formData.winery || null,
        pairing: formData.pairing || null,
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

      navigate('/admin');
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
        <Loader2 className="w-8 h-8 text-[#70232B] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin" className="p-2 text-[#8C7A70] hover:bg-[#EBE6D8] rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-serif font-bold text-[#3D2C23]">
          {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
        </h1>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="bg-white rounded-2xl shadow-sm border border-[#EBE6D8] p-6 md:p-8 space-y-8">
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-[#3D2C23] border-b border-[#EBE6D8] pb-2">Información Básica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#8C7A70] mb-1">Nombre *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full p-3 rounded-xl border bg-[#F7F5EE] focus:outline-none focus:ring-2 focus:ring-[#70232B]/20 focus:border-[#70232B] transition-all ${errors.name ? 'border-red-500' : 'border-[#EBE6D8]'}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8C7A70] mb-1">Categoría *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full p-3 rounded-xl border bg-[#F7F5EE] focus:outline-none focus:ring-2 focus:ring-[#70232B]/20 focus:border-[#70232B] transition-all ${errors.category ? 'border-red-500' : 'border-[#EBE6D8]'}`}
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
              <label className="block text-sm font-medium text-[#8C7A70] mb-1">Precio *</label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={`w-full p-3 rounded-xl border bg-[#F7F5EE] focus:outline-none focus:ring-2 focus:ring-[#70232B]/20 focus:border-[#70232B] transition-all ${errors.price ? 'border-red-500' : 'border-[#EBE6D8]'}`}
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8C7A70] mb-1">Precio Original (opcional)</label>
              <input
                type="number"
                step="0.01"
                name="original_price"
                value={formData.original_price}
                onChange={handleChange}
                className="w-full p-3 rounded-xl border border-[#EBE6D8] bg-[#F7F5EE] focus:outline-none focus:ring-2 focus:ring-[#70232B]/20 focus:border-[#70232B] transition-all"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#8C7A70] mb-1">Descripción *</label>
            <textarea
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`w-full p-3 rounded-xl border bg-[#F7F5EE] focus:outline-none focus:ring-2 focus:ring-[#70232B]/20 focus:border-[#70232B] transition-all ${errors.description ? 'border-red-500' : 'border-[#EBE6D8]'}`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-[#3D2C23] border-b border-[#EBE6D8] pb-2">Detalles del Producto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#8C7A70] mb-1">Bodega (opcional)</label>
              <input
                type="text"
                name="winery"
                value={formData.winery}
                onChange={handleChange}
                className="w-full p-3 rounded-xl border border-[#EBE6D8] bg-[#F7F5EE] focus:outline-none focus:ring-2 focus:ring-[#70232B]/20 focus:border-[#70232B] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8C7A70] mb-1">Año (opcional)</label>
              <input
                type="text"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full p-3 rounded-xl border border-[#EBE6D8] bg-[#F7F5EE] focus:outline-none focus:ring-2 focus:ring-[#70232B]/20 focus:border-[#70232B] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#8C7A70] mb-1">Maridaje (opcional)</label>
            <input
              type="text"
              name="pairing"
              value={formData.pairing}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-[#EBE6D8] bg-[#F7F5EE] focus:outline-none focus:ring-2 focus:ring-[#70232B]/20 focus:border-[#70232B] transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#8C7A70] mb-1">Stock</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full p-3 rounded-xl border border-[#EBE6D8] bg-[#F7F5EE] focus:outline-none focus:ring-2 focus:ring-[#70232B]/20 focus:border-[#70232B] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8C7A70] mb-1">Etiqueta (opc.) ej: Novedad</label>
              <input
                type="text"
                name="badge"
                value={formData.badge}
                onChange={handleChange}
                className="w-full p-3 rounded-xl border border-[#EBE6D8] bg-[#F7F5EE] focus:outline-none focus:ring-2 focus:ring-[#70232B]/20 focus:border-[#70232B] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8C7A70] mb-1">Desc. Etiqueta (opc.) ej: -20%</label>
              <input
                type="text"
                name="discount_badge"
                value={formData.discount_badge}
                onChange={handleChange}
                className="w-full p-3 rounded-xl border border-[#EBE6D8] bg-[#F7F5EE] focus:outline-none focus:ring-2 focus:ring-[#70232B]/20 focus:border-[#70232B] transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="is_visible"
              name="is_visible"
              checked={formData.is_visible}
              onChange={handleChange}
              className="w-4 h-4 text-[#70232B] bg-[#F7F5EE] border-[#EBE6D8] rounded focus:ring-[#70232B]"
            />
            <label htmlFor="is_visible" className="text-sm font-medium text-[#3D2C23]">
              Visible en la tienda
            </label>
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-[#3D2C23] border-b border-[#EBE6D8] pb-2">Imagen del Producto</h2>
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#8C7A70] mb-2">
                Subir Imagen {(!isEditing && !imageFile) && '*'}
              </label>
              <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-[#F7F5EE] hover:bg-[#EBE6D8]/50 transition-colors ${errors.image ? 'border-red-500' : 'border-[#EBE6D8]'}`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-6 h-6 mb-2 text-[#8C7A70]" />
                  <p className="text-sm text-[#8C7A70]">Hacé clic para subir o arrastrá la imagen</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
              {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
            </div>
            {imagePreview ? (
              <div className="w-32 h-32 rounded-xl border border-[#EBE6D8] overflow-hidden bg-[#F7F5EE] flex-shrink-0 flex items-center justify-center">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-xl border border-[#EBE6D8] border-dashed bg-[#F7F5EE] flex-shrink-0 flex items-center justify-center text-[#8C7A70]">
                <ImageIcon className="w-8 h-8 opacity-50" />
              </div>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-[#EBE6D8] flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-[#70232B] text-white px-6 py-3 rounded-xl hover:bg-[#8b2b35] transition-colors disabled:opacity-70 disabled:cursor-not-allowed font-medium shadow-sm"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>{loading ? 'Guardando...' : 'Guardar Producto'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
