import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Loader2, Store, Phone, Mail, MapPin, Clock, LayoutTemplate, Info, Upload, Image as ImageIcon } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export const SettingsForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState<any>({
    name: '', tagline: '', logo: '', phone: '', whatsapp_number: '', email: '', address: '',
    hours_weekdays: '', hours_saturday: '', hours_sunday: '',
    hero_badge: '', hero_title: '', hero_subtitle: '', hero_bg_image: '',
    about_title: '', about_quote: '', about_quote_author: '',
    about_paragraph_1: '', about_paragraph_2: '', about_paragraph_3: '',
    about_main_image: '', about_sub_image: '',
    stat_years: '', stat_producers: '', stat_products: '',
  });

  const [files, setFiles] = useState<{ [key: string]: File | Blob | null }>({});
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const { data, error } = await supabase.from('store_info').select('*').eq('id', 1).single();
        if (error && error.code !== 'PGRST116') throw error;
        if (data) {
          setFormData(data);
          setPreviews({
            logo: data.logo || '',
            hero_bg_image: data.hero_bg_image || '',
            about_main_image: data.about_main_image || '',
            about_sub_image: data.about_sub_image || ''
          });
        }
      } catch (err: any) {
        console.error('Error fetching store info:', err);
        setErrorMsg(err.message || 'Error fetching store settings');
      } finally {
        setFetching(false);
      }
    };
    fetchStoreInfo();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const options = { maxSizeMB: 0.3, maxWidthOrHeight: 1600, useWebWorker: true };
        const compressed = await imageCompression(file, options);
        setFiles(prev => ({ ...prev, [fieldName]: compressed }));
        setPreviews(prev => ({ ...prev, [fieldName]: URL.createObjectURL(compressed) }));
      } catch (error) {
        console.error('Error compressing image:', error);
        setFiles(prev => ({ ...prev, [fieldName]: file }));
        setPreviews(prev => ({ ...prev, [fieldName]: URL.createObjectURL(file) }));
      }
    }
  };

  const uploadFile = async (file: File | Blob): Promise<string> => {
    const ext = file instanceof File ? file.name.split('.').pop() : 'jpg';
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const updatedFormData = { ...formData };
      
      const imageFields = ['logo', 'hero_bg_image', 'about_main_image', 'about_sub_image'];
      for (const field of imageFields) {
        if (files[field]) {
          const url = await uploadFile(files[field]!);
          updatedFormData[field] = url;
        }
      }

      const { error } = await supabase.from('store_info').upsert({ ...updatedFormData, id: 1 });
      if (error) throw error;
      
      setFormData(updatedFormData);
      setSuccessMsg('Configuración guardada correctamente');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error('Error updating store info:', err);
      setErrorMsg(err.message || 'Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const renderImageUpload = (name: string, label: string) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-terruno-muted">{label}</label>
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="flex-1 w-full">
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-terruno-border border-dashed rounded-xl cursor-pointer bg-terruno-bg hover:bg-terruno-border/50 transition-colors">
            <div className="flex flex-col items-center justify-center">
              <Upload className="w-5 h-5 mb-1 text-terruno-muted" />
              <p className="text-xs text-terruno-muted">Clic para subir foto</p>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, name)} />
          </label>
        </div>
        {previews[name] ? (
          <div className="w-24 h-24 rounded-xl border border-terruno-border overflow-hidden bg-terruno-bg flex-shrink-0">
            <img src={previews[name]} alt="Preview" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-xl border border-terruno-border border-dashed bg-terruno-bg flex-shrink-0 flex items-center justify-center text-terruno-muted">
            <ImageIcon className="w-6 h-6 opacity-50" />
          </div>
        )}
      </div>
    </div>
  );

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-terruno-burgundy animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-serif font-bold text-terruno-brown">Configuración de la Tienda</h1>
      </div>

      {errorMsg && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">{errorMsg}</div>}
      {successMsg && <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-100">{successMsg}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-terruno-border p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2 text-terruno-burgundy border-b border-terruno-border pb-4">
            <Store className="w-5 h-5" />
            <h2 className="text-lg font-medium text-terruno-brown">Información Básica</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-terruno-muted mb-1">Nombre de la Tienda</label>
              <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full p-3 rounded-xl border border-terruno-border bg-terruno-bg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-terruno-muted mb-1">Eslogan</label>
              <input type="text" name="tagline" value={formData.tagline || ''} onChange={handleChange} className="w-full p-3 rounded-xl border border-terruno-border bg-terruno-bg" />
            </div>
          </div>
          {renderImageUpload('logo', 'Logo de la Tienda')}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-terruno-border p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2 text-terruno-burgundy border-b border-terruno-border pb-4">
            <Phone className="w-5 h-5" />
            <h2 className="text-lg font-medium text-terruno-brown">Contacto y Ubicación</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-terruno-muted mb-1">Teléfono (Visible)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full pl-10 p-3 rounded-xl border border-terruno-border bg-terruno-bg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-terruno-muted mb-1">Número de WhatsApp</label>
              <input type="text" name="whatsapp_number" placeholder="ej. +5493525518649" value={formData.whatsapp_number || ''} onChange={handleChange} className="w-full p-3 rounded-xl border border-terruno-border bg-terruno-bg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-terruno-muted mb-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full pl-10 p-3 rounded-xl border border-terruno-border bg-terruno-bg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-terruno-muted mb-1">Dirección Física</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input type="text" name="address" value={formData.address || ''} onChange={handleChange} className="w-full pl-10 p-3 rounded-xl border border-terruno-border bg-terruno-bg" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-terruno-border p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2 text-terruno-burgundy border-b border-terruno-border pb-4">
            <Clock className="w-5 h-5" />
            <h2 className="text-lg font-medium text-terruno-brown">Horarios de Atención</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-terruno-muted mb-1">Lunes a Viernes</label>
              <input type="text" name="hours_weekdays" value={formData.hours_weekdays || ''} onChange={handleChange} className="w-full p-3 rounded-xl border border-terruno-border bg-terruno-bg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-terruno-muted mb-1">Sábados</label>
              <input type="text" name="hours_saturday" value={formData.hours_saturday || ''} onChange={handleChange} className="w-full p-3 rounded-xl border border-terruno-border bg-terruno-bg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-terruno-muted mb-1">Domingos</label>
              <input type="text" name="hours_sunday" value={formData.hours_sunday || ''} onChange={handleChange} className="w-full p-3 rounded-xl border border-terruno-border bg-terruno-bg" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-terruno-border p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2 text-terruno-burgundy border-b border-terruno-border pb-4">
            <LayoutTemplate className="w-5 h-5" />
            <h2 className="text-lg font-medium text-terruno-brown">Sección Principal (Inicio)</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-terruno-muted mb-1">Etiqueta Principal (Badge)</label>
              <input type="text" name="hero_badge" value={formData.hero_badge || ''} onChange={handleChange} className="w-full p-3 rounded-xl border border-terruno-border bg-terruno-bg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-terruno-muted mb-1">Título Principal</label>
              <input type="text" name="hero_title" value={formData.hero_title || ''} onChange={handleChange} className="w-full p-3 rounded-xl border border-terruno-border bg-terruno-bg" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-terruno-muted mb-1">Subtítulo</label>
            <input type="text" name="hero_subtitle" value={formData.hero_subtitle || ''} onChange={handleChange} className="w-full p-3 rounded-xl border border-terruno-border bg-terruno-bg" />
          </div>
          {renderImageUpload('hero_bg_image', 'Imagen de Fondo')}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-terruno-border p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2 text-terruno-burgundy border-b border-terruno-border pb-4">
            <Info className="w-5 h-5" />
            <h2 className="text-lg font-medium text-terruno-brown">Sección "Nuestra Historia"</h2>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-terruno-muted mb-1">Título de "Nuestra Historia"</label>
            <input type="text" name="about_title" value={formData.about_title || ''} onChange={handleChange} className="w-full p-3 rounded-xl border border-terruno-border bg-terruno-bg" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-terruno-muted mb-1">Cita / Frase</label>
              <textarea name="about_quote" rows={3} value={formData.about_quote || ''} onChange={handleChange} className="w-full p-3 rounded-xl border border-terruno-border bg-terruno-bg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-terruno-muted mb-1">Autor de la Frase</label>
              <input type="text" name="about_quote_author" value={formData.about_quote_author || ''} onChange={handleChange} className="w-full p-3 rounded-xl border border-terruno-border bg-terruno-bg" />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-terruno-muted mb-1">Párrafo 1</label>
              <textarea name="about_paragraph_1" rows={3} value={formData.about_paragraph_1 || ''} onChange={handleChange} className="w-full p-3 rounded-xl border border-terruno-border bg-terruno-bg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-terruno-muted mb-1">Párrafo 2</label>
              <textarea name="about_paragraph_2" rows={3} value={formData.about_paragraph_2 || ''} onChange={handleChange} className="w-full p-3 rounded-xl border border-terruno-border bg-terruno-bg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-terruno-muted mb-1">Párrafo 3</label>
              <textarea name="about_paragraph_3" rows={3} value={formData.about_paragraph_3 || ''} onChange={handleChange} className="w-full p-3 rounded-xl border border-terruno-border bg-terruno-bg" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderImageUpload('about_main_image', 'Imagen Principal')}
            {renderImageUpload('about_sub_image', 'Imagen Secundaria')}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-terruno-muted mb-1">Estadística: Años</label>
              <input type="text" name="stat_years" value={formData.stat_years || ''} onChange={handleChange} className="w-full p-3 rounded-xl border border-terruno-border bg-terruno-bg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-terruno-muted mb-1">Estadística: Productores</label>
              <input type="text" name="stat_producers" value={formData.stat_producers || ''} onChange={handleChange} className="w-full p-3 rounded-xl border border-terruno-border bg-terruno-bg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-terruno-muted mb-1">Estadística: Productos</label>
              <input type="text" name="stat_products" value={formData.stat_products || ''} onChange={handleChange} className="w-full p-3 rounded-xl border border-terruno-border bg-terruno-bg" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-terruno-burgundy text-white px-8 py-3 rounded-xl hover:bg-terruno-burgundy-light transition-colors disabled:opacity-70 disabled:cursor-not-allowed font-medium shadow-sm"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsForm;
