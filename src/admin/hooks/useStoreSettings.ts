import { useEffect, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { insforge } from '../../lib/insforge';
import { storageService } from '../../services/storageService';

export type ImageField = 'logo' | 'hero_bg_image' | 'about_main_image' | 'about_sub_image';

export interface StoreSettingsData {
  name: string; tagline: string; logo: string;
  phone: string; whatsapp_number: string; email: string; address: string; instagram_url: string;
  show_phone: boolean; show_whatsapp: boolean; show_email: boolean; show_address: boolean; show_instagram: boolean;
  hours_weekdays: string; hours_saturday: string; hours_sunday: string;
  hero_badge: string; hero_title: string; hero_subtitle: string; hero_bg_image: string;
  about_title: string; about_quote: string; about_quote_author: string;
  about_paragraph_1: string; about_paragraph_2: string; about_paragraph_3: string;
  about_main_image: string; about_sub_image: string;
  stat_years: string; stat_producers: string; stat_products: string;
}

export const EMPTY_STORE_SETTINGS: StoreSettingsData = {
  name: '', tagline: '', logo: '', phone: '', whatsapp_number: '', email: '', address: '', instagram_url: '',
  show_phone: true, show_whatsapp: true, show_email: true, show_address: true, show_instagram: true,
  hours_weekdays: '', hours_saturday: '', hours_sunday: '',
  hero_badge: '', hero_title: '', hero_subtitle: '', hero_bg_image: '',
  about_title: '', about_quote: '', about_quote_author: '',
  about_paragraph_1: '', about_paragraph_2: '', about_paragraph_3: '',
  about_main_image: '', about_sub_image: '',
  stat_years: '', stat_producers: '', stat_products: '',
};

const IMAGE_FIELDS: ImageField[] = ['logo', 'hero_bg_image', 'about_main_image', 'about_sub_image'];

const isHttpsUrl = (value: string) => {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

const errorMessage = (err: unknown, fallback: string) => (err instanceof Error && err.message ? err.message : fallback);

/** Carga y guarda `store_info` (id 1); comprime y sube las imágenes nuevas antes del upsert. */
export const useStoreSettings = () => {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState<StoreSettingsData>(EMPTY_STORE_SETTINGS);
  const [files, setFiles] = useState<Partial<Record<ImageField, File | Blob>>>({});
  const [previews, setPreviews] = useState<Partial<Record<ImageField, string>>>({});

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const { data, error } = await insforge.database.from('store_info').select('*').eq('id', 1).single();
        if (error && error.code !== 'PGRST116') throw error;
        if (data) {
          const row = data as Partial<StoreSettingsData>;
          setFormData({ ...EMPTY_STORE_SETTINGS, ...row });
          setPreviews({
            logo: row.logo || '',
            hero_bg_image: row.hero_bg_image || '',
            about_main_image: row.about_main_image || '',
            about_sub_image: row.about_sub_image || '',
          });
        }
      } catch (err: unknown) {
        console.error('Error fetching store info:', err);
        setErrorMsg(errorMessage(err, 'Error fetching store settings'));
      } finally {
        setLoading(false);
      }
    };
    fetchStoreInfo();
  }, []);

  const setField = <K extends keyof StoreSettingsData>(key: K, value: StoreSettingsData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setErrorMsg('');
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: ImageField) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      // Sin web worker: el worker carga la librería desde un CDN externo que la CSP bloquea
      const compressed = await imageCompression(file, { maxSizeMB: 0.3, maxWidthOrHeight: 1600, useWebWorker: false });
      setFiles(prev => ({ ...prev, [fieldName]: compressed }));
      setPreviews(prev => ({ ...prev, [fieldName]: URL.createObjectURL(compressed) }));
    } catch (error) {
      console.error('Error compressing image:', error);
      setFiles(prev => ({ ...prev, [fieldName]: file }));
      setPreviews(prev => ({ ...prev, [fieldName]: URL.createObjectURL(file) }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const instagramUrl = formData.instagram_url.trim();
    if (instagramUrl && !isHttpsUrl(instagramUrl)) {
      setErrorMsg('El perfil de Instagram debe ser una URL que empiece con https://');
      return;
    }
    setSaving(true);

    try {
      const updated: StoreSettingsData = { ...formData };
      for (const field of IMAGE_FIELDS) {
        const file = files[field];
        if (file) updated[field] = await storageService.uploadProductImage(file);
      }

      const { error } = await insforge.database.from('store_info').upsert({ ...updated, id: 1 });
      if (error) throw error;

      setFormData(updated);
      setSuccessMsg('Configuración guardada correctamente');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      console.error('Error updating store info:', err);
      setErrorMsg(errorMessage(err, 'Error al guardar la configuración'));
    } finally {
      setSaving(false);
    }
  };

  return { formData, previews, loading, saving, errorMsg, successMsg, setField, handleChange, handleImageChange, handleSave };
};